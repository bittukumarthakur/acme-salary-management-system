/**
 * Integration tests for PUT /api/v1/employees/:id endpoint.
 * Tests the API contract using mocked Prisma Client (no real database).
 *
 * Mocking approach: jest.mock() intercepts Prisma imports at the test environment level.
 * Reference: https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing\#singleton
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../lib/prisma';
import type {
  Prisma,
  Department,
  Designation,
  Employee,
  EmployeeSalaryStructure,
} from '../../generated/prisma/client';
import {
  validUpdatePayload,
  invalidPayloadWithEmployeeId,
  payloadFor404Test,
  invalidPayloadWithEarlyEffectiveDate,
  payloadWithConflictingEmail,
  payloadWithChangedSalary,
  payloadWithSameDateSalaryChange,
  payloadWithUnchangedSalary,
  invalidPayloadWithInvalidEnum,
  payloadForOrmTypeCheck,
} from '../data/updatePayloads';

// jest.mock() in jest.setup.ts has already mocked the prisma import
// We use jest.mocked() to get the mock instance for assertions
const prismaMock = jest.mocked(prisma);

const app = createApp();

const mockDepartment: Department = {
  id: 'DEPT001',
  name: 'ENGINEERING',
  description: null,
  managerEmployeeId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockDesignation: Designation = {
  id: 'DES001',
  title: 'SENIOR_DEVELOPER',
  description: null,
  level: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function createMockEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    employeeId: 'EMP0001',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+91 99999 11111',
    dateOfBirth: null,
    gender: null,
    country: 'India',
    departmentId: mockDepartment.id,
    designationId: mockDesignation.id,
    employmentType: 'PERMANENT',
    joiningDate: new Date('2022-01-15'),
    status: 'ACTIVE',
    avatarUrl: null,
    basicSalary: 60000,
    currency: 'INR',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createMockSalaryStructure(
  overrides: Partial<EmployeeSalaryStructure> = {},
): EmployeeSalaryStructure {
  return {
    id: 1,
    employeeId: 1,
    basicSalary: 60000,
    effectiveDate: new Date('2024-04-01'),
    endDate: null,
    currency: 'INR',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    department: { select: { id: true; name: true } };
    designation: { select: { id: true; title: true } };
  };
}>;

function createMockEmployeeWithRelations(
  overrides: Partial<Employee> = {},
): EmployeeWithRelations {
  return {
    ...createMockEmployee(overrides),
    department: {
      id: mockDepartment.id,
      name: mockDepartment.name,
    },
    designation: {
      id: mockDesignation.id,
      title: mockDesignation.title,
    },
  };
}

describe('PUT /api/v1/employees/:id - Update Employee (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: AC1 - Valid payload updates basic info and returns 200 OK
   */
  describe('Valid payload updates basic info and returns 200 OK', () => {
    it('should update employee basic information and return 200 OK', async () => {
      const mockEmployeeId = 1;

      // Mock the first findUnique call (by id) to get the existing employee
      prismaMock.employee.findUnique.mockResolvedValueOnce(
        createMockEmployee({ id: mockEmployeeId }),
      );

      // Mock the second findUnique call (by email) - should return null (no conflict)
      prismaMock.employee.findUnique.mockResolvedValueOnce(null);

      // Mock department lookup
      prismaMock.department.findFirst.mockResolvedValue(mockDepartment);

      // Mock designation lookup
      prismaMock.designation.findFirst.mockResolvedValue(mockDesignation);

      // Mock employee update (returns void)
      prismaMock.employee.update.mockResolvedValue(
        createMockEmployee({ id: mockEmployeeId }),
      );

      // Mock findUniqueOrThrow with relationships
      prismaMock.employee.findUniqueOrThrow.mockResolvedValue(
        createMockEmployeeWithRelations({
          id: mockEmployeeId,
          name: 'Jane Doe',
          email: 'jane@example.com',
          phoneNumber: '+91 98765 43210',
        }),
      );

      // Mock existing salary check
      prismaMock.employeeSalaryStructure.findFirst
        .mockResolvedValueOnce(null) // No existing entry with same effectiveDate
        .mockResolvedValueOnce(
          createMockSalaryStructure({
            id: 1,
            employeeId: mockEmployeeId,
            basicSalary: 60000,
            effectiveDate: new Date('2022-01-15'),
          }),
        ); // Previous salary entry

      prismaMock.employeeSalaryStructure.create.mockResolvedValue(
        createMockSalaryStructure({
          id: 2,
          employeeId: mockEmployeeId,
          basicSalary: 60000,
          effectiveDate: new Date('2024-04-01'),
        }),
      );

      const response = await request(app)
        .put(`/api/v1/employees/${mockEmployeeId}`)
        .send(validUpdatePayload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fullName', 'Jane Doe');
      expect(response.body).toHaveProperty('email', 'jane@example.com');
      expect(response.body).toHaveProperty('phone', '+91 98765 43210');
      expect(prismaMock.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateOfBirth: new Date('1990-05-20'),
            gender: 'FEMALE',
          }),
        }),
      );
    });
  });

  describe('Reject employeeId in body with 400', () => {
    it('should reject employeeId in request body', async () => {
      const response = await request(app)
        .put('/api/v1/employees/1')
        .send(invalidPayloadWithEmployeeId)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/employeeId.*read-only/i);
    });
  });

  describe('404 for unknown employee', () => {
    it('should return 404 when employee does not exist', async () => {
      prismaMock.employee.findUnique.mockResolvedValue(null);

      await request(app)
        .put('/api/v1/employees/99999')
        .send(payloadFor404Test)
        .expect(404);
    });
  });

  describe('400 if effectiveFrom before joiningDate', () => {
    it('should reject salary when effectiveFrom is before joiningDate', async () => {
      const response = await request(app)
        .put('/api/v1/employees/1')
        .send(invalidPayloadWithEarlyEffectiveDate)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/effectiveFrom.*joiningDate/i);
    });
  });

  describe('409 if email already used by another employee', () => {
    it('should reject update when email is already used by another employee', async () => {
      const mockEmployeeId = 2;

      // First call to get the employee being updated
      prismaMock.employee.findUnique.mockResolvedValueOnce(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0005',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          phoneNumber: '+91 99999 22222',
          basicSalary: 70000,
          joiningDate: new Date('2021-08-01'),
        }),
      );

      // Second call to check for email conflict - return another employee
      prismaMock.employee.findUnique.mockResolvedValueOnce(
        createMockEmployee({
          id: 3,
          employeeId: 'EMP0004',
          name: 'David Lee',
          email: 'existing@example.com',
          phoneNumber: '+91 99999 33333',
          basicSalary: 75000,
          joiningDate: new Date('2020-05-01'),
        }),
      );

      const response = await request(app)
        .put(`/api/v1/employees/${mockEmployeeId}`)
        .send(payloadWithConflictingEmail)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('New salary history entry created if salary fields differ', () => {
    it('should append a new revision and close the previous one when salary changes', async () => {
      const mockEmployeeId = 4;

      prismaMock.employee.findUnique.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          name: 'Frank Miller',
          email: 'frank@example.com',
          phoneNumber: '+91 99999 44444',
          basicSalary: 50000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      // Mock department and designation lookups
      prismaMock.department.findFirst.mockResolvedValue(mockDepartment);
      prismaMock.designation.findFirst.mockResolvedValue(mockDesignation);

      // Mock employee update
      prismaMock.employee.update.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          name: 'Frank Miller',
          email: 'frank@example.com',
          phoneNumber: '+91 99999 44444',
          basicSalary: 65000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      // Mock findUniqueOrThrow
      prismaMock.employee.findUniqueOrThrow.mockResolvedValue(
        createMockEmployeeWithRelations({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          name: 'Frank Miller',
          email: 'frank@example.com',
          phoneNumber: '+91 99999 44444',
          basicSalary: 65000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      const currentRevision = createMockSalaryStructure({
        id: 3,
        employeeId: mockEmployeeId,
        basicSalary: 50000,
        effectiveDate: new Date('2020-01-01'),
        endDate: null,
      });
      const newRevision = createMockSalaryStructure({
        id: 4,
        employeeId: mockEmployeeId,
        basicSalary: 65000,
        effectiveDate: new Date('2024-04-01'),
      });

      prismaMock.employeeSalaryStructure.findFirst
        .mockResolvedValueOnce(currentRevision) // current/latest revision
        .mockResolvedValueOnce(newRevision); // latest revision for response

      prismaMock.employeeSalaryStructure.create.mockResolvedValue(newRevision);
      prismaMock.employeeSalaryStructure.update.mockResolvedValue(currentRevision);

      await request(app)
        .put(`/api/v1/employees/${mockEmployeeId}`)
        .send(payloadWithChangedSalary)
        .expect(200);

      // Appends a brand new revision on the new effective date
      expect(prismaMock.employeeSalaryStructure.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeId: mockEmployeeId,
            basicSalary: 65000,
            effectiveDate: new Date('2024-04-01'),
          }),
        }),
      );
      // Closes the previous revision's open-ended timeline
      expect(prismaMock.employeeSalaryStructure.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: currentRevision.id },
          data: { endDate: new Date('2024-04-01') },
        }),
      );
    });
  });

  describe('Same-date salary change appends a new revision (preserves history)', () => {
    it('should close the current revision and append a new one on the same date', async () => {
      const mockEmployeeId = 4;

      prismaMock.employee.findUnique.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          name: 'Frank Miller',
          email: 'frank@example.com',
          phoneNumber: '+91 99999 44444',
          basicSalary: 50000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      prismaMock.department.findFirst.mockResolvedValue(mockDepartment);
      prismaMock.designation.findFirst.mockResolvedValue(mockDesignation);
      prismaMock.employee.update.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          basicSalary: 65000,
          joiningDate: new Date('2020-01-01'),
        }),
      );
      prismaMock.employee.findUniqueOrThrow.mockResolvedValue(
        createMockEmployeeWithRelations({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          basicSalary: 65000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      const currentRevision = createMockSalaryStructure({
        id: 3,
        employeeId: mockEmployeeId,
        basicSalary: 50000,
        effectiveDate: new Date('2020-01-01'),
        endDate: null,
      });
      const newRevision = createMockSalaryStructure({
        id: 4,
        employeeId: mockEmployeeId,
        basicSalary: 65000,
        effectiveDate: new Date('2020-01-01'),
      });

      prismaMock.employeeSalaryStructure.findFirst
        .mockResolvedValueOnce(currentRevision) // current/latest revision
        .mockResolvedValueOnce(newRevision); // latest revision for response

      prismaMock.employeeSalaryStructure.create.mockResolvedValue(newRevision);
      prismaMock.employeeSalaryStructure.update.mockResolvedValue(currentRevision);

      await request(app)
        .put(`/api/v1/employees/${mockEmployeeId}`)
        .send(payloadWithSameDateSalaryChange)
        .expect(200);

      // Appends a new revision even though the effective date is unchanged,
      // so the previous amount stays visible in salary history.
      expect(prismaMock.employeeSalaryStructure.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeId: mockEmployeeId,
            basicSalary: 65000,
            effectiveDate: new Date('2020-01-01'),
          }),
        }),
      );
      // Closes the previous revision's open-ended timeline.
      expect(prismaMock.employeeSalaryStructure.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: currentRevision.id },
          data: { endDate: new Date('2020-01-01') },
        }),
      );
    });
  });

  describe('Unchanged salary does not touch salary revisions', () => {
    it('should neither create nor update any salary revision', async () => {
      const mockEmployeeId = 4;

      prismaMock.employee.findUnique.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          name: 'Frank Miller',
          email: 'frank@example.com',
          phoneNumber: '+91 99999 44444',
          basicSalary: 50000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      prismaMock.department.findFirst.mockResolvedValue(mockDepartment);
      prismaMock.designation.findFirst.mockResolvedValue(mockDesignation);
      prismaMock.employee.update.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          basicSalary: 50000,
          joiningDate: new Date('2020-01-01'),
        }),
      );
      prismaMock.employee.findUniqueOrThrow.mockResolvedValue(
        createMockEmployeeWithRelations({
          id: mockEmployeeId,
          employeeId: 'EMP0006',
          basicSalary: 50000,
          joiningDate: new Date('2020-01-01'),
        }),
      );

      const currentRevision = createMockSalaryStructure({
        id: 3,
        employeeId: mockEmployeeId,
        basicSalary: 50000,
        effectiveDate: new Date('2020-01-01'),
        endDate: null,
      });

      prismaMock.employeeSalaryStructure.findFirst
        .mockResolvedValueOnce(currentRevision) // current/latest revision
        .mockResolvedValueOnce(currentRevision); // latest revision for response

      await request(app)
        .put(`/api/v1/employees/${mockEmployeeId}`)
        .send(payloadWithUnchangedSalary)
        .expect(200);

      expect(prismaMock.employeeSalaryStructure.create).not.toHaveBeenCalled();
      expect(prismaMock.employeeSalaryStructure.update).not.toHaveBeenCalled();
    });
  });

  describe('400 for invalid enum values', () => {
    it('should reject update when employmentType is invalid', async () => {
      const response = await request(app)
        .put('/api/v1/employees/1')
        .send(invalidPayloadWithInvalidEnum)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('No ORM types in response', () => {
    it('should not expose ORM types in the response', async () => {
      const mockEmployeeId = 5;

      prismaMock.employee.findUnique.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0009',
          name: 'Iris Anderson',
          email: 'iris@example.com',
          phoneNumber: '+91 99999 55555',
          basicSalary: 80000,
          joiningDate: new Date('2019-03-15'),
        }),
      );

      // Mock department and designation lookups
      prismaMock.department.findFirst.mockResolvedValue(mockDepartment);
      prismaMock.designation.findFirst.mockResolvedValue(mockDesignation);

      // Mock employee update
      prismaMock.employee.update.mockResolvedValue(
        createMockEmployee({
          id: mockEmployeeId,
          employeeId: 'EMP0009',
          name: 'Iris Anderson',
          email: 'iris@example.com',
          phoneNumber: '+91 99999 55555',
          basicSalary: 80000,
          joiningDate: new Date('2019-03-15'),
        }),
      );

      // Mock findUniqueOrThrow
      prismaMock.employee.findUniqueOrThrow.mockResolvedValue(
        createMockEmployeeWithRelations({
          id: mockEmployeeId,
          employeeId: 'EMP0009',
          name: 'Iris Anderson',
          email: 'iris@example.com',
          phoneNumber: '+91 99999 55555',
          basicSalary: 80000,
          joiningDate: new Date('2019-03-15'),
        }),
      );

      prismaMock.employeeSalaryStructure.findFirst
        .mockResolvedValueOnce(null) // No existing entry with same date
        .mockResolvedValueOnce(
          createMockSalaryStructure({
            id: 5,
            employeeId: mockEmployeeId,
            basicSalary: 80000,
            effectiveDate: new Date('2019-03-15'),
          }),
        ); // Previous salary entry

      prismaMock.employeeSalaryStructure.create.mockResolvedValue(
        createMockSalaryStructure({
          id: 6,
          employeeId: mockEmployeeId,
          basicSalary: 80000,
          effectiveDate: new Date('2024-04-01'),
        }),
      );

      const response = await request(app)
        .put(`/api/v1/employees/${mockEmployeeId}`)
        .send(payloadForOrmTypeCheck)
        .expect(200);

      expect(response.body).not.toHaveProperty('id');
      expect(response.body).not.toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('employeeId');
      expect(response.body).toHaveProperty('fullName');
    });
  });
});

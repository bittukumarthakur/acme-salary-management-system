/**
 * Integration tests for PUT /api/v1/employees/:id endpoint.
 * Tests the API contract for the update employee endpoint.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../lib/prisma';

const app = createApp();

describe('PUT /api/v1/employees/:id - Update Employee', () => {
  beforeAll(async () => {
    // Seed test data
    await prisma.department.deleteMany({});
    await prisma.designation.deleteMany({});
    await prisma.employee.deleteMany({});

    // Create lookup data
    await prisma.department.create({
      data: { id: 'DEPT001', name: 'ENGINEERING' },
    });
    await prisma.designation.create({
      data: { id: 'DES001', title: 'SENIOR_DEVELOPER' },
    });
  });

  afterAll(async () => {
    await prisma.employee.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.designation.deleteMany({});
    await prisma.$disconnect();
  });

  describe('AC1: Valid payload updates basic info and returns 200 OK', () => {
    it('should update employee basic information and return 200 with updated employee object', async () => {
      // Create an employee to update
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0001',
          name: 'John Doe',
          email: 'john@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2022-01-15'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 60000,
          currency: 'INR',
        },
      });

      const updatePayload = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2022-01-15',
        country: 'India',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 60000,
          effectiveFrom: '2024-04-01',
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(updatePayload);

      if (response.status !== 200) {
        console.error('Unexpected status:', response.status);
        console.error('Response body:', JSON.stringify(response.body, null, 2));
      }
      
      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('fullName', 'Jane Doe');
      expect(response.body).toHaveProperty('email', 'jane@example.com');
      expect(response.body).toHaveProperty('phone', '+91 98765 43210');
      expect(response.body).toHaveProperty('salary');
      expect(response.body.salary).toHaveProperty('baseMonthlySalary', 60000);
    });
  });

  describe('AC4: Reject employeeId in body with 400', () => {
    it('should return 400 Bad Request when employeeId is in request body', async () => {
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0002',
          name: 'Bob Smith',
          email: 'bob@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2020-06-10'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 65000,
          currency: 'INR',
        },
      });

      const invalidPayload = {
        employeeId: 'EMP9999', // Should not be allowed
        fullName: 'Bob Smith Updated',
        email: 'bob.updated@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2020-06-10',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 65000,
          effectiveFrom: '2024-04-01',
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/employeeId.*read-only/i);
    });
  });

  describe('AC5: 404 for unknown employee', () => {
    it('should return 404 Not Found when employee does not exist', async () => {
      const updatePayload = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2022-01-15',
        country: 'India',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 60000,
          effectiveFrom: '2024-04-01',
        },
      };

      await request(app)
        .put('/api/v1/employees/99999')
        .send(updatePayload)
        .expect(404);
    });
  });

  describe('AC6: 400 if effectiveFrom before joiningDate', () => {
    it('should return 400 Bad Request when salary effectiveFrom is before joiningDate', async () => {
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0003',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2022-01-15'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 55000,
          currency: 'INR',
        },
      });

      const invalidPayload = {
        fullName: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2022-01-15',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 60000,
          effectiveFrom: '2021-12-31', // Before joining date
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/effectiveFrom.*joiningDate/i);
    });
  });

  describe('AC7: 409 if email already used by another employee', () => {
    it('should return 409 Conflict when email is already used by another employee', async () => {
      const employee1 = await prisma.employee.create({
        data: {
          employeeId: 'EMP0004',
          name: 'David Lee',
          email: 'david@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2020-05-01'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 75000,
          currency: 'INR',
        },
      });

      const employee2 = await prisma.employee.create({
        data: {
          employeeId: 'EMP0005',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2021-08-01'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 70000,
          currency: 'INR',
        },
      });

      // Try to update employee2 to use employee1's email
      const conflictPayload = {
        fullName: 'Emma Wilson',
        email: 'david@example.com', // Already used by employee1
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2021-08-01',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 70000,
          effectiveFrom: '2024-04-01',
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee2.id}`)
        .send(conflictPayload)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email.*use/i);
    });
  });

  describe('AC2: New salary history entry created if salary fields differ', () => {
    it('should create a new salary history entry when baseMonthlySalary changes', async () => {
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0006',
          name: 'Frank Miller',
          email: 'frank@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2020-01-01'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 50000,
          currency: 'INR',
        },
      });

      const updatePayload = {
        fullName: 'Frank Miller',
        email: 'frank@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2020-01-01',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 65000, // New salary
          effectiveFrom: '2024-04-01',
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(updatePayload)
        .expect(200);

      // Verify salary entry was created
      const salaryHistory = await prisma.employeeSalaryStructure.findMany({
        where: { employeeId: employee.id },
      });

      expect(salaryHistory.length).toBeGreaterThan(0);
      const latestSalary = salaryHistory[salaryHistory.length - 1];
      expect(latestSalary.basicSalary).toBe(65000);
    });
  });

  describe('AC3: No new entry if salary unchanged (idempotent)', () => {
    it('should not create a new salary entry when salary is unchanged', async () => {
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0007',
          name: 'Grace Johnson',
          email: 'grace@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2020-06-01'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 60000,
          currency: 'INR',
        },
      });

      // Create an initial salary record
      await prisma.employeeSalaryStructure.create({
        data: {
          employeeId: employee.id,
          basicSalary: 60000,
          effectiveDate: new Date('2024-04-01'),
          currency: 'INR',
        },
      });

      const initialCount = await prisma.employeeSalaryStructure.count({
        where: { employeeId: employee.id },
      });

      // Update with the same salary
      const updatePayload = {
        fullName: 'Grace Johnson',
        email: 'grace@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2020-06-01',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 60000, // Same as before
          effectiveFrom: '2024-04-01',
        },
      };

      await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(updatePayload)
        .expect(200);

      const finalCount = await prisma.employeeSalaryStructure.count({
        where: { employeeId: employee.id },
      });

      // Should not have created a new entry
      expect(finalCount).toBe(initialCount);
    });
  });

  describe('AC8: 400 for invalid enum values', () => {
    it('should return 400 Bad Request when employmentType is invalid', async () => {
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0008',
          name: 'Henry Davis',
          email: 'henry@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2021-01-01'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 55000,
          currency: 'INR',
        },
      });

      const invalidPayload = {
        fullName: 'Henry Davis',
        email: 'henry@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'FULL_TIME', // Invalid enum
        status: 'ACTIVE',
        joiningDate: '2021-01-01',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 55000,
          effectiveFrom: '2024-04-01',
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('AC9: No ORM types in response', () => {
    it('should not expose Prisma/ORM types in the response', async () => {
      const employee = await prisma.employee.create({
        data: {
          employeeId: 'EMP0009',
          name: 'Iris Anderson',
          email: 'iris@example.com',
          country: 'USA',
          departmentId: 'DEPT001',
          designationId: 'DES001',
          joiningDate: new Date('2019-03-15'),
          status: 'ACTIVE',
          employmentType: 'PERMANENT',
          basicSalary: 80000,
          currency: 'INR',
        },
      });

      const updatePayload = {
        fullName: 'Iris Anderson',
        email: 'iris@example.com',
        phone: '+91 98765 43210',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2019-03-15',
        country: 'USA',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 80000,
          effectiveFrom: '2024-04-01',
        },
      };

      const response = await request(app)
        .put(`/api/v1/employees/${employee.id}`)
        .send(updatePayload)
        .expect(200);

      // Check that ORM fields are not exposed
      expect(response.body).not.toHaveProperty('id');
      expect(response.body).not.toHaveProperty('createdAt');
      // updatedAt is part of the API contract (not an ORM field), so it should be present
      expect(response.body).toHaveProperty('employeeId');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('updatedAt');
    });
  });
});

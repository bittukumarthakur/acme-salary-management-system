import { prisma } from '../../lib/prisma';

/**
 * Base employee data for testing.
 * Extend or override specific fields for test cases.
 */
export const baseEmployeeData = {
  country: 'USA',
  departmentId: 'DEPT001',
  designationId: 'DES001',
  status: 'ACTIVE' as const,
  employmentType: 'PERMANENT' as const,
  currency: 'INR',
};

/**
 * Helper to create a test employee with minimal setup.
 * @param overrides - Fields to override from base employee data
 */
export async function createTestEmployee(overrides?: {
  employeeId?: string;
  name?: string;
  email?: string;
  joiningDate?: Date;
  basicSalary?: number;
}) {
  const defaults = {
    employeeId: `EMP${Math.random().toString().slice(2, 6)}`,
    name: 'Test Employee',
    email: `test${Date.now()}@example.com`,
    joiningDate: new Date('2022-01-15'),
    basicSalary: 60000,
  };

  return prisma.employee.create({
    data: {
      ...baseEmployeeData,
      ...defaults,
      ...overrides,
    },
  });
}

/**
 * Helper to create two conflicting employees (for email conflict test).
 * Returns [employee1, employee2] both created successfully.
 */
export async function createConflictingEmployees() {
  const employee1 = await prisma.employee.create({
    data: {
      ...baseEmployeeData,
      employeeId: 'EMP0004',
      name: 'David Lee',
      email: 'david@example.com',
      joiningDate: new Date('2020-05-01'),
      basicSalary: 75000,
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      ...baseEmployeeData,
      employeeId: 'EMP0005',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      joiningDate: new Date('2021-08-01'),
      basicSalary: 70000,
    },
  });

  return [employee1, employee2];
}

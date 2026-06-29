import { UpdateEmployeePayload } from '../../src/models/employee/types';

/**
 * Base update payload with common defaults for testing.
 * Extend or override specific fields for test cases.
 */
export const baseUpdatePayload: UpdateEmployeePayload = {
  fullName: 'Updated Employee',
  email: 'updated@example.com',
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

/**
 * Valid update payload for AC1 test.
 * Updates employee basic information.
 */
export const validUpdatePayload: UpdateEmployeePayload = {
  ...baseUpdatePayload,
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+91 98765 43210',
};

/**
 * Invalid payload with employeeId in body (AC4).
 * Should be rejected with 400.
 */
export const invalidPayloadWithEmployeeId = {
  employeeId: 'EMP9999', // Should not be allowed
  ...baseUpdatePayload,
  fullName: 'Bob Smith Updated',
  email: 'bob.updated@example.com',
};

/**
 * Valid update payload for 404 test (AC5).
 * Used with non-existent employee ID.
 */
export const payloadFor404Test: UpdateEmployeePayload = {
  ...baseUpdatePayload,
  fullName: 'Jane Doe',
};

/**
 * Invalid payload with effectiveFrom before joiningDate (AC6).
 * Should be rejected with 400.
 */
export const invalidPayloadWithEarlyEffectiveDate: UpdateEmployeePayload = {
  ...baseUpdatePayload,
  fullName: 'Charlie Brown',
  email: 'charlie@example.com',
  joiningDate: '2022-01-15',
  salary: {
    baseMonthlySalary: 60000,
    effectiveFrom: '2021-12-31', // Before joining date
  },
};

/**
 * Valid update payload for email conflict test (AC7).
 * Used to try updating an employee to use another's email.
 */
export const payloadWithConflictingEmail: UpdateEmployeePayload = {
  ...baseUpdatePayload,
  fullName: 'Emma Wilson',
  email: 'david@example.com', // This will be another employee's email
  joiningDate: '2021-08-01',
};

/**
 * Valid update payload for salary change test (AC2).
 * Updates with a different salary amount.
 */
export const payloadWithChangedSalary: UpdateEmployeePayload = {
  ...baseUpdatePayload,
  fullName: 'Frank Miller',
  email: 'frank@example.com',
  joiningDate: '2020-01-01',
  salary: {
    baseMonthlySalary: 65000, // Different from employee's current
    effectiveFrom: '2024-04-01',
  },
};

/**
 * Invalid payload with invalid employmentType enum (AC8).
 * Should be rejected with 400.
 */
export const invalidPayloadWithInvalidEnum = {
  ...baseUpdatePayload,
  fullName: 'Henry Davis',
  email: 'henry@example.com',
  joiningDate: '2021-01-01',
  employmentType: 'NOT_A_VALID_TYPE',
};

/**
 * Valid update payload for ORM type check test (AC9).
 * Normal update that should only return domain types in response.
 */
export const payloadForOrmTypeCheck: UpdateEmployeePayload = {
  ...baseUpdatePayload,
  fullName: 'Iris Anderson',
  email: 'iris@example.com',
  joiningDate: '2019-03-15',
  salary: {
    baseMonthlySalary: 80000,
    effectiveFrom: '2024-04-01',
  },
};

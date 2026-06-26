import type { EmployeeRow } from '../../src/models/employee';

/**
 * Raw DB-row fixtures. Validated against `EmployeeRow` via `satisfies`, so the
 * shape (including `joiningDate` as a real `Date`) is type-checked. No JSON
 * hydration needed.
 */
export const aliceRow = {
  id: 1,
  employeeId: 'EMP00001',
  name: 'Alice Johnson',
  email: 'alice.johnson@acme.com',
  country: 'USA',
  department: 'Engineering',
  designation: 'Software Engineer',
  employmentType: 'Full-Time',
  joiningDate: new Date('2021-03-15T00:00:00.000Z'),
  status: 'Active',
} satisfies EmployeeRow;

export const priyaRow = {
  id: 3,
  employeeId: 'EMP00003',
  name: 'Priya Patel',
  email: 'priya.patel@acme.com',
  country: 'India',
  department: 'Engineering',
  designation: 'Senior Software Engineer',
  employmentType: 'Full-Time',
  joiningDate: new Date('2019-11-20T00:00:00.000Z'),
  status: 'Active',
} satisfies EmployeeRow;


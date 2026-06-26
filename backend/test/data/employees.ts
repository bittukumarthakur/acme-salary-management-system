import type { Employee } from '../../src/models/employee';

/**
 * API-shaped employee fixtures (domain model). Validated against `Employee`
 * via `satisfies` so missing/renamed fields are caught at compile time.
 */
export const alice = {
  id: 1,
  employeeId: 'EMP00001',
  name: 'Alice Johnson',
  email: 'alice.johnson@acme.com',
  country: 'USA',
  department: 'Engineering',
  designation: 'Software Engineer',
  employmentType: 'Full-Time',
  joiningDate: '2021-03-15',
  status: 'Active',
} satisfies Employee;

export const bob = {
  id: 2,
  employeeId: 'EMP00002',
  name: 'Bob Smith',
  email: 'bob.smith@acme.com',
  country: 'USA',
  department: 'Engineering',
  designation: 'Software Engineer',
  employmentType: 'Full-Time',
  joiningDate: '2021-03-15',
  status: 'Active',
} satisfies Employee;


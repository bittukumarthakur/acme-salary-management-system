import type { EmployeeRow } from '../../src/models/employee';

/**
 * Raw DB-row fixtures (Phase 1 updated).
 * Validated against `EmployeeRow` via `satisfies`, so the shape is type-checked.
 * Includes related objects from Department and Designation tables.
 */
export const aliceRow = {
  id: 1,
  employeeId: 'EMP00001',
  name: 'Alice Johnson',
  email: 'alice.johnson@acme.com',
  country: 'USA',
  departmentId: 'DEPT-ENG',
  department: {
    id: 'DEPT-ENG',
    name: 'ENGINEERING',
  },
  designationId: 'DES-SD',
  designation: {
    id: 'DES-SD',
    title: 'SENIOR_DEVELOPER',
  },
  employmentType: 'Full-Time',
  joiningDate: new Date('2021-03-15T00:00:00.000Z'),
  status: 'ACTIVE',
  basicSalary: 60000,
  currency: 'INR',
  avatarUrl: 'https://example.com/avatars/emp001.png',
} satisfies EmployeeRow;

export const priyaRow = {
  id: 3,
  employeeId: 'EMP00003',
  name: 'Priya Patel',
  email: 'priya.patel@acme.com',
  country: 'India',
  departmentId: 'DEPT-ENG',
  department: {
    id: 'DEPT-ENG',
    name: 'ENGINEERING',
  },
  designationId: 'DES-SD',
  designation: {
    id: 'DES-SD',
    title: 'SENIOR_DEVELOPER',
  },
  employmentType: 'Full-Time',
  joiningDate: new Date('2019-11-20T00:00:00.000Z'),
  status: 'ACTIVE',
  basicSalary: 70000,
  currency: 'INR',
  avatarUrl: 'https://example.com/avatars/emp003.png',
} satisfies EmployeeRow;


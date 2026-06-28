/**
 * API response fixtures for testing.
 */

import type { Employee } from '../../src/models/employee';

export const alice = {
  employeeId: 'EMP001',
  fullName: 'Alice Johnson',
  email: 'alice.johnson@acme.com',
  department: 'ENGINEERING',
  designation: 'SENIOR_DEVELOPER',
  basicSalary: 60000,
  currency: 'INR',
  status: 'ACTIVE',
  joiningDate: '2021-03-15',
  country: 'USA',
  employmentType: 'Full-Time',
  avatarUrl: 'https://example.com/avatars/emp001.png',
} satisfies Employee;

export const bob = {
  employeeId: 'EMP002',
  fullName: 'Bob Smith',
  email: 'bob.smith@acme.com',
  department: 'ENGINEERING',
  designation: 'SENIOR_DEVELOPER',
  basicSalary: 65000,
  currency: 'INR',
  status: 'ACTIVE',
  joiningDate: '2020-06-10',
  country: 'UK',
  employmentType: 'Full-Time',
  avatarUrl: 'https://example.com/avatars/emp002.png',
} satisfies Employee;

export const charlie = {
  employeeId: 'EMP003',
  fullName: 'Charlie Marketing',
  email: 'charlie@acme.com',
  department: 'MARKETING',
  designation: 'MARKETING_MANAGER',
  basicSalary: 55000,
  currency: 'INR',
  status: 'ACTIVE',
  joiningDate: '2022-01-20',
  country: 'India',
  employmentType: 'Full-Time',
} satisfies Employee;

export const inactive = {
  employeeId: 'EMP004',
  fullName: 'Inactive User',
  email: 'inactive@acme.com',
  department: 'FINANCE',
  designation: 'ACCOUNTANT',
  basicSalary: 45000,
  currency: 'INR',
  status: 'INACTIVE',
  joiningDate: '2019-05-01',
  country: 'India',
  employmentType: 'Full-Time',
  avatarUrl: 'https://example.com/avatars/emp004.png',
} satisfies Employee;

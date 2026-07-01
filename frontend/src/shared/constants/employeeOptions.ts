/**
 * Single source of truth for employee select options shared by the Add and
 * Edit employee forms. Values must match the backend enums exactly (see
 * backend `createEmployeePayload/constants.ts`); labels are user-facing.
 */

export interface EmployeeSelectOption {
  value: string
  label: string
}

export const departmentOptions: EmployeeSelectOption[] = [
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HR', label: 'HR' },
  { value: 'SALES', label: 'Sales' },
]

export const employmentTypeOptions: EmployeeSelectOption[] = [
  { value: 'PERMANENT', label: 'Full Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Part Time' },
  { value: 'INTERN', label: 'Intern' },
]

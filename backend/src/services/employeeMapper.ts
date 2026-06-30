/**
 * Employee domain model mapper.
 * Converts database rows to domain models and API responses.
 */

import type {
  Employee,
  EmployeeWithSalary,
  SalaryComponentsBreakdown,
  SalaryInfo,
} from '../models/employee/types';
import type { SalaryHistoryEntry } from '../models/employee/details';
import { calculateNetPayAndCTC } from './salaryCalculation';

/**
 * Maps a Prisma employee row to the domain Employee model.
 * Exposes only the public API shape (no ORM types).
 */
export function toEmployee(row: {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  country: string;
  departmentId: string;
  department?: { id: string; name: string } | null;
  designationId: string;
  designation?: { id: string; title: string } | null;
  employmentType: string;
  joiningDate: Date;
  status: string;
  basicSalary: number;
  currency: string;
  avatarUrl?: string | null;
}): Employee {
  const joiningDateStr =
    row.joiningDate instanceof Date ? row.joiningDate.toISOString().split('T')[0] : row.joiningDate;

  const departmentName = row.department?.name || row.departmentId || '';
  const designationTitle = row.designation?.title || '';

  const employee: Employee = {
    employeeId: row.employeeId,
    fullName: row.name,
    email: row.email,
    department: departmentName,
    designation: designationTitle,
    employmentType: row.employmentType,
    joiningDate: joiningDateStr || '',
    status: row.status,
    basicSalary: row.basicSalary,
    currency: row.currency,
    country: row.country,
  };

  if (row.phoneNumber) {
    employee.phone = row.phoneNumber;
  }

  if (row.avatarUrl) {
    employee.avatarUrl = row.avatarUrl;
  }

  return employee;
}

/**
 * Maps a Prisma employee row with salary details to EmployeeWithSalary response model.
 * Includes calculated salary information and components.
 *
 * @param employeeRow - Prisma employee record
 * @param salaryEntry - Salary history entry
 * @param components - Calculated salary components
 * @returns EmployeeWithSalary domain model
 */
export function toEmployeeWithSalary(
  employeeRow: {
    id: number;
    employeeId: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    country: string;
    departmentId: string;
    department?: { id: string; name: string } | null;
    designationId: string;
    designation?: { id: string; title: string } | null;
    employmentType: string;
    joiningDate: Date;
    status: string;
    basicSalary: number;
    currency: string;
    avatarUrl?: string | null;
    updatedAt: Date;
  },
  salaryEntry: {
    basicSalary: number;
    effectiveDate: Date;
  },
  components: SalaryComponentsBreakdown,
): EmployeeWithSalary {
  // Convert basic employee info
  const employee = toEmployee(employeeRow);

  // Calculate net pay and CTC
  const { netPayMonthly, ctcAnnual } = calculateNetPayAndCTC(salaryEntry.basicSalary, components);

  // Calculate totals
  const totalEarnings = components.earnings.reduce((sum, comp) => sum + comp.amount, 0);
  const totalDeductions = components.deductions.reduce((sum, comp) => sum + comp.amount, 0);

  // Format effective date as YYYY-MM-DD
  const effectiveFromStr =
    salaryEntry.effectiveDate instanceof Date
      ? salaryEntry.effectiveDate.toISOString().split('T')[0]
      : String(salaryEntry.effectiveDate);

  // Build salary info
  const salary: SalaryInfo = {
    baseMonthlySalary: salaryEntry.basicSalary,
    effectiveFrom: effectiveFromStr || '',
    ctcAnnual: Math.round(ctcAnnual * 100) / 100,
    netPayMonthly: Math.round(netPayMonthly * 100) / 100,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    components,
  };

  const updatedAtStr =
    employeeRow.updatedAt instanceof Date
      ? employeeRow.updatedAt.toISOString()
      : String(employeeRow.updatedAt);

  return {
    ...employee,
    salary,
    updatedAt: updatedAtStr || '',
  };
}

/**
 * Builds a salary history entry from salary structure data.
 * Converts DB salary amounts to salary history format.
 *
 * @param salaryStructure - Salary structure record from DB
 * @param components - Salary components for this effective date
 * @param isCurrent - Whether this is the current/latest salary
 * @returns SalaryHistoryEntry for API response
 */
export function toSalaryHistoryEntry(
  salaryStructure: {
    id: number;
    basicSalary: number;
    effectiveDate: Date;
  },
  components: SalaryComponentsBreakdown,
  isCurrent: boolean,
): SalaryHistoryEntry {
  // Convert effective date to ISO format YYYY-MM-DD
  const effectiveFromStr =
    salaryStructure.effectiveDate instanceof Date
      ? salaryStructure.effectiveDate.toISOString().split('T')[0] || ''
      : String(salaryStructure.effectiveDate || '');

  // Calculate earnings and deductions
  const totalEarnings = components.earnings.reduce((sum, comp) => sum + comp.amount, 0);
  const totalDeductions = components.deductions.reduce((sum, comp) => sum + comp.amount, 0);
  const netPayMonthly = totalEarnings - totalDeductions;
  const ctcAnnual = totalEarnings * 12;

  return {
    id: String(salaryStructure.id),
    effectiveFrom: effectiveFromStr,
    baseSalaryMonthly: Math.round(salaryStructure.basicSalary),
    netPayMonthly: Math.round(netPayMonthly),
    ctcAnnual: Math.round(ctcAnnual),
    isCurrent,
  };
}

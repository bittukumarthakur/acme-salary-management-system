import type { Employee, EmployeeRow } from '../models/employee';
import type { EmployeeQuery } from '../models/employee/types';
import { convertSalary } from './currencyConversion';

export function formatGeneratedEmployeeId(id: number): string {
  return `EMP${id.toString().padStart(5, '0')}`;
}

export function mapEmployeeRowToApi(row: EmployeeRow, targetCurrency: string): Employee {
  const salaryConversion = convertSalary(row.basicSalary, targetCurrency);
  const date = row.joiningDate instanceof Date ? row.joiningDate : new Date();
  const joiningDateStr: string = date.toISOString().split('T')[0] as string;

  const departmentName = row.department?.name || row.departmentId || '';
  const designationTitle = row.designation?.title || '';

  const employee: Employee = {
    employeeId: row.employeeId,
    fullName: row.name,
    email: row.email,
    department: departmentName,
    designation: designationTitle,
    basicSalary: salaryConversion.convertedAmount,
    currency: targetCurrency,
    status: row.status,
    joiningDate: joiningDateStr,
    employmentType: row.employmentType,
    country: row.country,
  };

  if (row.avatarUrl) {
    employee.avatarUrl = row.avatarUrl;
  }

  return employee;
}

export function buildEmployeesWhere(query: EmployeeQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { employeeId: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.department) {
    where.department = {
      name: query.department,
    };
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

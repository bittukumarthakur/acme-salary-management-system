/**
 * Service for salary history operations.
 * Fetches and formats salary history for employees.
 */

import { prisma } from '../../lib/prisma';
import type { SalaryHistoryEntry } from '../models/employee/details';
import type { SalaryComponentsBreakdown } from '../models/employee/types';
import { toSalaryHistoryEntry } from './employeeMapper';
import { isValidEmployeeCodeId, normalizeEmployeeCodeId } from '../utils/employeeId';

/**
 * Fetches salary history for an employee.
 * Returns all salary revisions ordered newest-first with current status marker.
 *
 * @param employeeId Employee ID (e.g., 'EMP0001')
 * @returns Array of salary history entries or null if employee not found
 * @throws Error on database failure
 */
export async function getSalaryHistory(employeeId: string): Promise<SalaryHistoryEntry[] | null> {
  const trimmedId = employeeId.trim();
  if (!trimmedId || !isValidEmployeeCodeId(trimmedId)) {
    return null;
  }

  // Fetch employee with all salary structures and components
  const employee = await prisma.employee.findUnique({
    where: { employeeId: normalizeEmployeeCodeId(trimmedId) },
    select: {
      id: true,
      basicSalary: true,
      currency: true,
      updatedAt: true,
      salaryStructures: {
        orderBy: { effectiveDate: 'desc' },
        select: {
          id: true,
          basicSalary: true,
          effectiveDate: true,
        },
      },
      salaryComponents: {
        where: { endDate: null },
        select: {
          amount: true,
          component: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    return null;
  }

  // Calculate earnings and deductions for salary history
  const salaryComponents = employee.salaryComponents ?? [];
  const earnings = salaryComponents
    .filter((item) => item.component.type === 'EARNING')
    .map((item) => ({ name: item.component.name, amount: item.amount }));
  const deductions = salaryComponents
    .filter((item) => item.component.type === 'DEDUCTION')
    .map((item) => ({ name: item.component.name, amount: item.amount }));

  const salaryComponentsBreakdown: SalaryComponentsBreakdown = {
    earnings,
    deductions,
  };

  // Build salary history from salary structures
  const salaryStructures = employee.salaryStructures ?? [];
  const salaryHistory = salaryStructures.map((structure, index) => {
    const isCurrent = index === 0; // First (newest) is current
    return toSalaryHistoryEntry(structure, salaryComponentsBreakdown, isCurrent);
  });

  // Ensure at least one entry in history (current salary)
  if (salaryHistory.length === 0) {
    salaryHistory.push(
      toSalaryHistoryEntry(
        {
          id: 0,
          basicSalary: employee.basicSalary,
          effectiveDate: employee.updatedAt || new Date(),
        },
        salaryComponentsBreakdown,
        true,
      ),
    );
  }

  return salaryHistory;
}

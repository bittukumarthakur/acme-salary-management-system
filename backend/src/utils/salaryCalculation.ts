/**
 * Salary component calculation service.
 * Computes earnings, allowances, and deductions based on basic salary.
 *
 * Note: This is a simplified implementation for MVP.
 * In production, this would be configurable per organization/department.
 */

import type { SalaryComponentsBreakdown } from '../models/employee/types';

/** Employee-share Provident Fund rate applied to basic salary. */
export const PF_RATE = 0.12;

/** Employee-share ESI rate applied to basic salary. */
export const ESI_RATE = 0.0075;

/**
 * Calculates the lean salary breakdown from basic monthly salary.
 *
 * Earnings: Basic Salary plus any additional earning line items (e.g. Allowances).
 * Deductions: PF (12% of basic) and ESI (0.75% of basic).
 *
 * @param baseSalary - Basic monthly salary
 * @param additionalEarnings - Extra earning line items to include (e.g. Allowances)
 * @returns Breakdown of earnings and deductions
 */
export function calculateSalaryComponents(
  baseSalary: number,
  additionalEarnings: Array<{ name: string; amount: number }> = [],
): SalaryComponentsBreakdown {
  const pf = baseSalary * PF_RATE; // 12% Provident Fund
  const esi = baseSalary * ESI_RATE; // 0.75% ESI

  return {
    earnings: [
      { name: 'Basic Salary', amount: baseSalary },
      ...additionalEarnings.map((item) => ({
        name: item.name,
        amount: Math.round(item.amount * 100) / 100,
      })),
    ],
    deductions: [
      { name: 'PF', amount: Math.round(pf * 100) / 100 },
      { name: 'ESI', amount: Math.round(esi * 100) / 100 },
    ],
  };
}

/**
 * Calculates net pay monthly and CTC annual from basic salary.
 *
 * @param baseSalary - Basic monthly salary
 * @param components - Salary breakdown
 * @returns Object with netPayMonthly and ctcAnnual
 */
export function calculateNetPayAndCTC(
  baseSalary: number,
  components: SalaryComponentsBreakdown,
): { netPayMonthly: number; ctcAnnual: number } {
  const totalEarnings = components.earnings.reduce((sum, comp) => sum + comp.amount, 0);
  const totalDeductions = components.deductions.reduce((sum, comp) => sum + comp.amount, 0);

  const netPayMonthly = Math.round((totalEarnings - totalDeductions) * 100) / 100;
  const ctcAnnual = Math.round(totalEarnings * 12 * 100) / 100;

  return { netPayMonthly, ctcAnnual };
}

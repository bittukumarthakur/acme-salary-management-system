/**
 * Salary component calculation service.
 * Computes earnings, allowances, and deductions based on basic salary.
 *
 * Note: This is a simplified implementation for MVP.
 * In production, this would be configurable per organization/department.
 */

import type { SalaryComponentsBreakdown } from '../models/employee/types';

/**
 * Calculates salary breakdown components from basic monthly salary.
 *
 * Uses standard Indian salary structure as a reference:
 * - DA (Dearness Allowance): 20% of basic
 * - HRA (House Rent Allowance): 25% of basic
 * - Conveyance Allowance: fixed (assumes typical ACME structure)
 * - PF (Provident Fund): 12% of basic
 * - Professional Tax: fixed
 * - Income Tax (TDS): calculated progressively
 *
 * @param baseSalary - Basic monthly salary
 * @returns Breakdown of earnings and deductions
 */
export function calculateSalaryComponents(baseSalary: number): SalaryComponentsBreakdown {
  // Earnings (Allowances)
  const da = baseSalary * 0.2; // 20% DA
  const hra = baseSalary * 0.25; // 25% HRA
  const conveyanceAllowance = 1600; // Fixed allowance

  const totalEarnings = baseSalary + da + hra + conveyanceAllowance;

  // Deductions
  const pf = baseSalary * 0.12; // 12% Provident Fund
  const professionalTax = 200; // Fixed professional tax
  // Simple progressive TDS calculation
  let tds = 0;
  if (totalEarnings > 500000) {
    tds = totalEarnings * 0.15; // 15% TDS for high earners
  } else if (totalEarnings > 250000) {
    tds = totalEarnings * 0.1; // 10% TDS for mid-tier
  } else if (totalEarnings > 0) {
    tds = totalEarnings * 0.05; // 5% TDS for others
  }

  const totalDeductions = pf + professionalTax + tds;

  return {
    earnings: [
      { name: 'Basic Salary', amount: baseSalary },
      { name: 'DA (Dearness Allowance)', amount: Math.round(da * 100) / 100 },
      { name: 'HRA (House Rent Allowance)', amount: Math.round(hra * 100) / 100 },
      { name: 'Conveyance Allowance', amount: conveyanceAllowance },
    ],
    deductions: [
      { name: 'Provident Fund (Employee)', amount: Math.round(pf * 100) / 100 },
      { name: 'Professional Tax', amount: professionalTax },
      { name: 'Income Tax (TDS)', amount: Math.round(tds * 100) / 100 },
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

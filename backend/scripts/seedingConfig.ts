/**
 * Seeding Configuration and Constants
 *
 * Contains configuration values and utility functions for database seeding.
 * Master data is imported from masterData.ts
 */

import { faker } from '@faker-js/faker';

// ============================================================================
// EMPLOYEE CONFIGURATION
// ============================================================================

/**
 * Monthly basic salary ranges by department (in INR)
 * Used to generate realistic monthly basic salaries for employees.
 * `basicSalary` is stored and treated as a monthly amount; annual CTC is derived as ×12.
 */
export const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  'DEPT-ENG': { min: 65000, max: 210000 },
  'DEPT-MKT': { min: 50000, max: 150000 },
  'DEPT-FIN': { min: 42000, max: 133000 },
  'DEPT-HR': { min: 38000, max: 117000 },
  'DEPT-SALES': { min: 33000, max: 125000 },
};

/**
 * Employment types and their distribution weights
 * Weights determine probability of selection (e.g., 70% permanent, 15% contract, etc.)
 */
export const EMPLOYMENT_TYPES = ['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN'] as const;
export const EMPLOYMENT_TYPE_WEIGHTS = [70, 15, 10, 5];

/**
 * Employee status options and their distribution weights
 * Primarily ACTIVE employees (85%), with some inactive/on leave
 */
export const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'] as const;
export const STATUS_WEIGHTS = [85, 5, 5, 5];

/**
 * Gender options for employees
 */
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

/**
 * Bank account types
 */
export const BANK_ACCOUNT_TYPES = ['SAVINGS', 'CURRENT'] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Select a random element from an array with weighted probability
 * @param items Array of items to choose from
 * @param weights Array of weights corresponding to each item
 * @returns Randomly selected item based on weights
 */
export function selectWeighted<T>(items: readonly T[], weights: readonly number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i += 1) {
    const weight = weights[i] ?? 0;
    if (random < weight) {
      return items[i] as T;
    }
    random -= weight;
  }

  return items[items.length - 1] as T;
}

/**
 * Generate a random salary within the department's range
 * @param departmentId Department ID to get salary range for
 * @returns Random salary in the department's configured range
 */
export function generateSalaryForDepartment(departmentId: string): number {
  const range = SALARY_RANGES[departmentId] ?? { min: 33000, max: 167000 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

/**
 * Generate IFSC code (Indian Financial System Code)
 * Format: 4 letter bank code + 4 digit branch code
 * @param bankName Bank name to generate code for
 * @returns Generated IFSC code
 */
export function generateIFSC(bankName: string): string {
  const bankCode = bankName.substring(0, 4).toUpperCase().padEnd(4, '0');
  const branchCode = String(faker.number.int({ min: 1000, max: 9999 }));
  return `${bankCode}${branchCode}`;
}

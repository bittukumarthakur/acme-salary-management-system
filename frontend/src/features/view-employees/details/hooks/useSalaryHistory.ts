import type { SalaryHistoryEntry } from '../../../employees/types/employees'

/**
 * Hook to provide hardcoded salary history data aligned with API contract.
 * This matches the API structure: id, effectiveFrom (ISO date), baseSalaryMonthly,
 * netPayMonthly, ctcAnnual, isCurrent (boolean).
 *
 * TODO: Replace with actual API call once backend story is complete.
 */
export function useSalaryHistory(): SalaryHistoryEntry[] {
  // Hardcoded data matching the API contract structure
  const history: SalaryHistoryEntry[] = [
    {
      id: 'rev_3',
      effectiveFrom: '2024-01-01',
      currency: 'INR',
      baseSalaryMonthly: 2252910,
      netPayMonthly: 247821,
      ctcAnnual: 6218040,
      isCurrent: true,
    },
    {
      id: 'rev_2',
      effectiveFrom: '2023-01-01',
      currency: 'INR',
      baseSalaryMonthly: 2000000,
      netPayMonthly: 220000,
      ctcAnnual: 5500000,
      isCurrent: false,
    },
    {
      id: 'rev_1',
      effectiveFrom: '2022-06-15',
      currency: 'INR',
      baseSalaryMonthly: 1800000,
      netPayMonthly: 190000,
      ctcAnnual: 4500000,
      isCurrent: false,
    },
  ]

  return history
}

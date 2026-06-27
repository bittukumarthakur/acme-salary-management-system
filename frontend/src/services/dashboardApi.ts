export interface SummaryCard {
  label: string
  value: number | string
  metadata?: string
}

export interface PayrollSummary {
  months: string[]
  values: number[]
}

export interface DashboardData {
  summaryCards: SummaryCard[]
  payrollSummary: PayrollSummary
}

/**
 * Mock API service that returns dummy dashboard data.
 * This is a temporary implementation until the real backend API is available.
 * The response shape is designed to be stable enough for future backend integration.
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    summaryCards: [
      {
        label: 'Total Employees',
        value: 120,
        metadata: '↑ 8 this month',
      },
      {
        label: 'Payroll Processed',
        value: '₹24,80,000',
        metadata: 'May 2024',
      },
      {
        label: 'Total Deductions',
        value: '₹3,45,000',
        metadata: 'May 2024',
      },
      {
        label: 'Net Salary Paid',
        value: '₹21,35,000',
        metadata: 'May 2024',
      },
    ],
    payrollSummary: {
      months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
    },
  }
}

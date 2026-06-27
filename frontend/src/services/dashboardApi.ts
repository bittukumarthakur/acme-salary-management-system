import type {
  DashboardData as DashboardDataType,
  PayrollSummary as PayrollSummaryType,
  RecentPayrollRecord as RecentPayrollRecordType,
  SummaryCard as SummaryCardType,
} from '../types/dashboard'

export type SummaryCard = SummaryCardType
export type PayrollSummary = PayrollSummaryType
export type RecentPayrollRecord = RecentPayrollRecordType
export type DashboardData = DashboardDataType

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
    recentPayrolls: [
      {
        id: 'pay-2024-05',
        payrollPeriod: 'May 2024',
        payoutDate: '2024-05-31',
        status: 'Completed',
        amount: '₹24,80,000',
      },
      {
        id: 'pay-2024-04',
        payrollPeriod: 'April 2024',
        payoutDate: '2024-04-30',
        status: 'Completed',
        amount: '₹22,65,000',
      },
      {
        id: 'pay-2024-03',
        payrollPeriod: 'Mar 2024',
        payoutDate: '2024-03-31',
        status: 'Completed',
        amount: '₹21,40,000',
      },
      {
        id: 'pay-2024-02',
        payrollPeriod: 'February 2024',
        payoutDate: '2024-02-29',
        status: 'Completed',
        amount: '₹20,10,000',
      },
      {
        id: 'pay-2024-01',
        payrollPeriod: 'January 2024',
        payoutDate: '2024-01-31',
        status: 'Completed',
        amount: '₹19,20,000',
      },
      {
        id: 'pay-2023-12',
        payrollPeriod: 'December 2023',
        payoutDate: '2023-12-31',
        status: 'Completed',
        amount: '₹18,45,000',
      },
      {
        id: 'pay-2023-11',
        payrollPeriod: 'November 2023',
        payoutDate: '2023-11-30',
        status: 'Completed',
        amount: '₹17,90,000',
      },
    ],
  }
}

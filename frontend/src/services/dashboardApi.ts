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

interface DashboardApiSummaryCard {
  labelKey: string
  value: number
}

interface DashboardApiResponse {
  summaryCards: DashboardApiSummaryCard[]
  meta?: {
    currency?: string
  }
}

const DASHBOARD_ENDPOINT = '/api/v1/dashboard'

const FALLBACK_RECENT_PAYROLLS: RecentPayrollRecord[] = [
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
]

const FALLBACK_PAYROLL_SUMMARY: PayrollSummary = {
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
  values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
}

function formatCurrency(value: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

function mapSummaryCards(response: DashboardApiResponse): SummaryCard[] {
  const apiCardsByLabelKey = new Map(
    response.summaryCards.map((card) => [card.labelKey, card]),
  )
  const currency = response.meta?.currency || 'INR'

  return [
    { label: 'Total Employees', value: 'N/A' },
    {
      label: 'Payroll Processed',
      value: apiCardsByLabelKey.has('PAYROLL_PROCESSED')
        ? formatCurrency(
            apiCardsByLabelKey.get('PAYROLL_PROCESSED')!.value,
            currency,
          )
        : 'N/A',
    },
    {
      label: 'Total Deductions',
      value: apiCardsByLabelKey.has('TOTAL_DEDUCTIONS')
        ? formatCurrency(
            apiCardsByLabelKey.get('TOTAL_DEDUCTIONS')!.value,
            currency,
          )
        : 'N/A',
    },
    {
      label: 'Net Salary Paid',
      value: apiCardsByLabelKey.has('NET_SALARY_PAID')
        ? formatCurrency(
            apiCardsByLabelKey.get('NET_SALARY_PAID')!.value,
            currency,
          )
        : 'N/A',
    },
  ]
}

export function createPlaceholderDashboardData(): DashboardData {
  return {
    summaryCards: [],
    payrollSummary: {
      months: [...FALLBACK_PAYROLL_SUMMARY.months],
      values: [...FALLBACK_PAYROLL_SUMMARY.values],
    },
    recentPayrolls: FALLBACK_RECENT_PAYROLLS.map((payroll) => ({ ...payroll })),
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(DASHBOARD_ENDPOINT)

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }

  const result = (await response.json()) as DashboardApiResponse

  return {
    summaryCards: mapSummaryCards(result),
    payrollSummary: {
      months: [...FALLBACK_PAYROLL_SUMMARY.months],
      values: [...FALLBACK_PAYROLL_SUMMARY.values],
    },
    recentPayrolls: FALLBACK_RECENT_PAYROLLS.map((payroll) => ({ ...payroll })),
  }
}

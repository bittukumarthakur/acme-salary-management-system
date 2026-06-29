import type {
  DashboardData as DashboardDataType,
  PayrollSummary as PayrollSummaryType,
  RecentPayrollRecord as RecentPayrollRecordType,
  SummaryCard as SummaryCardType,
} from '../types/dashboard'
import {
  formatCurrencyWithSymbol,
  toTitleCase,
} from '../../../shared/utils/formatters'

export type SummaryCard = SummaryCardType
export type PayrollSummary = PayrollSummaryType
export type RecentPayrollRecord = RecentPayrollRecordType
export type DashboardData = DashboardDataType

interface DashboardApiSummaryCard {
  labelKey: string
  value: number
}

interface DashboardApiRecentPayrollRecord {
  id: string
  payrollPeriod: string
  payoutDate: string
  status: string
  totalAmount: number
  totalDeductions: number
  netAmount: number
}

interface DashboardApiResponse {
  summaryCards: DashboardApiSummaryCard[]
  recentPayrolls: DashboardApiRecentPayrollRecord[]
  meta: {
    generatedAt: string
    currency: string
    employeeTrend: {
      currentMonthCount: number
      previousMonthCount: number
    }
  }
}

const clientEnv = import.meta.env as Record<string, string | undefined>
const configuredApiBaseUrl = clientEnv.ACME_BACKEND_API_BASE_URL?.trim() ?? ''
const DASHBOARD_ENDPOINT = `${configuredApiBaseUrl}/api/v1/dashboard`

function getEmployeeTrendMetadata(response: DashboardApiResponse) {
  const currentMonthCount = response.meta.employeeTrend.currentMonthCount
  const previousMonthCount = response.meta.employeeTrend.previousMonthCount

  const trendDelta = currentMonthCount - previousMonthCount
  if (trendDelta > 0) {
    return `↑ ${trendDelta} this month`
  }

  if (trendDelta < 0) {
    return `↓ ${Math.abs(trendDelta)} this month`
  }

  return 'No change this month'
}

function getSummaryMonthMetadata(response: DashboardApiResponse) {
  const generatedDate = new Date(response.meta.generatedAt)
  if (Number.isNaN(generatedDate.getTime())) {
    return undefined
  }

  return generatedDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function mapRecentPayrolls(
  response: DashboardApiResponse,
): RecentPayrollRecord[] {
  const currency = response.meta.currency
  return response.recentPayrolls.map((payroll) => ({
    id: payroll.id,
    payrollPeriod: payroll.payrollPeriod,
    payoutDate: payroll.payoutDate,
    status: toTitleCase(payroll.status),
    amount: formatCurrencyWithSymbol(payroll.totalAmount, currency),
  }))
}

function mapPayrollSummary(response: DashboardApiResponse): PayrollSummary {
  const latestSix = [...response.recentPayrolls]
    .sort(
      (first, second) =>
        new Date(first.payoutDate).getTime() -
        new Date(second.payoutDate).getTime(),
    )
    .slice(-6)

  return {
    months: latestSix.map((item) => {
      const parsedDate = new Date(item.payoutDate)
      if (Number.isNaN(parsedDate.getTime())) {
        return item.payrollPeriod
      }

      return parsedDate.toLocaleDateString('en-US', { month: 'short' })
    }),
    values: latestSix.map((item) => item.totalAmount),
  }
}

function mapSummaryCards(response: DashboardApiResponse): SummaryCard[] {
  const apiCardsByLabelKey = new Map(
    response.summaryCards.map((card) => [card.labelKey, card]),
  )
  const currency = response.meta.currency
  const employeeTrendMetadata = getEmployeeTrendMetadata(response)
  const summaryMonthMetadata = getSummaryMonthMetadata(response)

  return [
    {
      label: 'Total Employees',
      value: apiCardsByLabelKey.has('TOTAL_EMPLOYEES')
        ? apiCardsByLabelKey.get('TOTAL_EMPLOYEES')!.value
        : 'N/A',
      metadata: employeeTrendMetadata,
    },
    {
      label: 'Payroll Processed',
      value: apiCardsByLabelKey.has('PAYROLL_PROCESSED')
        ? formatCurrencyWithSymbol(
            apiCardsByLabelKey.get('PAYROLL_PROCESSED')!.value,
            currency,
          )
        : 'N/A',
      metadata: summaryMonthMetadata,
    },
    {
      label: 'Total Deductions',
      value: apiCardsByLabelKey.has('TOTAL_DEDUCTIONS')
        ? formatCurrencyWithSymbol(
            apiCardsByLabelKey.get('TOTAL_DEDUCTIONS')!.value,
            currency,
          )
        : 'N/A',
      metadata: summaryMonthMetadata,
    },
    {
      label: 'Net Salary Paid',
      value: apiCardsByLabelKey.has('NET_SALARY_PAID')
        ? formatCurrencyWithSymbol(
            apiCardsByLabelKey.get('NET_SALARY_PAID')!.value,
            currency,
          )
        : 'N/A',
      metadata: summaryMonthMetadata,
    },
  ]
}

export function createPlaceholderDashboardData(): DashboardData {
  return {
    summaryCards: [],
    payrollSummary: {
      months: [],
      values: [],
    },
    recentPayrolls: [],
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(DASHBOARD_ENDPOINT)

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }

  const result = (await response.json()) as DashboardApiResponse
  const recentPayrolls = mapRecentPayrolls(result)

  return {
    summaryCards: mapSummaryCards(result),
    payrollSummary: mapPayrollSummary(result),
    recentPayrolls,
  }
}

import { fetchDashboardData } from '../../services/dashboardApi'

const dashboardApiResponse = {
  summaryCards: [
    {
      labelKey: 'TOTAL_EMPLOYEES',
      value: 120,
    },
    {
      labelKey: 'PAYROLL_PROCESSED',
      value: 25222587.73,
    },
    {
      labelKey: 'TOTAL_DEDUCTIONS',
      value: 2175402.51,
    },
    {
      labelKey: 'NET_SALARY_PAID',
      value: 23047185.22,
    },
  ],
  recentPayrolls: [
    {
      id: 'PAY-2026-06',
      payrollPeriod: 'June 2026',
      payoutDate: '2026-06-27',
      status: 'COMPLETED',
      totalAmount: 25222587.73,
      totalDeductions: 2175402.51,
      netAmount: 23047185.22,
    },
  ],
  meta: {
    generatedAt: '2026-06-27T20:47:14.138Z',
    appliedCountry: 'IN',
    recentPayrollsLimit: 10,
    currency: 'INR',
    conversion: {
      rate: 1,
      convertedAt: '2026-06-27T20:47:14.137Z',
    },
    totalPayrollRecords: 12,
    employeeTrend: {
      currentMonthCount: 42,
      previousMonthCount: 39,
    },
  },
}

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchDashboardData', () => {
    it('requests the dashboard endpoint and maps API summary cards to the UI contract', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => dashboardApiResponse,
      } as Response)

      const data = await fetchDashboardData()

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/dashboard')
      expect(data.summaryCards).toEqual([
        {
          label: 'Total Employees',
          value: 120,
          metadata: '↑ 3 this month',
        },
        {
          label: 'Payroll Processed',
          value: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(25222587.73),
          metadata: 'Jun 2026',
        },
        {
          label: 'Total Deductions',
          value: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(2175402.51),
          metadata: 'Jun 2026',
        },
        {
          label: 'Net Salary Paid',
          value: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(23047185.22),
          metadata: 'Jun 2026',
        },
      ])
    })

    it('maps recent payroll rows from api payload', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => dashboardApiResponse,
      } as Response)

      const data = await fetchDashboardData()

      expect(data.recentPayrolls).toEqual([
        {
          id: 'PAY-2026-06',
          payrollPeriod: 'June 2026',
          payoutDate: '2026-06-27',
          status: 'Completed',
          amount: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(25222587.73),
        },
      ])
    })

    it('derives payroll summary chart series from recent payroll records', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => dashboardApiResponse,
      } as Response)

      const data = await fetchDashboardData()

      expect(data.payrollSummary.months).toEqual(['Jun'])
      expect(data.payrollSummary.values).toEqual([25222587.73])
    })

    it('returns empty non-summary data when api has no recent payrolls', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...dashboardApiResponse,
          recentPayrolls: [],
        }),
      } as Response)

      const data = await fetchDashboardData()

      expect(data.payrollSummary.months).toEqual([])
      expect(data.payrollSummary.values).toEqual([])
      expect(data.recentPayrolls).toEqual([])
    })

    it('throws an error when the dashboard request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as Response)

      await expect(fetchDashboardData()).rejects.toThrow(
        'Failed to fetch dashboard data',
      )
    })
  })
})

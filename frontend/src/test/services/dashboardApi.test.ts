import { fetchDashboardData } from '../../services/dashboardApi'

const dashboardApiResponse = {
  summaryCards: [
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
        { label: 'Total Employees', value: 'N/A' },
        {
          label: 'Payroll Processed',
          value: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
          }).format(25222587.73),
        },
        {
          label: 'Total Deductions',
          value: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
          }).format(2175402.51),
        },
        {
          label: 'Net Salary Paid',
          value: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
          }).format(23047185.22),
        },
      ])
    })

    it('keeps the existing non-summary dashboard sections on their placeholder contract', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => dashboardApiResponse,
      } as Response)

      const data = await fetchDashboardData()

      expect(data.payrollSummary.months).toHaveLength(6)
      expect(data.payrollSummary.values).toHaveLength(6)
      expect(data.recentPayrolls.length).toBeGreaterThan(0)
      expect(data.recentPayrolls[0]).toHaveProperty('amount')
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

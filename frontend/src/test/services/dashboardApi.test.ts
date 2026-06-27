import { fetchDashboardData } from '../../services/dashboardApi'

describe('dashboardApi', () => {
  describe('fetchDashboardData', () => {
    it('should return dummy dashboard data when called', async () => {
      const data = await fetchDashboardData()

      expect(data).toBeDefined()
      expect(data.summaryCards).toBeDefined()
      expect(data.payrollSummary).toBeDefined()
    })

    it('should return summary cards with required fields', async () => {
      const data = await fetchDashboardData()

      expect(data.summaryCards).toHaveLength(4)
      data.summaryCards.forEach((card) => {
        expect(card).toHaveProperty('value')
        expect(card).toHaveProperty('label')
        expect(card).toHaveProperty('metadata')
      })
    })

    it('should return payroll summary with chart data', async () => {
      const data = await fetchDashboardData()

      expect(data.payrollSummary).toHaveProperty('months')
      expect(data.payrollSummary).toHaveProperty('values')
      expect(data.payrollSummary.months).toHaveLength(6)
      expect(data.payrollSummary.values).toHaveLength(6)
    })

    it('should return data asynchronously', async () => {
      const promise = fetchDashboardData()

      expect(promise).toBeInstanceOf(Promise)
      const data = await promise
      expect(data).toBeDefined()
    })

    it('should contain realistic dummy values', async () => {
      const data = await fetchDashboardData()

      const totalEmployeesCard = data.summaryCards[0]
      expect(totalEmployeesCard.value).toBeDefined()
      expect(typeof totalEmployeesCard.value).toBe('number')

      const payrollCard = data.summaryCards[1]
      expect(payrollCard.value).toBeDefined()
    })
  })
})

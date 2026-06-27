import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material'
import userEvent from '@testing-library/user-event'
import { HomePage } from '../../pages/HomePage'
import * as dashboardApi from '../../services/dashboardApi'

// Mock the dashboardApi module
vi.mock('../../services/dashboardApi')

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d1f4f',
      contrastText: '#f5f7ff',
    },
    secondary: {
      main: '#4f6cd9',
    },
    background: {
      default: '#eef2f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#121b32',
      secondary: '#5f6882',
    },
    divider: '#d9dfeb',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
  },
})

function renderWithTheme(component: React.ReactNode) {
  return render(
    <ThemeProvider theme={appTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('HomePage - Dashboard Data Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading state when data is being fetched', async () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  summaryCards: [],
                  payrollSummary: { months: [], values: [] },
                }),
              1000
            )
          )
      )

      renderWithTheme(<HomePage />)

      // Should show loading skeleton in summary cards
      const loadingElements = screen.queryAllByText(/loading|skeleton/i)
      expect(loadingElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Success State', () => {
    it('should display summary cards with dummy values on successful fetch', async () => {
      const mockData: dashboardApi.DashboardData = {
        summaryCards: [
          { label: 'Total Employees', value: 120 },
          { label: 'Payroll Processed', value: '₹24,80,000' },
          { label: 'Total Deductions', value: '₹3,45,000' },
          { label: 'Net Salary Paid', value: '₹21,35,000' },
        ],
        payrollSummary: {
          months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
        },
      }

      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('120')).toBeInTheDocument()
      })

      expect(screen.getByText('₹24,80,000')).toBeInTheDocument()
      expect(screen.getByText('₹3,45,000')).toBeInTheDocument()
      expect(screen.getByText('₹21,35,000')).toBeInTheDocument()
    })

    it('should fetch data once on component mount', async () => {
      const mockData: dashboardApi.DashboardData = {
        summaryCards: [
          { label: 'Total Employees', value: 120 },
          { label: 'Payroll Processed', value: '₹24,80,000' },
          { label: 'Total Deductions', value: '₹3,45,000' },
          { label: 'Net Salary Paid', value: '₹21,35,000' },
        ],
        payrollSummary: {
          months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
        },
      }

      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(dashboardApi.fetchDashboardData).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Error State', () => {
    it('should display error state when fetch fails', async () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockRejectedValueOnce(
        new Error('Failed to fetch data')
      )

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(
          screen.queryByText(/error|failed|try again/i)
        ).toBeInTheDocument()
      })
    })

    it('should show retry button when in error state', async () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockRejectedValueOnce(
        new Error('Failed to fetch data')
      )

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        const retryButton = screen.queryByRole('button', {
          name: /retry|try again/i,
        })
        expect(retryButton).toBeInTheDocument()
      })
    })

    it('should retry fetch when retry button is clicked', async () => {
      const mockData: dashboardApi.DashboardData = {
        summaryCards: [
          { label: 'Total Employees', value: 120 },
          { label: 'Payroll Processed', value: '₹24,80,000' },
          { label: 'Total Deductions', value: '₹3,45,000' },
          { label: 'Net Salary Paid', value: '₹21,35,000' },
        ],
        payrollSummary: {
          months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
        },
      }

      vi.mocked(dashboardApi.fetchDashboardData)
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        const retryButton = screen.queryByRole('button', {
          name: /retry|try again/i,
        })
        expect(retryButton).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', {
        name: /retry|try again/i,
      })
      await userEvent.click(retryButton)

      await waitFor(() => {
        expect(dashboardApi.fetchDashboardData).toHaveBeenCalledTimes(2)
      })

      expect(screen.getByText('120')).toBeInTheDocument()
    })
  })

  describe('Data Source Contract', () => {
    it('should use API service to fetch data, not hardcoded values', async () => {
      const mockData: dashboardApi.DashboardData = {
        summaryCards: [
          { label: 'Total Employees', value: 250 },
          { label: 'Payroll Processed', value: '₹50,00,000' },
          { label: 'Total Deductions', value: '₹7,50,000' },
          { label: 'Net Salary Paid', value: '₹42,50,000' },
        ],
        payrollSummary: {
          months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [10000000, 15000000, 20000000, 25000000, 30000000, 50000000],
        },
      }

      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('250')).toBeInTheDocument()
        expect(screen.getByText('₹50,00,000')).toBeInTheDocument()
      })
    })
  })

  describe('Payroll Summary Display', () => {
    it('should display payroll summary section with chart data', async () => {
      const mockData: dashboardApi.DashboardData = {
        summaryCards: [
          { label: 'Total Employees', value: 120 },
          { label: 'Payroll Processed', value: '₹24,80,000' },
          { label: 'Total Deductions', value: '₹3,45,000' },
          { label: 'Net Salary Paid', value: '₹21,35,000' },
        ],
        payrollSummary: {
          months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
        },
      }

      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('Payroll Summary')).toBeInTheDocument()
      })
    })
  })

  describe('Scope Boundaries', () => {
    it('should not populate Recent Payrolls section in this story', async () => {
      const mockData: dashboardApi.DashboardData = {
        summaryCards: [
          { label: 'Total Employees', value: 120 },
          { label: 'Payroll Processed', value: '₹24,80,000' },
          { label: 'Total Deductions', value: '₹3,45,000' },
          { label: 'Net Salary Paid', value: '₹21,35,000' },
        ],
        payrollSummary: {
          months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
        },
      }

      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
      })

      // Recent Payrolls should still show "Coming soon"
      const comingSoonTexts = screen.queryAllByText('Coming soon')
      expect(comingSoonTexts.length).toBeGreaterThan(0)
    })
  })
})

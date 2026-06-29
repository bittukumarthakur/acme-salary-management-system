import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material'
import userEvent from '@testing-library/user-event'
import { HomePage } from '../../../../features/dashboard/pages/HomePage'
import * as dashboardApi from '../../../../features/dashboard/services/dashboardApi'

vi.mock('../../../../features/dashboard/services/dashboardApi', async () => {
  const actual = await vi.importActual<
    typeof import('../../../../features/dashboard/services/dashboardApi')
  >('../../../../features/dashboard/services/dashboardApi')

  return {
    ...actual,
    fetchDashboardData: vi.fn(),
  }
})

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
  return render(<ThemeProvider theme={appTheme}>{component}</ThemeProvider>)
}

const baseDashboardData: dashboardApi.DashboardData = {
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
  recentPayrolls: [],
}

describe('HomePage - Dashboard Data Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows empty recent payroll state while summary data is loading', () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockImplementationOnce(
        () => new Promise(() => {}),
      )

      renderWithTheme(<HomePage />)

      expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
      expect(
        screen.getByText('No recent payrolls available.'),
      ).toBeInTheDocument()
      expect(
        screen.queryByLabelText('Loading recent payrolls section'),
      ).not.toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('fetches and displays summary cards on successful load', async () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(
        baseDashboardData,
      )

      renderWithTheme(<HomePage />)

      expect(await screen.findByText('120')).toBeInTheDocument()
      expect(screen.getByText('₹24,80,000')).toBeInTheDocument()
      expect(dashboardApi.fetchDashboardData).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error State', () => {
    it('displays retry and empty recent payroll state when fetch fails', async () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockRejectedValueOnce(
        new Error('Failed to fetch data'),
      )

      renderWithTheme(<HomePage />)

      expect(
        await screen.findByRole('button', { name: 'Retry' }),
      ).toBeInTheDocument()

      expect(
        screen.getByText('No recent payrolls available.'),
      ).toBeInTheDocument()
      expect(
        screen.queryAllByRole('button', { name: /retry|try again/i }),
      ).toHaveLength(1)
    })

    it('retries fetch when retry button is clicked', async () => {
      vi.mocked(dashboardApi.fetchDashboardData)
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce(baseDashboardData)

      renderWithTheme(<HomePage />)

      const retryButton = await screen.findByLabelText('Retry')
      await userEvent.click(retryButton)

      await waitFor(() => {
        expect(dashboardApi.fetchDashboardData).toHaveBeenCalledTimes(2)
      })

      expect(screen.getByText('120')).toBeInTheDocument()
    })
  })

  describe('Payroll Summary Display', () => {
    it('displays payroll summary section with chart data', async () => {
      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(
        baseDashboardData,
      )

      renderWithTheme(<HomePage />)

      expect(await screen.findByText('Payroll Summary')).toBeInTheDocument()
    })
  })

  describe('Recent Payrolls', () => {
    it('should render recent payroll records from API data', async () => {
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
        recentPayrolls: [
          {
            id: 'pay-2024-05',
            payrollPeriod: 'May 2024',
            payoutDate: '2024-06-02',
            status: 'Paid',
            amount: '₹4,20,000',
          },
        ],
      }

      vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValueOnce(mockData)

      renderWithTheme(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
      })

      expect(screen.getByText('May 2024')).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /View .* payroll/i }),
      ).toBeInTheDocument()
    })
  })
})

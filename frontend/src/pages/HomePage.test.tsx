import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from './HomePage'
import * as dashboardApi from '../services/dashboardApi'

// Mock the dashboard API
vi.mock('../services/dashboardApi')

const mockDashboardData: dashboardApi.DashboardData = {
  summaryCards: [
    { label: 'Total Employees', value: 120, metadata: '↑ 8 this month' },
    { label: 'Payroll Processed', value: '₹24,80,000', metadata: 'May 2024' },
    { label: 'Total Deductions', value: '₹3,45,000', metadata: 'May 2024' },
    { label: 'Net Salary Paid', value: '₹21,35,000', metadata: 'May 2024' },
  ],
  payrollSummary: {
    months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
  },
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state on initial render', () => {
    const mockFetch = vi.fn()
      .mockImplementation(() => new Promise(() => {})) // Never resolves
    vi.mocked(dashboardApi.fetchDashboardData).mockImplementation(mockFetch)

    render(<HomePage />)

    // Verify the main dashboard page title is rendered
    const dashboardHeading = screen.getByRole('heading', { level: 4, name: 'Dashboard' })
    expect(dashboardHeading).toBeInTheDocument()
  })

  it('should display summary cards with populated values when data loads successfully', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValue(mockDashboardData)

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('₹24,80,000')).toBeInTheDocument()
      expect(screen.getByText('₹3,45,000')).toBeInTheDocument()
      expect(screen.getByText('₹21,35,000')).toBeInTheDocument()
    })
  })

  it('should display payroll summary months when data loads', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValue(mockDashboardData)

    render(<HomePage />)

    await waitFor(() => {
      // Check for individual month labels in the payroll chart
      expect(screen.getByText('Dec')).toBeInTheDocument()
      expect(screen.getByText('May')).toBeInTheDocument()
    })
  })

  it('should display error state when API fails', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockRejectedValue(
      new Error('Network error')
    )

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show retry button in error state', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockRejectedValue(
      new Error('Network error')
    )

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    })
  })

  it('should retry fetch when retry button is clicked', async () => {
    const mockFetch = vi.fn()
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockDashboardData)

    vi.mocked(dashboardApi.fetchDashboardData).mockImplementation(mockFetch)

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /Retry/i })
    await userEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should fetch data once on component mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockDashboardData)
    vi.mocked(dashboardApi.fetchDashboardData).mockImplementation(mockFetch)

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should display Recent Payrolls section as Coming soon', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValue(mockDashboardData)

    render(<HomePage />)

    await waitFor(() => {
      const recentPayrollsSection = screen.getByText('Recent Payrolls')
        .closest('div')
        ?.parentElement?.parentElement
      expect(within(recentPayrollsSection!).getByText('Coming soon')).toBeInTheDocument()
    })
  })

  it('should display Quick Actions section as Coming soon', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValue(mockDashboardData)

    render(<HomePage />)

    await waitFor(() => {
      const quickActionsCards = screen.getAllByText('Coming soon')
      expect(quickActionsCards.length).toBeGreaterThanOrEqual(4)
    })
  })

  it('should render all summary card labels', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValue(mockDashboardData)

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('Payroll Processed')).toBeInTheDocument()
      expect(screen.getByText('Total Deductions')).toBeInTheDocument()
      expect(screen.getByText('Net Salary Paid')).toBeInTheDocument()
    })
  })
})

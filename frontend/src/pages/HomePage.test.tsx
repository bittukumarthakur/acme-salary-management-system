import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomePage } from './HomePage'
import { useDashboardData } from '../hooks/useDashboardData'
import { ThemeProvider, createTheme } from '@mui/material'
import type { DashboardData } from '../types/dashboard'
import { createPlaceholderDashboardData } from '../services/dashboardApi'

// Mock the hooks
vi.mock('../hooks/useDashboardData')

const mockDashboardData: DashboardData = {
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
  recentPayrolls: [],
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the useDashboardData hook with successful state
    vi.mocked(useDashboardData).mockReturnValue({
      state: 'success',
      data: mockDashboardData,
      error: null,
      retry: vi.fn(),
    })
  })

  it('should render the dashboard page with all sections', () => {
    renderWithTheme(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 4, name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Salary Portal')).toBeInTheDocument()
    expect(screen.getByText('Payroll Summary')).toBeInTheDocument()
    expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('should display summary cards with data', () => {
    renderWithTheme(<HomePage />)

    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('should render sidebar navigation items', () => {
    renderWithTheme(<HomePage />)

    // Get all elements with these texts and check they exist (Dashboard appears multiple times)
    const navItems = screen.getAllByText('Dashboard')
    expect(navItems.length).toBeGreaterThan(0)

    expect(screen.getByText('Employees')).toBeInTheDocument()
    expect(screen.getByText('Payroll')).toBeInTheDocument()
  })

  it('should render user profile in header', () => {
    renderWithTheme(<HomePage />)

    expect(screen.getByText('HR Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should render error state when dashboard data fails', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      state: 'error',
      data: createPlaceholderDashboardData(),
      error: 'Network error',
      retry: vi.fn(),
    })

    renderWithTheme(<HomePage />)

    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getAllByText('Network error')).toHaveLength(1)
    expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
  })

  it('should call retry when retry button is clicked in error state', async () => {
    const mockRetry = vi.fn()
    vi.mocked(useDashboardData).mockReturnValue({
      state: 'error',
      data: createPlaceholderDashboardData(),
      error: 'Network error',
      retry: mockRetry,
    })

    renderWithTheme(<HomePage />)

    const retryButton = screen.getByLabelText('Retry')
    await userEvent.click(retryButton)

    expect(mockRetry).toHaveBeenCalled()
  })

  it('should display payroll months in chart', () => {
    renderWithTheme(<HomePage />)

    expect(screen.getByText('Dec')).toBeInTheDocument()
    expect(screen.getByText('May')).toBeInTheDocument()
  })

  it('should render quick action buttons', () => {
    renderWithTheme(<HomePage />)

    expect(screen.getByText('Add Employee')).toBeInTheDocument()
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument()
    expect(screen.getByText('Generate Payroll')).toBeInTheDocument()
    expect(screen.getByText('View Payslips')).toBeInTheDocument()
  })
})

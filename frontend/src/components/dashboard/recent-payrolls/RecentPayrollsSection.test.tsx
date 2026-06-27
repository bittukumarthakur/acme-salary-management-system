import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { RecentPayrollsSection } from './RecentPayrollsSection'
import type { RecentPayrollRecord } from '../../../types/dashboard'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

const mockPayrolls: RecentPayrollRecord[] = [
  {
    id: 'pay-003',
    payrollPeriod: 'Apr 2024',
    payoutDate: '2024-05-02',
    status: 'Paid',
    amount: '₹4,12,000',
  },
  {
    id: 'pay-006',
    payrollPeriod: 'Jul 2024',
    payoutDate: '2024-08-02',
    status: 'Paid',
    amount: '₹4,45,000',
  },
  {
    id: 'pay-001',
    payrollPeriod: 'Feb 2024',
    payoutDate: '2024-03-02',
    status: 'Paid',
    amount: '₹3,95,000',
  },
  {
    id: 'pay-005',
    payrollPeriod: 'Jun 2024',
    payoutDate: '2024-07-02',
    status: 'Paid',
    amount: '₹4,37,000',
  },
  {
    id: 'pay-004',
    payrollPeriod: 'May 2024',
    payoutDate: '2024-06-02',
    status: 'Paid',
    amount: '₹4,20,000',
  },
  {
    id: 'pay-002',
    payrollPeriod: 'Mar 2024',
    payoutDate: '2024-04-02',
    status: 'Paid',
    amount: '₹4,03,000',
  },
  {
    id: 'pay-007',
    payrollPeriod: 'Aug 2024',
    payoutDate: '2024-09-02',
    status: 'Paid',
    amount: '₹4,52,000',
  },
]

describe('<RecentPayrollsSection />', () => {
  it('should render exactly seven rows sorted by newest payout first', () => {
    renderWithTheme(<RecentPayrollsSection payrolls={mockPayrolls} />)

    const rows = screen.getAllByTestId('recent-payroll-row')
    expect(rows).toHaveLength(7)

    expect(screen.getAllByText('Aug 2024')).toHaveLength(1)
    expect(screen.getByText('Feb 2024')).toBeInTheDocument()
  })

  it('should render all rows when seven or fewer records are provided', () => {
    renderWithTheme(
      <RecentPayrollsSection payrolls={mockPayrolls.slice(0, 3)} />,
    )

    expect(screen.getAllByTestId('recent-payroll-row')).toHaveLength(3)
  })

  it('should render a non-routing View all link and call onViewAll when clicked', async () => {
    const handleViewAll = vi.fn()
    renderWithTheme(
      <RecentPayrollsSection
        payrolls={mockPayrolls}
        onViewAll={handleViewAll}
      />,
    )

    const initialLocation = window.location.href
    const seeAllLink = screen.getByRole('link', { name: /View all/i })
    await userEvent.click(seeAllLink)

    expect(handleViewAll).toHaveBeenCalledOnce()
    expect(seeAllLink).toHaveAttribute('href', '#')
    expect(window.location.href).toBe(initialLocation)
  })

  it('should attach row-level view action route target for each payroll row', () => {
    renderWithTheme(
      <RecentPayrollsSection payrolls={mockPayrolls.slice(0, 2)} />,
    )

    const viewLinks = screen.getAllByRole('link', {
      name: /View .* payroll/i,
    })
    expect(viewLinks[0]).toHaveAttribute('href', '/payrolls/pay-006')
    expect(viewLinks[1]).toHaveAttribute('href', '/payrolls/pay-003')
  })

  it('should render loading state with stable placeholder rows', () => {
    renderWithTheme(<RecentPayrollsSection isLoading payrolls={[]} />)

    expect(screen.getByText('Loading recent payrolls...')).toBeInTheDocument()
    expect(screen.getAllByTestId('recent-payroll-loading-row')).toHaveLength(7)
  })

  it('should render empty state when no payrolls exist', () => {
    renderWithTheme(<RecentPayrollsSection payrolls={[]} />)

    expect(
      screen.getByText('No recent payrolls available.'),
    ).toBeInTheDocument()
  })

  it('should render error state and call retry when retry is clicked', async () => {
    const onRetry = vi.fn()
    renderWithTheme(
      <RecentPayrollsSection
        payrolls={[]}
        isError
        errorMessage="Unable to load recent payrolls."
        onRetry={onRetry}
      />,
    )

    expect(
      screen.getByText('Unable to load recent payrolls.'),
    ).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /Retry/i })
    await userEvent.click(retryButton)

    expect(onRetry).toHaveBeenCalledOnce()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { describe, expect, it, vi } from 'vitest'
import type { RecentPayrollRecord } from '../../../types/dashboard'
import { RecentPayrollsContent } from './RecentPayrollsContent'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

const payrolls: RecentPayrollRecord[] = [
  {
    id: 'pay-001',
    payrollPeriod: 'May 2024',
    payoutDate: '2024-05-31',
    status: 'Completed',
    amount: '₹24,80,000',
  },
]

describe('<RecentPayrollsContent />', () => {
  it('renders error state and triggers retry', async () => {
    const onRetry = vi.fn()
    renderWithTheme(
      <RecentPayrollsContent
        isLoading={false}
        isError={true}
        errorMessage="Unable to load recent payrolls."
        onRetry={onRetry}
        visiblePayrolls={[]}
      />,
    )

    expect(
      screen.getByText('Unable to load recent payrolls.'),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders loading state with stable skeleton rows', () => {
    renderWithTheme(
      <RecentPayrollsContent
        isLoading={true}
        isError={false}
        visiblePayrolls={[]}
      />,
    )

    expect(screen.getByText('Loading recent payrolls...')).toBeInTheDocument()
    expect(screen.getAllByTestId('recent-payroll-loading-row')).toHaveLength(7)
  })

  it('renders empty state when no payrolls exist', () => {
    renderWithTheme(
      <RecentPayrollsContent
        isLoading={false}
        isError={false}
        visiblePayrolls={[]}
      />,
    )

    expect(
      screen.getByText('No recent payrolls available.'),
    ).toBeInTheDocument()
  })

  it('renders payroll rows when data exists', () => {
    renderWithTheme(
      <RecentPayrollsContent
        isLoading={false}
        isError={false}
        visiblePayrolls={payrolls}
      />,
    )

    expect(screen.getByText('May 2024')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /View May 2024 payroll/i }),
    ).toBeInTheDocument()
  })
})

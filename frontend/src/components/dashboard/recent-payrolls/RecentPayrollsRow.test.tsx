import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { describe, expect, it, vi } from 'vitest'
import type { RecentPayrollRecord } from '../../../types/dashboard'
import { RecentPayrollsRow } from './RecentPayrollsRow'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

const payroll: RecentPayrollRecord = {
  id: 'pay-2024-05',
  payrollPeriod: 'May 2024',
  payoutDate: '2024-05-31',
  status: 'Completed',
  amount: '₹24,80,000',
}

describe('<RecentPayrollsRow />', () => {
  it('renders payroll details and formatted payout date', () => {
    renderWithTheme(<RecentPayrollsRow payroll={payroll} index={0} />)

    expect(screen.getByText('May 2024')).toBeInTheDocument()
    expect(screen.getByText('31 May 2024')).toBeInTheDocument()
    expect(screen.getByText('₹24,80,000')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders row-level view link and calls onViewPayroll when clicked', async () => {
    const onViewPayroll = vi.fn()
    renderWithTheme(
      <RecentPayrollsRow
        payroll={payroll}
        index={0}
        onViewPayroll={onViewPayroll}
      />,
    )

    const rowLink = screen.getByRole('link', { name: /View May 2024 payroll/i })
    await userEvent.click(rowLink)

    expect(rowLink).toHaveAttribute('href', '/payrolls/pay-2024-05')
    expect(onViewPayroll).toHaveBeenCalledWith('pay-2024-05')
  })
})

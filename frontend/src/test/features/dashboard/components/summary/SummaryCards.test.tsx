import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { SummaryCards } from '../../../../../features/dashboard/components/summary/SummaryCards'
import type { DashboardData } from '../../../../../features/dashboard/types/dashboard'

const theme = createTheme()

const mockData: DashboardData = {
  summaryCards: [
    { label: 'Total Employees', value: 120, metadata: '↑ 8 this month' },
    { label: 'Payroll Processed', value: '₹24,80,000', metadata: 'May 2024' },
    { label: 'Total Deductions', value: '₹3,45,000', metadata: 'May 2024' },
    { label: 'Net Salary Paid', value: '₹21,35,000', metadata: 'May 2024' },
  ],
  payrollSummary: {
    months: ['Dec', 'Jan'],
    values: [9000000, 12000000],
  },
  recentPayrolls: [],
}

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<SummaryCards />', () => {
  it('should render all summary cards', () => {
    renderWithTheme(<SummaryCards data={mockData} />)

    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('Payroll Processed')).toBeInTheDocument()
    expect(screen.getByText('Total Deductions')).toBeInTheDocument()
    expect(screen.getByText('Net Salary Paid')).toBeInTheDocument()
  })

  it('should display card values', () => {
    renderWithTheme(<SummaryCards data={mockData} />)

    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('₹24,80,000')).toBeInTheDocument()
  })

  it('should show loading skeletons when isLoading is true', () => {
    const { container } = renderWithTheme(<SummaryCards isLoading={true} />)

    const skeletons = container.querySelectorAll('[class*="MuiSkeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should display N/A when data is not provided', () => {
    renderWithTheme(
      <SummaryCards
        data={{
          ...mockData,
          summaryCards: [],
        }}
        isLoading={false}
      />,
    )

    expect(screen.getAllByText('N/A')).toHaveLength(4)
  })
})

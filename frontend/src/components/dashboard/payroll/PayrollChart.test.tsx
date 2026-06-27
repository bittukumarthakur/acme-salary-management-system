import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { PayrollChart } from './PayrollChart'
import type { PayrollSummary } from '../../../types/dashboard'

const theme = createTheme()

const mockPayrollData: PayrollSummary = {
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
  values: [9000000, 12000000, 14000000, 17000000, 21000000, 28000000],
}

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<PayrollChart />', () => {
  it('should render payroll summary heading', () => {
    renderWithTheme(<PayrollChart data={mockPayrollData} />)

    expect(screen.getByText('Payroll Summary')).toBeInTheDocument()
  })

  it('should render This Month button', () => {
    renderWithTheme(<PayrollChart data={mockPayrollData} />)

    expect(
      screen.getByRole('button', { name: /This Month/i }),
    ).toBeInTheDocument()
  })

  it('should display loading skeleton when isLoading is true', () => {
    const { container } = renderWithTheme(<PayrollChart isLoading={true} />)

    const skeleton = container.querySelector('[class*="MuiSkeleton"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('should render months from data', () => {
    renderWithTheme(<PayrollChart data={mockPayrollData} />)

    expect(screen.getByText('Dec')).toBeInTheDocument()
    expect(screen.getByText('May')).toBeInTheDocument()
  })

  it('should render SVG chart when data is provided', () => {
    const { container } = renderWithTheme(
      <PayrollChart data={mockPayrollData} />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

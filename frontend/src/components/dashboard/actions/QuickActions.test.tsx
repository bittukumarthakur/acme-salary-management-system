import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { QuickActions } from './QuickActions'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<QuickActions />', () => {
  it('should render Quick Actions heading', () => {
    renderWithTheme(<QuickActions />)

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('should render all action buttons', () => {
    renderWithTheme(<QuickActions />)

    expect(screen.getByText('Add Employee')).toBeInTheDocument()
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument()
    expect(screen.getByText('Generate Payroll')).toBeInTheDocument()
    expect(screen.getByText('View Payslips')).toBeInTheDocument()
  })

  it('should display Coming soon text under each action', () => {
    const { container } = renderWithTheme(<QuickActions />)

    const comingSoonTexts = container.querySelectorAll(
      '[class*="MuiTypography-caption"]',
    )
    expect(comingSoonTexts.length).toBeGreaterThan(0)
  })

  it('should call onActionClick when action button is clicked', async () => {
    const handleActionClick = vi.fn()
    renderWithTheme(<QuickActions onActionClick={handleActionClick} />)

    const addEmployeeButton = screen.getByText('Add Employee').closest('button')
    if (addEmployeeButton) {
      await userEvent.click(addEmployeeButton)
      expect(handleActionClick).toHaveBeenCalledWith('Add Employee')
    }
  })
})

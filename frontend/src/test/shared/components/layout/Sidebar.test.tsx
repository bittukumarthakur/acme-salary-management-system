import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { Sidebar } from '../../../../shared/components/layout/Sidebar'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d1f4f',
      contrastText: '#f5f7ff',
    },
  },
})

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<Sidebar />', () => {
  it('should render sidebar with app name', () => {
    renderWithTheme(<Sidebar />)

    expect(screen.getByText('Salary Portal')).toBeInTheDocument()
  })

  it('should render all navigation items', () => {
    renderWithTheme(<Sidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Employees')).toBeInTheDocument()
    expect(screen.getByText('Attendance | coming soon')).toBeInTheDocument()
    expect(screen.getByText('Payroll | coming soon')).toBeInTheDocument()
  })

  it('should render collapse button', () => {
    renderWithTheme(<Sidebar />)

    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument()
  })

  it('should call onCollapse when button is clicked', async () => {
    const handleCollapse = vi.fn()
    renderWithTheme(<Sidebar onCollapse={handleCollapse} />)

    const button = screen.getByRole('button', { name: 'Collapse' })
    await userEvent.click(button)

    expect(handleCollapse).toHaveBeenCalledOnce()
  })

  it('should show Expand text when collapsed', () => {
    renderWithTheme(<Sidebar collapsed={true} />)

    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument()
  })

  it('should disable unimplemented nav items and label them "coming soon"', () => {
    renderWithTheme(<Sidebar />)

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Employees' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Attendance | coming soon' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Payroll | coming soon' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Settings | coming soon' }),
    ).toBeDisabled()
  })

  it('should not call onSelectItem for a disabled item', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const handleSelect = vi.fn()
    renderWithTheme(<Sidebar onSelectItem={handleSelect} />)

    await user.click(
      screen.getByRole('button', { name: 'Attendance | coming soon' }),
    )

    expect(handleSelect).not.toHaveBeenCalled()
  })
})

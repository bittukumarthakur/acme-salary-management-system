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
    expect(screen.getByText('Attendance')).toBeInTheDocument()
    expect(screen.getByText('Payroll')).toBeInTheDocument()
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
})

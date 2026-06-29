import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { describe, expect, it, vi } from 'vitest'
import { RecentPayrollsHeader } from '../../../../../features/dashboard/components/recent-payrolls/RecentPayrollsHeader'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<RecentPayrollsHeader />', () => {
  it('renders section heading and View all link', () => {
    renderWithTheme(<RecentPayrollsHeader />)

    expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View all/i })).toBeInTheDocument()
  })

  it('calls onViewAll and does not navigate when View all is clicked', async () => {
    const onViewAll = vi.fn()
    renderWithTheme(<RecentPayrollsHeader onViewAll={onViewAll} />)

    const initialLocation = window.location.href
    const viewAllLink = screen.getByRole('link', { name: /View all/i })

    await userEvent.click(viewAllLink)

    expect(onViewAll).toHaveBeenCalledOnce()
    expect(viewAllLink).toHaveAttribute('href', '#')
    expect(window.location.href).toBe(initialLocation)
  })
})

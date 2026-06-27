import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { RecentPayrolls } from './RecentPayrolls'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<RecentPayrolls />', () => {
  it('should render Recent Payrolls heading', () => {
    renderWithTheme(<RecentPayrolls />)

    expect(screen.getByText('Recent Payrolls')).toBeInTheDocument()
  })

  it('should render View all button', () => {
    renderWithTheme(<RecentPayrolls />)

    expect(
      screen.getByRole('button', { name: /View all/i }),
    ).toBeInTheDocument()
  })

  it('should render Coming soon placeholder', () => {
    renderWithTheme(<RecentPayrolls />)

    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  it('should call onViewAll when View all button is clicked', async () => {
    const handleViewAll = vi.fn()
    renderWithTheme(<RecentPayrolls onViewAll={handleViewAll} />)

    const viewAllButton = screen.getByRole('button', { name: /View all/i })
    await userEvent.click(viewAllButton)

    expect(handleViewAll).toHaveBeenCalledOnce()
  })
})

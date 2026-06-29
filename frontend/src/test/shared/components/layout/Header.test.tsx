import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { Header } from '../../../../shared/components/layout/Header'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
  },
})

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('<Header />', () => {
  it('should render Dashboard title', () => {
    renderWithTheme(<Header />)

    expect(
      screen.getByRole('heading', { level: 4, name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('should render notification badge with count', () => {
    renderWithTheme(<Header notificationCount={5} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should render user name and role', () => {
    renderWithTheme(<Header userName="John Doe" userRole="Manager" />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()
  })

  it('should render default user name and role', () => {
    renderWithTheme(<Header />)

    expect(screen.getByText('HR Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should call onMenuClick when menu button is clicked', async () => {
    const handleMenuClick = vi.fn()
    renderWithTheme(<Header onMenuClick={handleMenuClick} />)

    const menuButton = screen.getByRole('button', { name: /Open menu/i })
    await userEvent.click(menuButton)

    expect(handleMenuClick).toHaveBeenCalledOnce()
  })

  it('should render user avatar text', () => {
    renderWithTheme(<Header userAvatarText="JD" />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})

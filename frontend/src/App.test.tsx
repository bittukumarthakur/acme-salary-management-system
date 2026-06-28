import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the dashboard shell with sidebar, header, and main sections', () => {
    render(<App />)

    expect(screen.getByText(/salary portal/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /payroll summary/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /recent payrolls/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /quick actions/i }),
    ).toBeInTheDocument()
  })

  it('shows sidebar items and visual-only controls', () => {
    render(<App />)

    expect(
      screen.getByRole('button', { name: /^dashboard$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^employees$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^attendance$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^payroll$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^payslips$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^reports$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^settings$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /collapse/i }),
    ).toBeInTheDocument()
  })

  it('renders four stat cards and coming soon placeholders', () => {
    render(<App />)

    expect(screen.getByText(/total employees/i)).toBeInTheDocument()
    expect(screen.getByText(/payroll processed/i)).toBeInTheDocument()
    expect(screen.getByText(/total deductions/i)).toBeInTheDocument()
    expect(screen.getByText(/net salary paid/i)).toBeInTheDocument()

    const comingSoonCues = screen.getAllByText(/coming soon/i)
    expect(comingSoonCues.length).toBeGreaterThanOrEqual(4)
  })

  it('shows topbar actions and switches to employees tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument()
    expect(screen.getByText(/hr admin/i)).toBeInTheDocument()
    expect(screen.getByText(/^admin$/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /this month/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /view all/i }))
    await user.click(screen.getByRole('button', { name: /^employees$/i }))

    expect(
      screen.getAllByRole('heading', { name: /^employees$/i }).length,
    ).toBeGreaterThanOrEqual(1)
  })
})

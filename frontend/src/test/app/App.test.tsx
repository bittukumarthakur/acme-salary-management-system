import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../app/App'

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
      screen.getByRole('button', { name: /^attendance \| coming soon$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^payroll \| coming soon$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^payslips \| coming soon$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^reports \| coming soon$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^settings \| coming soon$/i }),
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
    render(<App />)

    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument()
    expect(screen.getByText(/hr admin/i)).toBeInTheDocument()
    expect(screen.getByText(/^admin$/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /this month/i }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^employees$/i }))

    expect(
      screen.getAllByRole('heading', { name: /^employees$/i }).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('navigates from Employees tab to Add Employee page', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /^employees$/i }))
    fireEvent.click(screen.getByRole('button', { name: /add employee/i }))

    expect(
      screen.getAllByRole('heading', { name: /add employee/i }).length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByRole('heading', { name: /personal information/i }),
    ).toBeInTheDocument()
  })

  it.each(['Attendance', 'Payroll', 'Payslips', 'Reports', 'Settings'])(
    'disables the %s tab because it is not implemented yet',
    (item) => {
      render(<App />)

      expect(
        screen.getByRole('button', {
          name: new RegExp(`^${item} \\| coming soon$`, 'i'),
        }),
      ).toBeDisabled()
    },
  )
})

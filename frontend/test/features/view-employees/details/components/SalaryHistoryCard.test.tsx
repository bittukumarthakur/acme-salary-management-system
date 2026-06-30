import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { SalaryHistoryEntry } from '../../../../../src/features/employees/types/employees'
import { SalaryHistoryCard } from '../../../../../src/features/view-employees/details/components/SalaryHistoryCard'

describe('SalaryHistoryCard', () => {
  const mockEntry: SalaryHistoryEntry = {
    id: 'rev_1',
    effectiveFrom: '2024-01-01',
    currency: 'INR',
    baseSalaryMonthly: 2252910,
    netPayMonthly: 247821,
    ctcAnnual: 6218040,
    isCurrent: true,
  }

  it('renders the salary history card with all required fields', () => {
    render(<SalaryHistoryCard entry={mockEntry} />)

    expect(screen.getByText('Effective From')).toBeInTheDocument()
    expect(screen.getByText('Base Salary (Monthly)')).toBeInTheDocument()
    expect(screen.getByText('Net Pay (Monthly)')).toBeInTheDocument()
    expect(screen.getByText('CTC (Annual)')).toBeInTheDocument()
  })

  it('displays the correct date format (DD MMM YYYY)', () => {
    render(<SalaryHistoryCard entry={mockEntry} />)
    // Expecting "01 Jan 2024" format
    const dateElements = screen.getAllByText('01 Jan 2024')
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('renders currency-formatted values', () => {
    render(<SalaryHistoryCard entry={mockEntry} />)
    // The formatter adds currency symbol and formatting
    const baseSalaryValue = screen.getByText(/22,52,910|2252910/)
    expect(baseSalaryValue).toBeInTheDocument()
  })

  it('shows "Current" badge when isCurrent is true', () => {
    render(<SalaryHistoryCard entry={mockEntry} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('does not show "Current" badge when isCurrent is false', () => {
    const oldEntry: SalaryHistoryEntry = {
      ...mockEntry,
      isCurrent: false,
    }
    render(<SalaryHistoryCard entry={oldEntry} />)
    // The "Current" text should not appear when isCurrent is false
    const badges = screen.queryAllByText('Current')
    expect(badges.length).toBe(0)
  })

  it('handles null effectiveFrom gracefully', () => {
    const entryWithoutDate: SalaryHistoryEntry = {
      ...mockEntry,
      effectiveFrom: null,
    }
    render(<SalaryHistoryCard entry={entryWithoutDate} />)
    expect(screen.getByText('No date')).toBeInTheDocument()
  })
})

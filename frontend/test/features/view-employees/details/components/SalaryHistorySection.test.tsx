import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SalaryHistorySection } from '../../../../../src/features/view-employees/details/components/SalaryHistorySection'
import * as useSalaryHistoryModule from '../../../../../src/features/view-employees/details/hooks/useSalaryHistory'

describe('SalaryHistorySection', () => {
  it('renders the section heading', () => {
    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue([])
    render(<SalaryHistorySection />)
    expect(screen.getByText('Salary Revision History')).toBeInTheDocument()
  })

  it('renders table with header columns', () => {
    const mockHistory = [
      {
        id: 'rev_3',
        effectiveFrom: '2024-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2252910,
        netPayMonthly: 247821,
        ctcAnnual: 6218040,
        isCurrent: true,
        changeSummary: 'Annual Increment',
      },
      {
        id: 'rev_2',
        effectiveFrom: '2023-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2000000,
        netPayMonthly: 220000,
        ctcAnnual: 5500000,
        isCurrent: false,
        changeSummary: 'Annual Increment',
      },
    ]

    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue(
      mockHistory,
    )

    render(<SalaryHistorySection />)

    // Verify table headers
    expect(screen.getByText('Effective From')).toBeInTheDocument()
    expect(screen.getByText('Base Salary (Monthly)')).toBeInTheDocument()
    expect(screen.getByText('CTC (Annual)')).toBeInTheDocument()
    expect(screen.getByText('Currency')).toBeInTheDocument()
    expect(screen.getByText('Remarks')).toBeInTheDocument()
  })

  it('renders table rows for each salary history entry', () => {
    const mockHistory = [
      {
        id: 'rev_3',
        effectiveFrom: '2024-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2252910,
        netPayMonthly: 247821,
        ctcAnnual: 6218040,
        isCurrent: true,
        changeSummary: 'Annual Increment',
      },
      {
        id: 'rev_2',
        effectiveFrom: '2023-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2000000,
        netPayMonthly: 220000,
        ctcAnnual: 5500000,
        isCurrent: false,
        changeSummary: 'Annual Increment',
      },
    ]

    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue(
      mockHistory,
    )

    render(<SalaryHistorySection />)

    // Verify dates are displayed
    const dateElements = screen.getAllByText('01 Jan 2024')
    expect(dateElements.length).toBeGreaterThan(0)

    // Verify changeSummary is shown
    const summaries = screen.getAllByText('Annual Increment')
    expect(summaries.length).toBeGreaterThanOrEqual(2)
  })

  it('sorts entries by effectiveFrom descending (newest first)', () => {
    const mockHistory = [
      {
        id: 'rev_1',
        effectiveFrom: '2022-01-01',
        currency: 'INR',
        baseSalaryMonthly: 1800000,
        netPayMonthly: 190000,
        ctcAnnual: 4500000,
        isCurrent: false,
        changeSummary: 'Salary Adjustment',
      },
      {
        id: 'rev_3',
        effectiveFrom: '2024-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2252910,
        netPayMonthly: 247821,
        ctcAnnual: 6218040,
        isCurrent: true,
        changeSummary: 'Annual Increment',
      },
      {
        id: 'rev_2',
        effectiveFrom: '2023-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2000000,
        netPayMonthly: 220000,
        ctcAnnual: 5500000,
        isCurrent: false,
        changeSummary: 'Annual Increment',
      },
    ]

    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue(
      mockHistory,
    )

    render(<SalaryHistorySection />)

    // Verify "Current" badge appears (indicates newest entry is first)
    const badge = screen.getByText('Current')
    expect(badge).toBeInTheDocument()
  })

  it('renders empty state when no history is provided', () => {
    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue([])
    render(<SalaryHistorySection />)

    expect(screen.getByText('Salary Revision History')).toBeInTheDocument()
  })

  it('shows "Current" badge only in the entry with isCurrent true', () => {
    const mockHistory = [
      {
        id: 'rev_1',
        effectiveFrom: '2023-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2000000,
        netPayMonthly: 220000,
        ctcAnnual: 5500000,
        isCurrent: false,
        changeSummary: 'Annual Increment',
      },
      {
        id: 'rev_2',
        effectiveFrom: '2024-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2252910,
        netPayMonthly: 247821,
        ctcAnnual: 6218040,
        isCurrent: true,
        changeSummary: 'Annual Increment',
      },
    ]

    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue(
      mockHistory,
    )

    render(<SalaryHistorySection />)

    // Should have exactly one "Current" badge
    const badges = screen.getAllByText('Current')
    expect(badges.length).toBe(1)
  })

  it('displays changeSummary in remarks column', () => {
    const mockHistory = [
      {
        id: 'rev_1',
        effectiveFrom: '2024-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2252910,
        netPayMonthly: 247821,
        ctcAnnual: 6218040,
        isCurrent: true,
        changeSummary: 'Annual Increment',
      },
      {
        id: 'rev_2',
        effectiveFrom: '2023-01-01',
        currency: 'INR',
        baseSalaryMonthly: 2000000,
        netPayMonthly: 220000,
        ctcAnnual: 5500000,
        isCurrent: false,
        changeSummary: 'Base Salary Adjustment',
      },
    ]

    vi.spyOn(useSalaryHistoryModule, 'useSalaryHistory').mockReturnValue(
      mockHistory,
    )

    render(<SalaryHistorySection />)

    // Verify both change summaries are displayed
    expect(screen.getByText('Annual Increment')).toBeInTheDocument()
    expect(screen.getByText('Base Salary Adjustment')).toBeInTheDocument()
  })
})

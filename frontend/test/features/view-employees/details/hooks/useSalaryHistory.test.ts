import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSalaryHistory } from '../../../../../src/features/view-employees/details/hooks/useSalaryHistory'

describe('useSalaryHistory', () => {
  it('returns an array of salary history entries', () => {
    const { result } = renderHook(() => useSalaryHistory())
    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('each entry has the required API contract fields', () => {
    const { result } = renderHook(() => useSalaryHistory())
    const entry = result.current[0]

    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('effectiveFrom')
    expect(entry).toHaveProperty('currency')
    expect(entry).toHaveProperty('baseSalaryMonthly')
    expect(entry).toHaveProperty('netPayMonthly')
    expect(entry).toHaveProperty('ctcAnnual')
    expect(entry).toHaveProperty('isCurrent')
  })

  it('has correct data types for each field', () => {
    const { result } = renderHook(() => useSalaryHistory())
    const entry = result.current[0]

    expect(typeof entry.id).toBe('string')
    expect(typeof entry.effectiveFrom).toBe('string')
    expect(typeof entry.currency).toBe('string')
    expect(typeof entry.baseSalaryMonthly).toBe('number')
    expect(typeof entry.netPayMonthly).toBe('number')
    expect(typeof entry.ctcAnnual).toBe('number')
    expect(typeof entry.isCurrent).toBe('boolean')
  })

  it('has exactly one entry with isCurrent true', () => {
    const { result } = renderHook(() => useSalaryHistory())
    const currentEntries = result.current.filter((entry) => entry.isCurrent)
    expect(currentEntries.length).toBe(1)
  })

  it('current entry is the one with the most recent effectiveFrom', () => {
    const { result } = renderHook(() => useSalaryHistory())
    const currentEntry = result.current.find((entry) => entry.isCurrent)
    const allDates = result.current.map((e) => new Date(e.effectiveFrom || ''))
    const maxDate = new Date(
      Math.max(...allDates.map((d) => d.getTime())),
    ).toISOString()

    if (currentEntry?.effectiveFrom) {
      const currentDate = new Date(currentEntry.effectiveFrom).toISOString()
      expect(currentDate).toBe(maxDate.split('T')[0] + maxDate.substring(10))
    }
  })

  it('returns hardcoded data (not empty)', () => {
    const { result } = renderHook(() => useSalaryHistory())
    expect(result.current.length).toBeGreaterThanOrEqual(1)
  })

  it('returns consistent data on multiple calls', () => {
    const { result: result1 } = renderHook(() => useSalaryHistory())
    const { result: result2 } = renderHook(() => useSalaryHistory())

    expect(result1.current.length).toBe(result2.current.length)
    expect(result1.current[0]?.id).toBe(result2.current[0]?.id)
  })
})

import { describe, it, expect } from 'vitest'
import {
  formatHistoryDate,
  getDisplayValue,
  getInitials,
} from '../../../../../src/features/view-employees/details/components/utils'

describe('formatHistoryDate', () => {
  it('formats ISO date string to DD MMM YYYY format', () => {
    const result = formatHistoryDate('2024-01-01')
    expect(result).toBe('01 Jan 2024')
  })

  it('handles different months correctly', () => {
    expect(formatHistoryDate('2024-02-15')).toBe('15 Feb 2024')
    expect(formatHistoryDate('2024-12-31')).toBe('31 Dec 2024')
  })

  it('returns original string on invalid date', () => {
    const invalidDate = 'invalid-date'
    const result = formatHistoryDate(invalidDate)
    expect(result).toBe(invalidDate)
  })

  it('returns original string for empty string', () => {
    const result = formatHistoryDate('')
    expect(result).toBe('')
  })

  it('handles leap year dates correctly', () => {
    const result = formatHistoryDate('2024-02-29')
    expect(result).toBe('29 Feb 2024')
  })

  it('formats future dates correctly', () => {
    const result = formatHistoryDate('2025-06-15')
    expect(result).toBe('15 Jun 2025')
  })

  it('formats dates with leading zeros correctly', () => {
    const result = formatHistoryDate('2024-03-05')
    expect(result).toBe('05 Mar 2024')
  })
})

describe('getDisplayValue', () => {
  it('returns the value when it is a non-empty string', () => {
    expect(getDisplayValue('Some value')).toBe('Some value')
  })

  it('returns "Not available" when value is null', () => {
    expect(getDisplayValue(null)).toBe('Not available')
  })

  it('returns "Not available" when value is undefined', () => {
    expect(getDisplayValue(undefined)).toBe('Not available')
  })

  it('returns "Not available" when value is an empty string', () => {
    expect(getDisplayValue('')).toBe('Not available')
  })

  it('returns "Not available" when value is only whitespace', () => {
    expect(getDisplayValue('   ')).toBe('Not available')
  })
})

describe('getInitials', () => {
  it('returns initials for a full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('handles single names', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('handles multiple middle names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('handles names with extra whitespace', () => {
    expect(getInitials('John    Doe')).toBe('JD')
  })

  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('')
  })

  it('handles lowercase names', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('converts lowercase initials to uppercase', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

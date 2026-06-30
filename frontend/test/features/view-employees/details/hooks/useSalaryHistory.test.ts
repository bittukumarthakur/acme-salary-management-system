import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSalaryHistory } from '../../../../../src/features/view-employees/details/hooks/useSalaryHistory'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(() => ({ employeeId: 'EMP0001' })),
  }
})

const mockSalaryData = [
  {
    id: 'rev_3',
    effectiveFrom: '2024-01-01',
    baseSalaryMonthly: 2252910,
    netPayMonthly: 247821,
    ctcAnnual: 6218040,
    isCurrent: true,
  },
  {
    id: 'rev_2',
    effectiveFrom: '2023-01-01',
    baseSalaryMonthly: 2000000,
    netPayMonthly: 220000,
    ctcAnnual: 5500000,
    isCurrent: false,
  },
]

describe('useSalaryHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('initializes with empty history and loading state', () => {
    vi.mocked(global.fetch).mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves
        }),
    )

    const { result } = renderHook(() => useSalaryHistory())

    expect(result.current.history).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('fetches salary history from the API endpoint', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSalaryData,
    } as Response)

    const { result } = renderHook(() => useSalaryHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual(mockSalaryData)
    expect(result.current.error).toBe(null)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/employees/EMP0001/salary-history',
    )
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Network error'
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useSalaryHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual([])
    expect(result.current.error).not.toBe(null)
    expect(result.current.error?.message).toContain(errorMessage)
  })

  it('handles non-200 responses as errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    const { result } = renderHook(() => useSalaryHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual([])
    expect(result.current.error).not.toBe(null)
    expect(result.current.error?.message).toContain('Failed to fetch')
  })
})

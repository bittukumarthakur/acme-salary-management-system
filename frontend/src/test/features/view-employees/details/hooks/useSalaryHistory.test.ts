import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSalaryHistory } from '../../../../../features/view-employees/details/hooks/useSalaryHistory'
import { apiRoutes } from '../../../../../shared/api/endpoints'

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
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('initializes with empty history and loading state', () => {
    vi.mocked(globalThis.fetch).mockImplementation(
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

  it('requests the salary-history route for the current employee', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSalaryData,
    } as Response)

    const { result } = renderHook(() => useSalaryHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual(mockSalaryData)
    expect(result.current.error).toBe(null)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      apiRoutes.employeeSalaryHistory('EMP0001'),
    )
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Network error'
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useSalaryHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual([])
    expect(result.current.error).not.toBe(null)
    expect(result.current.error?.message).toContain(errorMessage)
  })

  it('handles non-200 responses as errors', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
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

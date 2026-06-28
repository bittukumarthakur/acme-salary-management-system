import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEmployeesData } from './useEmployeesData'
import * as employeesApi from '../services/employeesApi'
import type { EmployeesListResponse } from '../types/employees'

vi.mock('../services/employeesApi', async () => {
  const actual = await vi.importActual<
    typeof import('../services/employeesApi')
  >('../services/employeesApi')

  return {
    ...actual,
    fetchEmployeesData: vi.fn(),
  }
})

const mockEmployeesResponse: EmployeesListResponse = {
  data: [
    {
      employeeId: 'EMP00001',
      fullName: 'Jalyn Koch',
      email: 'jalyn.koch.1@acme.com',
      department: 'FINANCE',
      designation: 'MARKETING_MANAGER',
      basicSalary: 1504143,
      currency: 'INR',
      status: 'ACTIVE',
      joiningDate: '2018-05-24',
      employmentType: 'PERMANENT',
      country: 'India',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
  ],
  meta: {
    page: 1,
    pageLimit: 10,
    totalRecords: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    currency: 'INR',
    targetCurrency: 'INR',
    conversion: {
      rate: 1,
      convertedAt: '2026-06-28T12:10:47.363Z',
    },
  },
  filters: {
    applied: {
      search: '',
      department: '',
      status: '',
    },
  },
}

describe('useEmployeesData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads employees with default pagination', async () => {
    vi.mocked(employeesApi.fetchEmployeesData).mockResolvedValue(
      mockEmployeesResponse,
    )

    const { result } = renderHook(() => useEmployeesData())

    await waitFor(() => {
      expect(result.current.state).toBe('success')
    })

    expect(employeesApi.fetchEmployeesData).toHaveBeenCalledWith({
      search: '',
      department: '',
      status: '',
      page: 1,
      pageLimit: 10,
      targetCurrencyCode: 'INR',
    })
  })

  it('debounces search input and includes search in request after 300ms', async () => {
    vi.mocked(employeesApi.fetchEmployeesData).mockResolvedValue(
      mockEmployeesResponse,
    )

    const { result } = renderHook(() => useEmployeesData())

    await waitFor(() => {
      expect(result.current.state).toBe('success')
    })

    vi.useFakeTimers()

    vi.mocked(employeesApi.fetchEmployeesData).mockClear()

    act(() => {
      result.current.setSearchTerm('jalyn')
    })

    await act(async () => {
      vi.advanceTimersByTime(299)
    })
    expect(employeesApi.fetchEmployeesData).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(25)
      await Promise.resolve()
    })

    expect(employeesApi.fetchEmployeesData).toHaveBeenCalledWith({
      search: 'jalyn',
      department: '',
      status: '',
      page: 1,
      pageLimit: 10,
      targetCurrencyCode: 'INR',
    })

    vi.useRealTimers()
  })

  it('applies department and status filters and resets page to 1', async () => {
    vi.mocked(employeesApi.fetchEmployeesData).mockResolvedValue(
      mockEmployeesResponse,
    )

    const { result } = renderHook(() => useEmployeesData())

    await waitFor(() => {
      expect(result.current.state).toBe('success')
    })

    act(() => {
      result.current.setPage(3)
    })

    await waitFor(() => {
      expect(employeesApi.fetchEmployeesData).toHaveBeenCalledWith({
        search: '',
        department: '',
        status: '',
        page: 3,
        pageLimit: 10,
        targetCurrencyCode: 'INR',
      })
    })

    act(() => {
      result.current.setDepartment('FINANCE')
      result.current.setStatus('ACTIVE')
    })

    await waitFor(() => {
      expect(employeesApi.fetchEmployeesData).toHaveBeenLastCalledWith({
        search: '',
        department: 'FINANCE',
        status: 'ACTIVE',
        page: 1,
        pageLimit: 10,
        targetCurrencyCode: 'INR',
      })
    })
  })

  it('supports retry from error state', async () => {
    const mockFetch = vi.fn()
    mockFetch
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce(mockEmployeesResponse)
    vi.mocked(employeesApi.fetchEmployeesData).mockImplementation(mockFetch)

    const { result } = renderHook(() => useEmployeesData())

    await waitFor(() => {
      expect(result.current.state).toBe('error')
    })

    await act(async () => {
      await result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.state).toBe('success')
    })
  })
})

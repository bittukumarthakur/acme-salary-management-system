import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardData } from './useDashboardData'
import * as dashboardApi from '../services/dashboardApi'
import type { DashboardData } from '../types/dashboard'

vi.mock('../services/dashboardApi')

const mockDashboardData: DashboardData = {
  summaryCards: [
    { label: 'Total Employees', value: 120, metadata: '↑ 8 this month' },
    { label: 'Payroll Processed', value: '₹24,80,000', metadata: 'May 2024' },
  ],
  payrollSummary: {
    months: ['Dec', 'Jan', 'Feb', 'Mar'],
    values: [9000000, 12000000, 14000000, 17000000],
  },
}

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start in loading state', () => {
    const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}))
    vi.mocked(dashboardApi.fetchDashboardData).mockImplementation(mockFetch)

    const { result } = renderHook(() => useDashboardData())

    expect(result.current.state).toBe('loading')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should transition to success state when data loads', async () => {
    vi.mocked(dashboardApi.fetchDashboardData).mockResolvedValue(
      mockDashboardData,
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.state).toBe('success')
    })

    expect(result.current.data).toEqual(mockDashboardData)
    expect(result.current.error).toBeNull()
  })

  it('should transition to error state when fetch fails', async () => {
    const error = new Error('Network error')
    vi.mocked(dashboardApi.fetchDashboardData).mockRejectedValue(error)

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.state).toBe('error')
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network error')
  })

  it('should have retry function that reloads data', async () => {
    const mockFetch = vi.fn()
    mockFetch
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce(mockDashboardData)

    vi.mocked(dashboardApi.fetchDashboardData).mockImplementation(mockFetch)

    const { result } = renderHook(() => useDashboardData())

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.state).toBe('error')
    })

    // Retry
    await act(async () => {
      await result.current.retry()
    })

    // Wait for success
    await waitFor(() => {
      expect(result.current.state).toBe('success')
    })

    expect(result.current.data).toEqual(mockDashboardData)
  })
})

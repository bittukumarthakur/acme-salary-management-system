import { useEffect, useState } from 'react'
import { fetchDashboardData } from '../services/dashboardApi'
import type { DashboardStateValue } from '../types/dashboard'

/**
 * Custom hook for fetching and managing dashboard data.
 * Encapsulates all data fetching logic and state management for the dashboard.
 */
export function useDashboardData() {
  const [state, setState] = useState<DashboardStateValue>({
    state: 'loading',
    data: null,
    error: null,
  })

  const loadData = async () => {
    setState({ state: 'loading', data: null, error: null })
    try {
      const result = await fetchDashboardData()
      setState({ state: 'success', data: result, error: null })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      setState({ state: 'error', data: null, error: errorMessage })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadData()
    }
    fetchData()
  }, [])

  return {
    ...state,
    retry: loadData,
  }
}

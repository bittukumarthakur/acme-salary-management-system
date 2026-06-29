import { useCallback, useEffect, useState } from 'react'
import {
  createPlaceholderDashboardData,
  fetchDashboardData,
} from '../services/dashboardApi'
import type { DashboardStateValue } from '../types/dashboard'

/**
 * Custom hook for fetching and managing dashboard data.
 * Encapsulates all data fetching logic and state management for the dashboard.
 */
export function useDashboardData() {
  const [state, setState] = useState<DashboardStateValue>({
    state: 'loading',
    data: createPlaceholderDashboardData(),
    error: null,
  })

  const fetchLatestDashboardData = useCallback(
    async (
      placeholderData: ReturnType<typeof createPlaceholderDashboardData>,
    ) => {
      try {
        const result = await fetchDashboardData()
        setState({ state: 'success', data: result, error: null })
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch dashboard data'
        setState({ state: 'error', data: placeholderData, error: errorMessage })
      }
    },
    [],
  )

  const loadData = useCallback(async () => {
    const placeholderData = createPlaceholderDashboardData()

    setState({ state: 'loading', data: placeholderData, error: null })
    await fetchLatestDashboardData(placeholderData)
  }, [fetchLatestDashboardData])

  useEffect(() => {
    const placeholderData = createPlaceholderDashboardData()

    queueMicrotask(() => {
      void fetchLatestDashboardData(placeholderData)
    })
  }, [fetchLatestDashboardData])

  return {
    ...state,
    retry: loadData,
  }
}

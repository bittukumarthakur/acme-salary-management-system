'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SalaryHistoryEntry } from '../../../employees/types/employees'
import { apiRoutes } from '../../../../shared/api/endpoints'

/**
 * Hook to fetch salary history from the dedicated API endpoint.
 * Fetches all salary revisions for the current employee from:
 * GET /api/v1/employees/:id/salary-history
 */
export function useSalaryHistory() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const [history, setHistory] = useState<SalaryHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!employeeId) {
      return
    }

    const fetchSalaryHistory = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          apiRoutes.employeeSalaryHistory(employeeId),
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch salary history: ${response.statusText}`,
          )
        }

        const data = (await response.json()) as SalaryHistoryEntry[]
        setHistory(data)
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Unknown error')
        setError(errorObj)
        setHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalaryHistory()
  }, [employeeId])

  return { history, isLoading, error }
}

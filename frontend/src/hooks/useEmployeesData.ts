import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchEmployeesData,
  type EmployeesQueryParams,
} from '../services/employeesApi'
import type {
  EmployeeDepartment,
  EmployeeListItem,
  EmployeeStatus,
  EmployeesMeta,
} from '../types/employees'

type EmployeesViewState = 'loading' | 'success' | 'error'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_LIMIT = 10
const DEFAULT_CURRENCY = 'INR'

const emptyMeta: EmployeesMeta = {
  page: DEFAULT_PAGE,
  pageLimit: DEFAULT_PAGE_LIMIT,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  currency: DEFAULT_CURRENCY,
  targetCurrency: DEFAULT_CURRENCY,
  conversion: {
    rate: 1,
    convertedAt: new Date(0).toISOString(),
  },
}

export function useEmployeesData() {
  const [state, setState] = useState<EmployeesViewState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<EmployeeListItem[]>([])
  const [meta, setMeta] = useState<EmployeesMeta>(emptyMeta)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [department, setDepartmentState] = useState<EmployeeDepartment | ''>('')
  const [status, setStatusState] = useState<EmployeeStatus | ''>('')
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [pageLimit, setPageLimit] = useState(DEFAULT_PAGE_LIMIT)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
      setPage(DEFAULT_PAGE)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchTerm])

  const query = useMemo<EmployeesQueryParams>(
    () => ({
      search: debouncedSearchTerm,
      department,
      status,
      page,
      pageLimit,
      targetCurrencyCode: DEFAULT_CURRENCY,
    }),
    [debouncedSearchTerm, department, status, page, pageLimit],
  )

  const loadEmployees = useCallback(async () => {
    setState('loading')
    setError(null)

    try {
      const result = await fetchEmployeesData(query)
      setEmployees(result.data)
      setMeta(result.meta)
      setState('success')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch employees data'
      setError(message)
      setState('error')
    }
  }, [query])

  useEffect(() => {
    queueMicrotask(() => {
      void loadEmployees()
    })
  }, [loadEmployees])

  const setDepartment = useCallback(
    (nextDepartment: EmployeeDepartment | '') => {
      setDepartmentState(nextDepartment)
      setPage(DEFAULT_PAGE)
    },
    [],
  )

  const setStatus = useCallback((nextStatus: EmployeeStatus | '') => {
    setStatusState(nextStatus)
    setPage(DEFAULT_PAGE)
  }, [])

  const retry = useCallback(async () => {
    await loadEmployees()
  }, [loadEmployees])

  return {
    state,
    error,
    employees,
    meta,
    searchTerm,
    department,
    status,
    setSearchTerm,
    setDepartment,
    setStatus,
    setPage,
    setPageLimit,
    retry,
  }
}

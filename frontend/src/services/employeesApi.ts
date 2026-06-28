import type {
  EmployeeDepartment,
  EmployeeStatus,
  EmployeesListResponse,
} from '../types/employees'

export interface EmployeesQueryParams {
  search?: string
  department?: EmployeeDepartment | ''
  status?: EmployeeStatus | ''
  targetCurrencyCode?: string
  page: number
  pageLimit: number
}

const clientEnv = import.meta.env as Record<string, string | undefined>
const configuredApiBaseUrl = clientEnv.ACME_BACKEND_API_BASE_URL?.trim() ?? ''
const EMPLOYEES_ENDPOINT = `${configuredApiBaseUrl}/api/v1/employees`

function buildEmployeesUrl(query: EmployeesQueryParams): string {
  const params = new URLSearchParams()

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.department) {
    params.set('department', query.department)
  }

  if (query.status) {
    params.set('status', query.status)
  }

  if (query.targetCurrencyCode) {
    params.set('targetCurrencyCode', query.targetCurrencyCode)
  }

  params.set('page', String(query.page))
  params.set('pageLimit', String(query.pageLimit))

  return `${EMPLOYEES_ENDPOINT}?${params.toString()}`
}

export async function fetchEmployeesData(
  query: EmployeesQueryParams,
): Promise<EmployeesListResponse> {
  const response = await fetch(buildEmployeesUrl(query))

  if (!response.ok) {
    throw new Error('Failed to fetch employees data')
  }

  const result = (await response.json()) as EmployeesListResponse
  return result
}

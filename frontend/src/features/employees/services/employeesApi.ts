import type {
  CreateEmployeePayload,
  CreateEmployeeResponse,
  EmployeeDepartment,
  EmployeeDetailsResponse,
  EmployeeListItem,
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
const configuredApiBaseUrl =
  clientEnv.ACME_BACKEND_API_BASE_URL?.trim().replace(/\/$/, '') ?? ''
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

export async function fetchEmployeeDetails(
  employeeId: string,
): Promise<EmployeeDetailsResponse> {
  const response = await fetch(
    `${EMPLOYEES_ENDPOINT}/${encodeURIComponent(employeeId)}`,
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Employee not found')
    }

    if (response.status === 400) {
      throw new Error('Invalid employee ID')
    }

    throw new Error('Failed to fetch employee details')
  }

  const result = (await response.json()) as EmployeeDetailsResponse
  return result
}

export async function isEmployeeIdAvailable(
  employeeId: string,
): Promise<boolean> {
  const result = await fetchEmployeesData({
    search: employeeId,
    page: 1,
    pageLimit: 25,
  })

  const hasMatch = result.data.some(
    (employee: EmployeeListItem) =>
      employee.employeeId.toLowerCase() === employeeId.toLowerCase(),
  )

  return !hasMatch
}

export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<CreateEmployeeResponse> {
  const response = await fetch(EMPLOYEES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Employee ID must be unique')
    }

    throw new Error('Failed to create employee')
  }

  const result = (await response.json()) as CreateEmployeeResponse
  return result
}

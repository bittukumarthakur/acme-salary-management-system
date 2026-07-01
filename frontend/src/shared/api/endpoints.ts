/**
 * Centralized backend API endpoints.
 *
 * Every frontend network call resolves its URL through this module so the
 * backend base URL (configured via `ACME_BACKEND_API_BASE_URL`) is applied
 * consistently. An empty base URL means same-origin, which the Vite dev proxy
 * forwards to the backend.
 */

/**
 * Resolves the configured backend base URL with any trailing slash removed.
 * Read at call time so it reflects the current environment (and test stubs).
 */
export function getApiBaseUrl(): string {
  const clientEnv = import.meta.env as Record<string, string | undefined>
  return clientEnv.ACME_BACKEND_API_BASE_URL?.trim().replace(/\/$/, '') ?? ''
}

const apiV1 = () => `${getApiBaseUrl()}/api/v1`

/**
 * Grouped backend route builders. Each returns a fully-qualified URL.
 */
export const apiRoutes = {
  employees: () => `${apiV1()}/employees`,
  employee: (employeeId: string) =>
    `${apiV1()}/employees/${encodeURIComponent(employeeId)}`,
  employeeSalaryHistory: (employeeId: string) =>
    `${apiV1()}/employees/${encodeURIComponent(employeeId)}/salary-history`,
  dashboard: () => `${apiV1()}/dashboard`,
}

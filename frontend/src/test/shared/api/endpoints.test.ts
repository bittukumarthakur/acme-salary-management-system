import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRoutes, getApiBaseUrl } from '../../../shared/api/endpoints'

describe('getApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns an empty string when no base URL is configured', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', '')
    expect(getApiBaseUrl()).toBe('')
  })

  it('returns the configured base URL', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', 'https://api.example.com')
    expect(getApiBaseUrl()).toBe('https://api.example.com')
  })

  it('trims a trailing slash', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', 'https://api.example.com/')
    expect(getApiBaseUrl()).toBe('https://api.example.com')
  })

  it('trims surrounding whitespace', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', '  https://api.example.com  ')
    expect(getApiBaseUrl()).toBe('https://api.example.com')
  })
})

describe('apiRoutes', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('builds employees, dashboard, and employee routes with the base URL', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', 'https://api.example.com')

    expect(apiRoutes.employees()).toBe(
      'https://api.example.com/api/v1/employees',
    )
    expect(apiRoutes.dashboard()).toBe(
      'https://api.example.com/api/v1/dashboard',
    )
    expect(apiRoutes.employee('EMP0001')).toBe(
      'https://api.example.com/api/v1/employees/EMP0001',
    )
  })

  it('builds the salary-history route for an employee', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', 'https://api.example.com')

    expect(apiRoutes.employeeSalaryHistory('EMP0001')).toBe(
      'https://api.example.com/api/v1/employees/EMP0001/salary-history',
    )
  })

  it('URL-encodes the employee id path segment', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', '')

    expect(apiRoutes.employee('a/b?')).toBe('/api/v1/employees/a%2Fb%3F')
    expect(apiRoutes.employeeSalaryHistory('a/b?')).toBe(
      '/api/v1/employees/a%2Fb%3F/salary-history',
    )
  })

  it('falls back to same-origin paths when no base URL is configured', () => {
    vi.stubEnv('ACME_BACKEND_API_BASE_URL', '')

    expect(apiRoutes.employees()).toBe('/api/v1/employees')
    expect(apiRoutes.dashboard()).toBe('/api/v1/dashboard')
  })
})

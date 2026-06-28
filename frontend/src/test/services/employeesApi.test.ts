import {
  fetchEmployeesData,
  type EmployeesQueryParams,
} from '../../services/employeesApi'

const expectedBaseUrl =
  (import.meta.env.ACME_BACKEND_API_BASE_URL as string | undefined)?.trim() ??
  ''

const expectedEndpoint = expectedBaseUrl
  ? `${expectedBaseUrl.replace(/\/$/, '')}/api/v1/employees`
  : '/api/v1/employees'

const employeesApiResponse = {
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

describe('employeesApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requests employees endpoint with query params', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => employeesApiResponse,
    } as Response)

    const query: EmployeesQueryParams = {
      search: 'jalyn',
      department: 'FINANCE',
      status: 'ACTIVE',
      page: 2,
      pageLimit: 5,
      targetCurrencyCode: 'INR',
    }

    await fetchEmployeesData(query)

    const calledUrl = new URL(
      fetchSpy.mock.calls[0][0] as string,
      'http://local.test',
    )
    expect(calledUrl.pathname).toBe('/api/v1/employees')
    expect(calledUrl.searchParams.get('search')).toBe('jalyn')
    expect(calledUrl.searchParams.get('department')).toBe('FINANCE')
    expect(calledUrl.searchParams.get('status')).toBe('ACTIVE')
    expect(calledUrl.searchParams.get('page')).toBe('2')
    expect(calledUrl.searchParams.get('pageLimit')).toBe('5')
    expect(calledUrl.searchParams.get('targetCurrencyCode')).toBe('INR')
    expect(
      (fetchSpy.mock.calls[0][0] as string).startsWith(expectedEndpoint),
    ).toBe(true)
  })

  it('returns employees payload in contract shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => employeesApiResponse,
    } as Response)

    const result = await fetchEmployeesData({ page: 1, pageLimit: 10 })

    expect(result.data[0].employeeId).toBe('EMP00001')
    expect(result.meta.pageLimit).toBe(10)
    expect(result.filters.applied.status).toBe('')
  })

  it('throws a helpful error when request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    await expect(
      fetchEmployeesData({ page: 1, pageLimit: 10 }),
    ).rejects.toThrow('Failed to fetch employees data')
  })
})

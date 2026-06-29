import {
  createEmployee,
  fetchEmployeeDetails,
  fetchEmployeesData,
  isEmployeeIdAvailable,
  updateEmployee,
  type EmployeesQueryParams,
} from '../../../../features/employees/services/employeesApi'
import { employeeDetailsFixture } from '../../../data/employeeDetails'

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

  it('requests single employee details endpoint and returns the detail contract', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => employeeDetailsFixture,
    } as Response)

    const result = await fetchEmployeeDetails('EMP0001')

    const calledUrl = new URL(
      fetchSpy.mock.calls[0][0] as string,
      'http://local.test',
    )

    expect(calledUrl.pathname).toBe('/api/v1/employees/EMP0001')
    expect(
      (fetchSpy.mock.calls[0][0] as string).startsWith(expectedEndpoint),
    ).toBe(true)
    expect(result.summary.employeeId).toBe('EMP00001')
    expect(result.salaryHistory?.[0]?.changeSummary).toBe(
      'Annual compensation revision',
    )
  })

  it('throws a not found error when single employee request returns 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    await expect(fetchEmployeeDetails('EMP9999')).rejects.toThrow(
      'Employee not found',
    )
  })

  it('returns false when employee ID already exists in lookup results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => employeesApiResponse,
    } as Response)

    const result = await isEmployeeIdAvailable('EMP00001')

    expect(result).toBe(false)
  })

  it('creates employee and returns created employee ID', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ employeeId: 'EMP00120' }),
    } as Response)

    const result = await createEmployee({
      employee: {
        fullName: 'Ari Example',
        email: 'ari@example.com',
        phoneNumber: '+919999999999',
        dateOfBirth: '1993-01-10',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        department: 'ENGINEERING',
        designation: 'Engineer',
        joiningDate: '2023-01-11',
        reportingManagerEmployeeId: 'EMP00010',
        employmentType: 'PERMANENT',
      },
      salaryStructure: {
        basicSalary: 100000,
        pfApplicable: true,
        esiApplicable: false,
      },
    })

    expect(result.employeeId).toBe('EMP00120')
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: 'POST' })
  })

  it('throws duplicate employee ID error when create API returns conflict', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 409,
    } as Response)

    await expect(
      createEmployee({
        employee: {
          fullName: 'Ari Example',
          email: 'ari@example.com',
          phoneNumber: '+919999999999',
          dateOfBirth: '1993-01-10',
          gender: 'FEMALE',
          maritalStatus: 'SINGLE',
          department: 'ENGINEERING',
          designation: 'Engineer',
          joiningDate: '2023-01-11',
          employmentType: 'PERMANENT',
        },
        salaryStructure: {
          basicSalary: 100000,
          pfApplicable: false,
          esiApplicable: false,
        },
      }),
    ).rejects.toThrow('Employee ID must be unique')
  })

  it('updates employee with put request and returns the response payload', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'EMP0001',
        updatedAt: '2026-06-29T10:00:00.000Z',
      }),
    } as Response)

    const payload = {
      fullName: 'John Doe',
      email: 'john.doe@acme.com',
      phone: '+91 98765 43210',
      department: 'Engineering',
      designation: 'Senior Developer',
      employmentType: 'PERMANENT',
      status: 'ACTIVE',
      joiningDate: '2022-01-15',
      country: 'India',
      currency: 'INR',
      bankAccount: 'ACC-000123',
      salary: {
        baseMonthlySalary: 60000,
        effectiveFrom: '2024-04-01',
      },
    }

    const result = await updateEmployee('EMP0001', payload)

    expect(result).toEqual({
      id: 'EMP0001',
      updatedAt: '2026-06-29T10:00:00.000Z',
    })
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  })

  it('surfaces field errors when update employee returns a conflict', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Email already in use by another employee',
        errors: {
          email: 'Email already in use by another employee',
        },
      }),
    } as Response)

    await expect(
      updateEmployee('EMP0001', {
        fullName: 'John Doe',
        email: 'john.doe@acme.com',
        phone: '+91 98765 43210',
        department: 'Engineering',
        designation: 'Senior Developer',
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: '2022-01-15',
        country: 'India',
        currency: 'INR',
        bankAccount: 'ACC-000123',
        salary: {
          baseMonthlySalary: 60000,
          effectiveFrom: '2024-04-01',
        },
      }),
    ).rejects.toMatchObject({
      message: 'Email already in use by another employee',
      status: 409,
      fieldErrors: {
        email: 'Email already in use by another employee',
      },
    })
  })
})

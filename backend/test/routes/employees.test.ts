/**
 * Integration tests for GET /api/v1/employees endpoint.
 * Tests the API contract for the employees list endpoint.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { createEmployee, getEmployees } from '../../src/services/employeesService';
import { alice, bob, charlie, inactive } from '../data/employees';

jest.mock('../../src/services/employeesService', () => ({
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  createEmployee: jest.fn(),
}));

const mockedGetEmployees = getEmployees as jest.MockedFunction<typeof getEmployees>;
const mockedCreateEmployee = createEmployee as jest.MockedFunction<typeof createEmployee>;
const mockedEmployeesService = jest.requireMock('../../src/services/employeesService') as {
  getEmployeeById: jest.Mock;
};

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/employees', () => {
  describe('AC1: Default pagination', () => {
    it('returns 200 with default pagination (page=1, pageLimit=10) and contract-compliant payload', async () => {
      const mockResponse = {
        data: [alice, bob],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: {
            rate: 1,
            convertedAt: '2026-06-28T00:00:00.000Z',
          },
        },
        filters: {
          applied: {
            search: '',
            department: '',
            status: '',
          },
        },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app).get('/api/v1/employees');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body).toHaveProperty('filters');
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.pageLimit).toBe(10);
      expect(res.body.data).toHaveLength(2);
    });

    it('returns employees with all contract fields', async () => {
      const mockResponse = {
        data: [alice],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: '', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app).get('/api/v1/employees');
      const employee = res.body.data[0];

      expect(employee).toHaveProperty('employeeId');
      expect(employee).toHaveProperty('fullName');
      expect(employee).toHaveProperty('email');
      expect(employee).toHaveProperty('department');
      expect(employee).toHaveProperty('designation');
      expect(employee).toHaveProperty('basicSalary');
      expect(employee).toHaveProperty('currency');
      expect(employee).toHaveProperty('status');
      expect(employee).toHaveProperty('avatarUrl');
    });
  });

  describe('AC2: Filtering by search, department, and status', () => {
    it('returns filtered data and echoes applied filters', async () => {
      const mockResponse = {
        data: [charlie],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: {
          applied: {
            search: 'Charlie',
            department: 'MARKETING',
            status: 'ACTIVE',
          },
        },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/v1/employees')
        .query({
          search: 'Charlie',
          department: 'MARKETING',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].employeeId).toBe('EMP003');
      expect(res.body.filters.applied.search).toBe('Charlie');
      expect(res.body.filters.applied.department).toBe('MARKETING');
      expect(res.body.filters.applied.status).toBe('ACTIVE');
    });

    it('searches by name', async () => {
      const mockResponse = {
        data: [alice],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: 'Alice', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      await request(app).get('/api/v1/employees').query({ search: 'Alice' });

      expect(mockedGetEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Alice',
        })
      );
    });

    it('filters by department', async () => {
      const mockResponse = {
        data: [alice, bob],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: '', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      await request(app)
        .get('/api/v1/employees')
        .query({ department: 'ENGINEERING' });

      expect(mockedGetEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          department: 'ENGINEERING',
        })
      );
    });

    it('filters by status', async () => {
      const mockResponse = {
        data: [inactive],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: '', department: '', status: 'INACTIVE' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      await request(app).get('/api/v1/employees').query({ status: 'INACTIVE' });

      expect(mockedGetEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'INACTIVE',
        })
      );
    });
  });

  describe('AC3: Salary conversion with targetCurrencyCode', () => {
    it('converts salary to requested currency and includes conversion metadata', async () => {
      const mockResponse = {
        data: [
          {
            ...alice,
            basicSalary: 722, // 60000 / 83.2 (USD conversion)
          },
        ],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'USD',
          targetCurrency: 'USD',
          conversion: {
            rate: 83.2,
            convertedAt: '2026-06-28T10:30:00.000Z',
          },
        },
        filters: { applied: { search: '', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/v1/employees')
        .query({ targetCurrencyCode: 'USD' });

      expect(res.status).toBe(200);
      expect(res.body.meta.currency).toBe('USD');
      expect(res.body.meta.targetCurrency).toBe('USD');
      expect(res.body.meta.conversion.rate).toBe(83.2);
      expect(res.body.meta.conversion).toHaveProperty('convertedAt');
    });

    it('defaults to INR with rate 1 if targetCurrencyCode is not provided', async () => {
      const mockResponse = {
        data: [alice],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: '', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app).get('/api/v1/employees');

      expect(res.body.meta.conversion.rate).toBe(1);
      expect(res.body.meta.targetCurrency).toBe('INR');
    });
  });

  describe('AC4: Query parameter validation', () => {
    it('returns 400 for invalid page (less than 1)', async () => {
      const res = await request(app).get('/api/v1/employees').query({ page: '0' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('page');
    });

    it('returns 400 for invalid page (negative)', async () => {
      const res = await request(app).get('/api/v1/employees').query({ page: '-1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('page');
    });

    it('returns 400 for invalid pageLimit (exceeds max)', async () => {
      const res = await request(app).get('/api/v1/employees').query({ pageLimit: '101' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pageLimit');
    });

    it('returns 400 for invalid pageLimit (less than 1)', async () => {
      const res = await request(app).get('/api/v1/employees').query({ pageLimit: '0' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pageLimit');
    });

    it('returns 400 for invalid status enum value', async () => {
      const res = await request(app).get('/api/v1/employees').query({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('status');
    });

    it('returns 400 for invalid department enum value', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .query({ department: 'INVALID_DEPT' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('department');
    });

    it('returns 400 for unsupported targetCurrencyCode', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .query({ targetCurrencyCode: 'INVALID_CURRENCY' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('targetCurrencyCode');
    });
  });

  describe('AC5: Empty result sets', () => {
    it('returns 200 with empty data and consistent meta when no records match filters', async () => {
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          pageLimit: 10,
          totalRecords: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: 'nonexistent', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/v1/employees')
        .query({ search: 'nonexistent' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.totalRecords).toBe(0);
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('currency');
      expect(res.body.meta).toHaveProperty('conversion');
    });
  });

  describe('AC6: Observability', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('logs errors when service throws', async () => {
      mockedGetEmployees.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/employees');

      expect(res.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch employees'),
        expect.any(Error)
      );
    });

    it('returns 500 error response for service failures', async () => {
      mockedGetEmployees.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/employees');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Pagination', () => {
    it('respects custom page and pageLimit', async () => {
      const mockResponse = {
        data: [bob],
        meta: {
          page: 2,
          pageLimit: 1,
          totalRecords: 2,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
          currency: 'INR',
          targetCurrency: 'INR',
          conversion: { rate: 1, convertedAt: '2026-06-28T00:00:00.000Z' },
        },
        filters: { applied: { search: '', department: '', status: '' } },
      };
      mockedGetEmployees.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/v1/employees')
        .query({ page: '2', pageLimit: '1' });

      expect(mockedGetEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          pageLimit: 1,
        })
      );
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.pageLimit).toBe(1);
      expect(res.body.meta.hasPreviousPage).toBe(true);
    });
  });
});

describe('POST /api/v1/employees', () => {
  const validPayload = {
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
      currency: 'INR',
      effectiveDate: '2023-01-11',
      pfApplicable: false,
      esiApplicable: false,
    },
  };

  it('returns 201 and the full created employee object for a valid payload', async () => {
    mockedCreateEmployee.mockResolvedValue({
      employeeId: 'EMP00120',
      fullName: 'Ari Example',
      email: 'ari@example.com',
      department: 'ENGINEERING',
      designation: 'Engineer',
      basicSalary: 100000,
      currency: 'INR',
      status: 'ACTIVE',
      joiningDate: '2023-01-11',
      country: 'India',
      employmentType: 'PERMANENT',
    });

    const res = await request(app).post('/api/v1/employees').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.employeeId).toBe('EMP00120');
    expect(res.body.fullName).toBe('Ari Example');
    expect(res.body.department).toBe('ENGINEERING');
    expect(res.body).toHaveProperty('joiningDate');
    expect(mockedCreateEmployee).toHaveBeenCalledWith(
      expect.objectContaining({
        employee: expect.objectContaining({
          designation: 'Engineer',
        }),
        salaryStructure: expect.objectContaining({
          basicSalary: 100000,
        }),
      }),
    );
  });

  it('returns 400 with field-level details when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .send({ employee: {}, salaryStructure: {} });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details['employee.fullName']).toBeDefined();
    expect(res.body.details['salaryStructure.basicSalary']).toBeDefined();
  });

  it('returns 400 with field-level details for invalid formats', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .send({
        ...validPayload,
        employee: {
          ...validPayload.employee,
          email: 'invalid-email',
          phoneNumber: 'abcd1234',
        },
        salaryStructure: {
          ...validPayload.salaryStructure,
          basicSalary: -100,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details['employee.email']).toBeDefined();
    expect(res.body.details['employee.phoneNumber']).toBeDefined();
    expect(res.body.details['salaryStructure.basicSalary']).toBeDefined();
  });

  it('returns 400 when employee.employeeId is provided in payload', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .send({
        ...validPayload,
        employee: {
          ...validPayload.employee,
          employeeId: 'EMP12345',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details['employee.employeeId']).toBe(
      'employee.employeeId must not be provided; it is generated automatically',
    );
  });

  it('accepts payload when optional salary and bank fields are omitted', async () => {
    mockedCreateEmployee.mockResolvedValue({
      employeeId: 'EMP00120',
      fullName: 'Ari Example',
      email: 'ari@example.com',
      department: 'ENGINEERING',
      designation: 'Engineer',
      basicSalary: 100000,
      currency: 'INR',
      status: 'ACTIVE',
      joiningDate: '2023-01-11',
      country: 'India',
      employmentType: 'PERMANENT',
    });

    const payloadWithoutOptionalFields = {
      employee: validPayload.employee,
      salaryStructure: {
        basicSalary: 100000,
      },
    };

    const res = await request(app).post('/api/v1/employees').send(payloadWithoutOptionalFields);

    expect(res.status).toBe(201);
    expect(mockedCreateEmployee).toHaveBeenCalledWith(
      expect.objectContaining({
        salaryStructure: expect.objectContaining({
          basicSalary: 100000,
        }),
      }),
    );
  });

  it('accepts payload without bankAccounts', async () => {
    mockedCreateEmployee.mockResolvedValue({
      employeeId: 'EMP00120',
      fullName: 'Ari Example',
      email: 'ari@example.com',
      department: 'ENGINEERING',
      designation: 'Engineer',
      basicSalary: 100000,
      currency: 'INR',
      status: 'ACTIVE',
      joiningDate: '2023-01-11',
      country: 'India',
      employmentType: 'PERMANENT',
    });

    const res = await request(app).post('/api/v1/employees').send(validPayload);

    expect(res.status).toBe(201);
    expect(mockedCreateEmployee).toHaveBeenCalledWith(
      expect.not.objectContaining({
        bankAccounts: expect.anything(),
      }),
    );
  });

  it('returns 409 when duplicate employee ID is submitted', async () => {
    mockedCreateEmployee.mockRejectedValue(new Error('EMPLOYEE_ID_ALREADY_EXISTS'));

    const res = await request(app).post('/api/v1/employees').send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Employee ID already exists');
    expect(res.body.code).toBe('DUPLICATE_EMPLOYEE_ID');
    expect(res.body).toHaveProperty('details');
  });

  it('returns 500 with non-sensitive error contract on unexpected failures', async () => {
    mockedCreateEmployee.mockRejectedValue(new Error('Database unavailable'));

    const res = await request(app).post('/api/v1/employees').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create employee' });
  });
});

describe('GET /api/v1/employees/:id', () => {
  const employeeDetailsResponse = {
    summary: {
      fullName: 'John Doe',
      status: 'ACTIVE',
      employeeId: 'EMP0001',
      email: 'john.doe@acme.com',
      phone: '+91 98765 43210',
      joinedOn: '15 Jan 2022',
      department: 'Engineering',
      designation: 'Senior Developer',
      employmentType: 'Full Time',
      country: 'India',
      currency: 'INR',
      bankAccount: 'ACC-000123',
    },
    overview: {
      personalInformation: {
        fullName: 'John Doe',
        employeeId: 'EMP0001',
        email: 'john.doe@acme.com',
        phone: '+91 98765 43210',
        joiningDate: '15 Jan 2022',
        country: 'India',
        employmentType: 'Full Time',
        status: 'ACTIVE',
        avatarUrl: null,
      },
      jobInformation: {
        department: 'Engineering',
        designation: 'Senior Developer',
        reportingManager: 'Jane Smith',
        workLocation: 'Bangalore, India',
      },
    },
    salaryStructure: {
      currency: 'INR',
      earnings: [
        { component: 'Basic Salary', amount: 60000 },
        { component: 'DA (Dearness Allowance)', amount: 12000 },
      ],
      deductions: [{ component: 'Professional Tax', amount: 200 }],
      totalEarnings: 72000,
      totalDeductions: 200,
      netPayMonthly: 71800,
      ctcAnnual: 864000,
      baseSalaryMonthly: 60000,
      effectiveFrom: '01 Apr 2024',
    },
  };

  it('returns 200 with one employee object for a valid employee id', async () => {
    mockedEmployeesService.getEmployeeById.mockResolvedValue(employeeDetailsResponse);

    const res = await request(app).get('/api/v1/employees/EMP0001');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(false);
    expect(res.body).toMatchObject({
      summary: expect.objectContaining({
        employeeId: 'EMP0001',
        fullName: 'John Doe',
        email: 'john.doe@acme.com',
      }),
      overview: {
        personalInformation: expect.objectContaining({
          employeeId: 'EMP0001',
          joiningDate: '15 Jan 2022',
        }),
        jobInformation: expect.objectContaining({
          designation: 'Senior Developer',
        }),
      },
      salaryStructure: expect.objectContaining({
        currency: 'INR',
        baseSalaryMonthly: 60000,
      }),
    });
  });

  it('returns 404 with clear message when employee is not found', async () => {
    mockedEmployeesService.getEmployeeById.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/employees/EMP99999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Employee not found' });
  });

  it('returns a contract-safe shape when optional details are missing', async () => {
    const employeeWithoutOptionals = {
      ...employeeDetailsResponse,
      summary: {
        ...employeeDetailsResponse.summary,
        phone: null,
        bankAccount: null,
      },
      overview: {
        ...employeeDetailsResponse.overview,
        personalInformation: {
          ...employeeDetailsResponse.overview.personalInformation,
          avatarUrl: null,
        },
      },
    };

    mockedEmployeesService.getEmployeeById.mockResolvedValue(employeeWithoutOptionals);

    const res = await request(app).get('/api/v1/employees/EMP0001');

    expect(res.status).toBe(200);
    expect(res.body.summary.employeeId).toBe('EMP0001');
    expect(res.body.summary.phone).toBeNull();
    expect(res.body.summary.bankAccount).toBeNull();
    expect(res.body.overview.personalInformation.avatarUrl).toBeNull();
  });

  it('returns 400 when id format is not EMP followed by digits', async () => {
    const res = await request(app).get('/api/v1/employees/123');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid employee id format');
    expect(mockedEmployeesService.getEmployeeById).not.toHaveBeenCalled();
  });
});

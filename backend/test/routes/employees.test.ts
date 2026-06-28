/**
 * Integration tests for GET /api/v1/employees endpoint.
 * Tests the API contract for the employees list endpoint.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { getEmployees } from '../../src/services/employeesService';
import { alice, bob, charlie, inactive } from '../data/employees';

jest.mock('../../src/services/employeesService', () => ({
  getEmployees: jest.fn(),
}));

const mockedGetEmployees = getEmployees as jest.MockedFunction<typeof getEmployees>;

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

      const res = await request(app).get('/api/v1/employees').query({ search: 'Alice' });

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

      const res = await request(app)
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

      const res = await request(app).get('/api/v1/employees').query({ status: 'INACTIVE' });

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
    it('logs errors when service throws', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedGetEmployees.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/employees');

      expect(res.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch employees'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
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

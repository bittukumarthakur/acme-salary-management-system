/**
 * Integration tests for GET /api/v1/employees/:id/salary-history endpoint.
 * Tests the API contract for the salary history dedicated endpoint.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import type { SalaryHistoryEntry } from '../../src/models/employee/details';

jest.mock('../../src/services/salaryHistoryService', () => ({
  getSalaryHistory: jest.fn(),
}));

const mockedSalaryHistoryService = jest.requireMock(
  '../../src/services/salaryHistoryService',
) as {
  getSalaryHistory: jest.Mock;
};

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/employees/:id/salary-history', () => {
  describe('AC1: Multiple salary revisions ordered descending', () => {
    it('returns 200 with salaryHistory array ordered newest-first', async () => {
      const salaryHistory = [
        {
          id: 'rev_3',
          effectiveFrom: '2024-01-01',
          baseSalaryMonthly: 2252910,
          netPayMonthly: 247821,
          ctcAnnual: 6218040,
          isCurrent: true,
        },
        {
          id: 'rev_2',
          effectiveFrom: '2023-01-01',
          baseSalaryMonthly: 2000000,
          netPayMonthly: 220000,
          ctcAnnual: 5500000,
          isCurrent: false,
        },
        {
          id: 'rev_1',
          effectiveFrom: '2022-06-15',
          baseSalaryMonthly: 1800000,
          netPayMonthly: 190000,
          ctcAnnual: 4500000,
          isCurrent: false,
        },
      ];

      mockedSalaryHistoryService.getSalaryHistory.mockResolvedValue(salaryHistory);

      const res = await request(app).get('/api/v1/employees/EMP0001/salary-history');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);
      expect(res.body[0].effectiveFrom).toBe('2024-01-01');
      expect(res.body[1].effectiveFrom).toBe('2023-01-01');
      expect(res.body[2].effectiveFrom).toBe('2022-06-15');
    });
  });

  describe('AC2: Single current salary entry', () => {
    it('returns 200 with single current salary when no prior revisions exist', async () => {
      const salaryHistory = [
        {
          id: 'rev_current',
          effectiveFrom: '2022-06-15',
          baseSalaryMonthly: 2252910,
          netPayMonthly: 247821,
          ctcAnnual: 6218040,
          isCurrent: true,
        },
      ];

      mockedSalaryHistoryService.getSalaryHistory.mockResolvedValue(salaryHistory);

      const res = await request(app).get('/api/v1/employees/EMP0001/salary-history');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].isCurrent).toBe(true);
    });
  });

  describe('AC3: Correct entry schema', () => {
    it('each entry contains id, effectiveFrom, baseSalaryMonthly, netPayMonthly, ctcAnnual, isCurrent', async () => {
      const salaryHistory = [
        {
          id: 'rev_1',
          effectiveFrom: '2024-01-01',
          baseSalaryMonthly: 2252910,
          netPayMonthly: 247821,
          ctcAnnual: 6218040,
          isCurrent: true,
        },
      ];

      mockedSalaryHistoryService.getSalaryHistory.mockResolvedValue(salaryHistory);

      const res = await request(app).get('/api/v1/employees/EMP0001/salary-history');

      expect(res.status).toBe(200);
      const entry = res.body[0];
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('effectiveFrom');
      expect(entry).toHaveProperty('baseSalaryMonthly');
      expect(entry).toHaveProperty('netPayMonthly');
      expect(entry).toHaveProperty('ctcAnnual');
      expect(entry).toHaveProperty('isCurrent');
      expect(typeof entry.id).toBe('string');
      expect(typeof entry.effectiveFrom).toBe('string');
      expect(typeof entry.baseSalaryMonthly).toBe('number');
      expect(typeof entry.netPayMonthly).toBe('number');
      expect(typeof entry.ctcAnnual).toBe('number');
      expect(typeof entry.isCurrent).toBe('boolean');
    });
  });

  describe('AC4: Only latest marked as current', () => {
    it('only most recent entry has isCurrent=true', async () => {
      const salaryHistory = [
        {
          id: 'rev_3',
          effectiveFrom: '2024-01-01',
          baseSalaryMonthly: 2252910,
          netPayMonthly: 247821,
          ctcAnnual: 6218040,
          isCurrent: true,
        },
        {
          id: 'rev_2',
          effectiveFrom: '2023-01-01',
          baseSalaryMonthly: 2000000,
          netPayMonthly: 220000,
          ctcAnnual: 5500000,
          isCurrent: false,
        },
      ];

      mockedSalaryHistoryService.getSalaryHistory.mockResolvedValue(salaryHistory);

      const res = await request(app).get('/api/v1/employees/EMP0001/salary-history');

      expect(res.status).toBe(200);
      const currentCount = (res.body as SalaryHistoryEntry[]).filter((e) => e.isCurrent === true).length;
      expect(currentCount).toBe(1);
      expect(res.body[0].isCurrent).toBe(true);
    });
  });

  describe('AC5: Error handling', () => {
    it('returns 404 when employee is not found', async () => {
      mockedSalaryHistoryService.getSalaryHistory.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/employees/EMP99999/salary-history');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Employee not found' });
    });

    it('returns 400 for invalid employee ID format', async () => {
      const res = await request(app).get('/api/v1/employees/123/salary-history');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid employee id format');
      expect(mockedSalaryHistoryService.getSalaryHistory).not.toHaveBeenCalled();
    });

    it('returns 500 with proper error shape on service failure', async () => {
      mockedSalaryHistoryService.getSalaryHistory.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const res = await request(app).get('/api/v1/employees/EMP0001/salary-history');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch salary history' });
    });
  });
});

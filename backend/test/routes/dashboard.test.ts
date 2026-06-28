import request from 'supertest';
import { createApp } from '../../src/app';
import { getDashboard } from '../../src/services/dashboardService';
import type { DashboardResponse, SummaryCardLabelKey, PayrollStatus, CountryCode, CurrencyCode } from '../../src/models/dashboard';

jest.mock('../../src/services/dashboardService', () => ({
  getDashboard: jest.fn(),
  SUPPORTED_COUNTRIES: new Set(['AU', 'BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'JP', 'SG', 'US']),
  DEFAULT_COUNTRY: 'IN',
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}));

const mockedGetDashboard = getDashboard as jest.MockedFunction<typeof getDashboard>;

const app = createApp();

const defaultDashboard: DashboardResponse = {
  summaryCards: [
    { labelKey: 'TOTAL_EMPLOYEES' as SummaryCardLabelKey, value: 42 },
    { labelKey: 'PAYROLL_PROCESSED' as SummaryCardLabelKey, value: 2480000 },
    { labelKey: 'TOTAL_DEDUCTIONS' as SummaryCardLabelKey, value: 345000 },
    { labelKey: 'NET_SALARY_PAID' as SummaryCardLabelKey, value: 2135000 },
  ],
  recentPayrolls: [
    {
      id: 'PAY-2024-06',
      payrollPeriod: 'June 2024',
      payoutDate: '2024-06-30',
      status: 'COMPLETED' as PayrollStatus,
      totalAmount: 28000000,
      totalDeductions: 3000000,
      netAmount: 25000000,
    },
  ],
  meta: {
    generatedAt: '2026-06-27T10:00:00.000Z',
    appliedCountry: 'IN' as CountryCode,
    recentPayrollsLimit: 10,
    currency: 'INR' as CurrencyCode,
    conversion: { rate: 1, convertedAt: '2026-06-27T10:00:00.000Z' },
    totalPayrollRecords: 12,
    employeeTrend: {
      currentMonthCount: 42,
      previousMonthCount: 39,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/dashboard', () => {
  it('returns 200 with all required sections when no query params are provided', async () => {
    mockedGetDashboard.mockResolvedValue(defaultDashboard);

    const res = await request(app).get('/api/v1/dashboard');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summaryCards');
    expect(res.body).toHaveProperty('recentPayrolls');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('appliedCountry');
    expect(res.body.meta).toHaveProperty('currency');
    expect(res.body.meta).toHaveProperty('conversion');
    expect(res.body.meta).toHaveProperty('employeeTrend');
  });

  it('calls service with default countryCode=IN and limit=10 when params are absent', async () => {
    mockedGetDashboard.mockResolvedValue(defaultDashboard);

    await request(app).get('/api/v1/dashboard');

    expect(mockedGetDashboard).toHaveBeenCalledWith({ countryCode: 'IN', limit: 10 });
  });

  it('passes valid countryCode to service and returns 200', async () => {
    const usDashboard: DashboardResponse = { ...defaultDashboard, meta: { ...defaultDashboard.meta, appliedCountry: 'US' as CountryCode, currency: 'USD' as CurrencyCode } };
    mockedGetDashboard.mockResolvedValue(usDashboard);

    const res = await request(app).get('/api/v1/dashboard').query({ countryCode: 'US' });

    expect(res.status).toBe(200);
    expect(res.body.meta.appliedCountry).toBe('US');
    expect(mockedGetDashboard).toHaveBeenCalledWith(expect.objectContaining({ countryCode: 'US' }));
  });

  it('passes valid limit to service and returns 200', async () => {
    mockedGetDashboard.mockResolvedValue(defaultDashboard);

    const res = await request(app).get('/api/v1/dashboard').query({ limit: '5' });

    expect(res.status).toBe(200);
    expect(mockedGetDashboard).toHaveBeenCalledWith(expect.objectContaining({ limit: 5 }));
  });

  it('returns numeric amount fields in recentPayrolls (not formatted strings)', async () => {
    mockedGetDashboard.mockResolvedValue(defaultDashboard);

    const res = await request(app).get('/api/v1/dashboard');

    expect(typeof res.body.recentPayrolls[0].totalAmount).toBe('number');
    expect(typeof res.body.recentPayrolls[0].totalDeductions).toBe('number');
    expect(typeof res.body.recentPayrolls[0].netAmount).toBe('number');
  });

  it('returns conversion metadata with rate and convertedAt in meta', async () => {
    mockedGetDashboard.mockResolvedValue(defaultDashboard);

    const res = await request(app).get('/api/v1/dashboard');

    expect(res.body.meta.conversion).toHaveProperty('rate');
    expect(res.body.meta.conversion).toHaveProperty('convertedAt');
  });

  it('returns 400 for an unknown countryCode without calling the service', async () => {
    const res = await request(app).get('/api/v1/dashboard').query({ countryCode: 'XX' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedGetDashboard).not.toHaveBeenCalled();
  });

  it('returns 400 for a limit of 0 without calling the service', async () => {
    const res = await request(app).get('/api/v1/dashboard').query({ limit: '0' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedGetDashboard).not.toHaveBeenCalled();
  });

  it('returns 400 for a negative limit without calling the service', async () => {
    const res = await request(app).get('/api/v1/dashboard').query({ limit: '-1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedGetDashboard).not.toHaveBeenCalled();
  });

  it('returns 400 for a limit exceeding 100 without calling the service', async () => {
    const res = await request(app).get('/api/v1/dashboard').query({ limit: '101' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedGetDashboard).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-numeric limit without calling the service', async () => {
    const res = await request(app).get('/api/v1/dashboard').query({ limit: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedGetDashboard).not.toHaveBeenCalled();
  });

  it('returns status enum value COMPLETED for completed payrolls', async () => {
    mockedGetDashboard.mockResolvedValue(defaultDashboard);

    const res = await request(app).get('/api/v1/dashboard');

    expect(res.body.recentPayrolls[0].status).toBe('COMPLETED');
  });

  it('returns 500 when the service throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetDashboard.mockRejectedValue(new Error('db down'));

    const res = await request(app).get('/api/v1/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
    errorSpy.mockRestore();
  });
});

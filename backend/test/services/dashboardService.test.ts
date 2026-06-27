import { getDashboard } from '../../src/services/dashboardService';
import { prisma } from '../../lib/prisma';
import { payrollRows } from '../data/payrollRows';
import { SummaryCardLabelKey, PayrollStatus } from '../../src/models/dashboard';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    payroll: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  },
}));

const mockedPayrollCount = prisma.payroll.count as jest.MockedFunction<typeof prisma.payroll.count>;
const mockedFindFirst = prisma.payroll.findFirst as jest.MockedFunction<
  typeof prisma.payroll.findFirst
>;
const mockedFindMany = prisma.payroll.findMany as jest.MockedFunction<
  typeof prisma.payroll.findMany
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getDashboard', () => {
  describe('default country (IN)', () => {
    it('returns summaryCards with 3 cards for payroll metrics', async () => {
      mockedPayrollCount.mockResolvedValue(120);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue(payrollRows as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 10 });

      expect(result.summaryCards).toHaveLength(3);
      expect(result.summaryCards.map((c) => c.labelKey)).toContain(SummaryCardLabelKey.PAYROLL_PROCESSED);
      expect(result.summaryCards.map((c) => c.labelKey)).toContain(SummaryCardLabelKey.TOTAL_DEDUCTIONS);
      expect(result.summaryCards.map((c) => c.labelKey)).toContain(SummaryCardLabelKey.NET_SALARY_PAID);
    });

    it('returns summaryCards with payroll amounts from latest payroll row', async () => {
      mockedPayrollCount.mockResolvedValue(100);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue(payrollRows as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 10 });

      expect(result.summaryCards[0]).toMatchObject({
        labelKey: SummaryCardLabelKey.PAYROLL_PROCESSED,
        value: payrollRows[0]!.totalAmount,
      });
      expect(result.summaryCards[1]).toMatchObject({
        labelKey: SummaryCardLabelKey.TOTAL_DEDUCTIONS,
        value: payrollRows[0]!.totalDeductions,
      });
      expect(result.summaryCards[2]).toMatchObject({
        labelKey: SummaryCardLabelKey.NET_SALARY_PAID,
        value: payrollRows[0]!.netAmount,
      });
    });

    it('includes appliedCountry=IN and currency=INR with rate=1 in meta', async () => {
      mockedPayrollCount.mockResolvedValue(100);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue(payrollRows as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 10 });

      expect(result.meta.appliedCountry).toBe('IN');
      expect(result.meta.currency).toBe('INR');
      expect(result.meta.conversion.rate).toBe(1);
      expect(result.meta.conversion.convertedAt).toBeDefined();
      expect(result.meta.recentPayrollsLimit).toBe(10);
      expect(result.meta.generatedAt).toBeDefined();
    });

    it('returns recentPayrolls limited to the requested count', async () => {
      mockedPayrollCount.mockResolvedValue(100);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue([payrollRows[0]] as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 1 });

      expect(result.recentPayrolls).toHaveLength(1);
      expect(mockedFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });

    it('returns numeric amounts in recentPayrolls records', async () => {
      mockedPayrollCount.mockResolvedValue(100);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue([payrollRows[0]] as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 10 });

      expect(typeof result.recentPayrolls[0]!.totalAmount).toBe('number');
      expect(typeof result.recentPayrolls[0]!.totalDeductions).toBe('number');
      expect(typeof result.recentPayrolls[0]!.netAmount).toBe('number');
      expect(result.recentPayrolls[0]!.status).toBe(PayrollStatus.COMPLETED);
    });

    it('returns ISO date string for payoutDate in recentPayrolls', async () => {
      mockedPayrollCount.mockResolvedValue(100);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue([payrollRows[0]] as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 10 });

      expect(result.recentPayrolls[0]!.payoutDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('currency conversion (US)', () => {
    it('converts monetary values to USD when countryCode=US', async () => {
      mockedPayrollCount.mockResolvedValue(100);
      mockedFindFirst.mockResolvedValue(payrollRows[0] as never);
      mockedFindMany.mockResolvedValue([payrollRows[0]] as never);

      const result = await getDashboard({ countryCode: 'US', limit: 10 });

      expect(result.meta.appliedCountry).toBe('US');
      expect(result.meta.currency).toBe('USD');
      expect(result.meta.conversion.rate).toBeGreaterThan(0);
      expect(result.meta.conversion.rate).toBeLessThan(1); // USD rate is < 1 relative to INR
      // converted amount should differ from raw INR amount
      expect(result.summaryCards[0]!.value).not.toBe(payrollRows[0]!.totalAmount);
    });
  });

  describe('empty state', () => {
    it('returns safe defaults when no payroll data exists', async () => {
      mockedPayrollCount.mockResolvedValue(0);
      mockedFindFirst.mockResolvedValue(null);
      mockedFindMany.mockResolvedValue([] as never);

      const result = await getDashboard({ countryCode: 'IN', limit: 10 });

      expect(result.summaryCards).toHaveLength(3);
      expect(result.summaryCards.every((c) => c.value === 0)).toBe(true);
      expect(result.recentPayrolls).toHaveLength(0);
      expect(result.meta.totalPayrollRecords).toBe(0);
      expect(result.meta.generatedAt).toBeDefined();
    });
  });
});

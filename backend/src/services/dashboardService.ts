import { prisma } from '../../lib/prisma';
import type { DashboardQuery, DashboardResponse } from '../models/dashboard';
import { SummaryCardLabelKey, PayrollStatus, CountryCode, CurrencyCode } from '../models/dashboard';

export const DEFAULT_COUNTRY = 'IN';
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

const CURRENCY_MAP: Record<string, { currency: CurrencyCode; rate: number }> = {
  IN: { currency: CurrencyCode.INR, rate: 1 },
  US: { currency: CurrencyCode.USD, rate: 0.012 },
  GB: { currency: CurrencyCode.GBP, rate: 0.0097 },
  DE: { currency: CurrencyCode.EUR, rate: 0.011 },
  FR: { currency: CurrencyCode.EUR, rate: 0.011 },
  CA: { currency: CurrencyCode.CAD, rate: 0.016 },
  AU: { currency: CurrencyCode.AUD, rate: 0.018 },
  SG: { currency: CurrencyCode.SGD, rate: 0.016 },
  JP: { currency: CurrencyCode.JPY, rate: 1.78 },
  BR: { currency: CurrencyCode.BRL, rate: 0.066 },
};

export const SUPPORTED_COUNTRIES = new Set(Object.keys(CURRENCY_MAP));

export async function getDashboard(query: DashboardQuery): Promise<DashboardResponse> {
  const { countryCode, limit } = query;
  const { currency, rate } = CURRENCY_MAP[countryCode]!;
  const convertedAt = new Date().toISOString();
  const generatedAt = new Date().toISOString();

  const convert = (amount: number): number => Math.round(amount * rate * 100) / 100;

  const [latestPayroll, recentPayrolls, totalRecords] = await Promise.all([
    prisma.payroll.findFirst({ orderBy: { payoutDate: 'desc' } }),
    prisma.payroll.findMany({
      orderBy: [{ payoutDate: 'desc' }, { id: 'desc' }],
      take: limit,
    }),
    prisma.payroll.count(),
  ]);

  const summaryCards = [
    {
      labelKey: SummaryCardLabelKey.PAYROLL_PROCESSED,
      value: latestPayroll ? convert(latestPayroll.totalAmount) : 0,
    },
    {
      labelKey: SummaryCardLabelKey.TOTAL_DEDUCTIONS,
      value: latestPayroll ? convert(latestPayroll.totalDeductions) : 0,
    },
    {
      labelKey: SummaryCardLabelKey.NET_SALARY_PAID,
      value: latestPayroll ? convert(latestPayroll.netAmount) : 0,
    },
  ];

  const recentPayrollRecords = recentPayrolls.map((p) => ({
    id: p.payrollId,
    payrollPeriod: p.payrollPeriod,
    payoutDate: p.payoutDate.toISOString().split('T')[0] as string,
    status: PayrollStatus.COMPLETED,
    totalAmount: convert(p.totalAmount),
    totalDeductions: convert(p.totalDeductions),
    netAmount: convert(p.netAmount),
  }));

  return {
    summaryCards,
    recentPayrolls: recentPayrollRecords,
    meta: {
      generatedAt,
      appliedCountry: countryCode as CountryCode,
      recentPayrollsLimit: limit,
      currency,
      conversion: { rate, convertedAt },
      totalPayrollRecords: totalRecords,
    },
  };
}

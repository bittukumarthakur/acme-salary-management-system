import { prisma } from '../../lib/prisma';
import type { DashboardQuery, DashboardResponse } from '../models/dashboard';
import { SummaryCardLabelKey, PayrollStatus, CountryCode, CurrencyCode } from '../models/dashboard';

export const DEFAULT_COUNTRY = 'IN';
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

const CURRENCY_MAP: Record<string, { currency: CurrencyCode; rate: number }> = {
  IN: { currency: CurrencyCode.Inr, rate: 1 },
  US: { currency: CurrencyCode.Usd, rate: 0.012 },
  GB: { currency: CurrencyCode.Gbp, rate: 0.0097 },
  DE: { currency: CurrencyCode.Eur, rate: 0.011 },
  FR: { currency: CurrencyCode.Eur, rate: 0.011 },
  CA: { currency: CurrencyCode.Cad, rate: 0.016 },
  AU: { currency: CurrencyCode.Aud, rate: 0.018 },
  SG: { currency: CurrencyCode.Sgd, rate: 0.016 },
  JP: { currency: CurrencyCode.Jpy, rate: 1.78 },
  BR: { currency: CurrencyCode.Brl, rate: 0.066 },
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

  const monthlyReferenceDate = latestPayroll?.payoutDate ?? new Date();
  const currentMonthStartDate = new Date(
    monthlyReferenceDate.getFullYear(),
    monthlyReferenceDate.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const monthEndDate = new Date(
    monthlyReferenceDate.getFullYear(),
    monthlyReferenceDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  const previousMonthStartDate = new Date(
    monthlyReferenceDate.getFullYear(),
    monthlyReferenceDate.getMonth() - 1,
    1,
    0,
    0,
    0,
    0,
  );
  const previousMonthEndDate = new Date(
    monthlyReferenceDate.getFullYear(),
    monthlyReferenceDate.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  const [totalEmployeesCount, currentMonthCount, previousMonthCount] = await Promise.all([
    prisma.employee.count({
      where: {
        joiningDate: { lte: monthEndDate },
      },
    }),
    prisma.employee.count({
      where: {
        joiningDate: {
          gte: currentMonthStartDate,
          lte: monthEndDate,
        },
      },
    }),
    prisma.employee.count({
      where: {
        joiningDate: {
          gte: previousMonthStartDate,
          lte: previousMonthEndDate,
        },
      },
    }),
  ]);

  const summaryCards = [
    {
      labelKey: SummaryCardLabelKey.TotalEmployees,
      value: totalEmployeesCount,
    },
    {
      labelKey: SummaryCardLabelKey.PayrollProcessed,
      value: latestPayroll ? convert(latestPayroll.totalAmount) : 0,
    },
    {
      labelKey: SummaryCardLabelKey.TotalDeductions,
      value: latestPayroll ? convert(latestPayroll.totalDeductions) : 0,
    },
    {
      labelKey: SummaryCardLabelKey.NetSalaryPaid,
      value: latestPayroll ? convert(latestPayroll.netAmount) : 0,
    },
  ];

  const recentPayrollRecords = recentPayrolls.map((p) => ({
    id: p.payrollId,
    payrollPeriod: p.payrollPeriod,
    payoutDate: p.payoutDate.toISOString().split('T')[0] as string,
    status: PayrollStatus.Completed,
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
      employeeTrend: {
        currentMonthCount,
        previousMonthCount,
      },
    },
  };
}

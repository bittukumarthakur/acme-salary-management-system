/**
 * Dashboard domain model.
 *
 * Defines the stable API contract for the dashboard endpoint, decoupled from
 * ORM types and the frontend view model.
 */

export enum CountryCode {
  IN = 'IN',
  US = 'US',
  GB = 'GB',
  DE = 'DE',
  FR = 'FR',
  CA = 'CA',
  AU = 'AU',
  SG = 'SG',
  JP = 'JP',
  BR = 'BR',
}

export enum CurrencyCode {
  INR = 'INR',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
  CAD = 'CAD',
  AUD = 'AUD',
  SGD = 'SGD',
  JPY = 'JPY',
  BRL = 'BRL',
}

export enum SummaryCardLabelKey {
  TOTAL_EMPLOYEES = 'TOTAL_EMPLOYEES',
  PAYROLL_PROCESSED = 'PAYROLL_PROCESSED',
  TOTAL_DEDUCTIONS = 'TOTAL_DEDUCTIONS',
  NET_SALARY_PAID = 'NET_SALARY_PAID',
}

export enum PayrollStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  DRAFT = 'DRAFT',
}

export interface SummaryCard {
  labelKey: SummaryCardLabelKey;
  value: number;
}

export interface RecentPayrollRecord {
  id: string;
  payrollPeriod: string;
  payoutDate: string;
  status: PayrollStatus;
  totalAmount: number;
  totalDeductions: number;
  netAmount: number;
}

export interface DashboardResponse {
  summaryCards: SummaryCard[];
  recentPayrolls: RecentPayrollRecord[];
  meta: {
    generatedAt: string;
    appliedCountry: CountryCode;
    recentPayrollsLimit: number;
    currency: CurrencyCode;
    conversion: { rate: number; convertedAt: string };
    totalPayrollRecords: number;
    employeeTrend: {
      currentMonthCount: number;
      previousMonthCount: number;
    };
  };
}

export interface DashboardQuery {
  countryCode: string;
  limit: number;
}

/**
 * Raw Payroll row from the database.
 */
export type PayrollRow = {
  id: number;
  payrollId: string;
  payrollPeriod: string;
  payoutDate: Date;
  status: string;
  totalAmount: number;
  totalDeductions: number;
  netAmount: number;
  currency: string;
  country: string;
};

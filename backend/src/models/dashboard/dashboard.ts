/**
 * Dashboard domain model.
 *
 * Defines the stable API contract for the dashboard endpoint, decoupled from
 * ORM types and the frontend view model.
 */

export enum CountryCode {
  In = 'IN',
  Us = 'US',
  Gb = 'GB',
  De = 'DE',
  Fr = 'FR',
  Ca = 'CA',
  Au = 'AU',
  Sg = 'SG',
  Jp = 'JP',
  Br = 'BR',
}

export enum CurrencyCode {
  Inr = 'INR',
  Usd = 'USD',
  Gbp = 'GBP',
  Eur = 'EUR',
  Cad = 'CAD',
  Aud = 'AUD',
  Sgd = 'SGD',
  Jpy = 'JPY',
  Brl = 'BRL',
}

export enum SummaryCardLabelKey {
  TotalEmployees = 'TOTAL_EMPLOYEES',
  PayrollProcessed = 'PAYROLL_PROCESSED',
  TotalDeductions = 'TOTAL_DEDUCTIONS',
  NetSalaryPaid = 'NET_SALARY_PAID',
}

export enum PayrollStatus {
  Completed = 'COMPLETED',
  Pending = 'PENDING',
  Failed = 'FAILED',
  Draft = 'DRAFT',
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

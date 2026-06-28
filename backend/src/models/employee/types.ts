/**
 * API models and types for the GET /api/v1/employees endpoint.
 */

import type { Employee } from './employee';

/** API pagination metadata */
export interface PaginationMeta {
  page: number;
  pageLimit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** API currency conversion metadata */
export interface ConversionMeta {
  rate: number;
  convertedAt: string; // ISO 8601 timestamp
}

/** API response metadata */
export interface Meta extends PaginationMeta {
  currency: string;
  targetCurrency: string;
  conversion: ConversionMeta;
}

/** Applied filters in API response */
export interface AppliedFilters {
  search: string;
  department: string;
  status: string;
}

/** API response filters object */
export interface Filters {
  applied: AppliedFilters;
}

/** API success response for list endpoint */
export interface EmployeeListResponse {
  data: Employee[];
  meta: Meta;
  filters: Filters;
}

/** V1 API query parameters (parsed and validated) */
export interface EmployeeQuery {
  page: number;
  pageLimit: number;
  search: string;
  department: string;
  status: string;
  targetCurrencyCode: string;
}

/** Standard error response payload */
export interface ErrorResponse {
  error: string;
}

/** Employee details for transactional create payload. */
export interface CreateEmployeeInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  department: string;
  designation: string;
  joiningDate: string;
  reportingManagerEmployeeId?: string;
  employmentType: string;
  country?: string;
  status?: string;
  avatarUrl?: string;
}

/** Salary structure for transactional create payload. */
export interface CreateSalaryStructureInput {
  basicSalary: number;
  currency?: string;
  effectiveDate?: string;
  endDate?: string | null;
  pfApplicable?: boolean;
  esiApplicable?: boolean;
}

/** Optional bank account details for transactional create payload. */
export interface CreateBankAccountInput {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

/** Payload for POST /api/v1/employees aligned with transactional create contract. */
export interface CreateEmployeePayload {
  employee: CreateEmployeeInput;
  salaryStructure: CreateSalaryStructureInput;
  bankAccounts?: CreateBankAccountInput[];
}

/** Structured 400 payload for create validation errors. */
export interface ValidationErrorResponse extends ErrorResponse {
  details: Record<string, string>;
}

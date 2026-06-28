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

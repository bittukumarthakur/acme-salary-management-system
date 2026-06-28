/**
 * Query parameter parser for the employees endpoint.
 * Validates and parses GET /api/v1/employees query params.
 */

import { cleanFilter, parseIntegerParam } from './queryParams';
import { SUPPORTED_CURRENCIES } from './currencyConversion';
import type { EmployeeQuery } from '../models/employee/types';

export const DEFAULT_PAGE_V1 = 1;
export const DEFAULT_PAGE_LIMIT_V1 = 10;
export const MAX_PAGE_LIMIT_V1 = 100;

/** Valid department enum values */
const VALID_DEPARTMENTS = ['ENGINEERING', 'MARKETING', 'FINANCE', 'HR', 'SALES'];

/** Valid status enum values */
const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];

export type ParseQueryResult = { ok: true; value: EmployeeQuery } | { ok: false; error: string };

/**
 * Parses and validates raw HTTP query parameters into a typed `EmployeeQuery`.
 * Returns `{ ok: false, error }` for invalid input so the caller can respond 400.
 */
export function parseEmployeeQuery(raw: Record<string, unknown>): ParseQueryResult {
  // Pagination - page
  const pageResult = parseIntegerParam(raw.page, DEFAULT_PAGE_V1);
  if (!pageResult.ok || pageResult.value < 1) {
    return { ok: false, error: 'Invalid "page": must be an integer >= 1' };
  }

  // Pagination - pageLimit
  const pageLimitResult = parseIntegerParam(raw.pageLimit, DEFAULT_PAGE_LIMIT_V1);
  if (
    !pageLimitResult.ok ||
    pageLimitResult.value < 1 ||
    pageLimitResult.value > MAX_PAGE_LIMIT_V1
  ) {
    return {
      ok: false,
      error: `Invalid "pageLimit": must be an integer between 1 and ${MAX_PAGE_LIMIT_V1}`,
    };
  }

  // Filters - search (optional, trim whitespace)
  const search = cleanFilter(raw.search) ?? '';

  // Filters - department (optional, validate enum value)
  const department = cleanFilter(raw.department) ?? '';
  if (department && !VALID_DEPARTMENTS.includes(department)) {
    return {
      ok: false,
      error: `Invalid "department": must be one of ${VALID_DEPARTMENTS.join(', ')} or empty`,
    };
  }

  // Filters - status (optional, validate enum value)
  const status = cleanFilter(raw.status) ?? '';
  if (status && !VALID_STATUSES.includes(status)) {
    return {
      ok: false,
      error: `Invalid "status": must be one of ${VALID_STATUSES.join(', ')} or empty`,
    };
  }

  // Conversion - targetCurrencyCode (optional, default to INR)
  const targetCurrencyCode = cleanFilter(raw.targetCurrencyCode) ?? 'INR';
  if (!SUPPORTED_CURRENCIES.includes(targetCurrencyCode.toUpperCase())) {
    return {
      ok: false,
      error: `Invalid "targetCurrencyCode": must be one of ${SUPPORTED_CURRENCIES.join(', ')}`,
    };
  }

  return {
    ok: true,
    value: {
      page: pageResult.value,
      pageLimit: pageLimitResult.value,
      search,
      department,
      status,
      targetCurrencyCode: targetCurrencyCode.toUpperCase(),
    },
  };
}

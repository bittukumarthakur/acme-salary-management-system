import type {
  EmployeeFilters,
  EmployeeQuery,
  EmployeeSortField,
  SortOrder,
} from '../models/employee';
import { EMPLOYEE_SORT_FIELDS } from '../models/employee';
import { cleanFilter, parseDateParam, parseIntegerParam } from '../utils/queryParams';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type ParseQueryResult = { ok: true; value: EmployeeQuery } | { ok: false; error: string };

/**
 * Parses and validates raw HTTP query parameters into a typed `EmployeeQuery`.
 * Returns `{ ok: false, error }` for invalid input so the caller can respond 400.
 */
export function parseEmployeeQuery(raw: Record<string, unknown>): ParseQueryResult {
  // Pagination
  const pageResult = parseIntegerParam(raw.page, DEFAULT_PAGE);
  if (!pageResult.ok || pageResult.value < 1) {
    return { ok: false, error: 'Invalid "page": must be an integer >= 1' };
  }

  const pageSizeResult = parseIntegerParam(raw.pageSize, DEFAULT_PAGE_SIZE);
  if (!pageSizeResult.ok || pageSizeResult.value < 1 || pageSizeResult.value > MAX_PAGE_SIZE) {
    return {
      ok: false,
      error: `Invalid "pageSize": must be an integer between 1 and ${MAX_PAGE_SIZE}`,
    };
  }

  // Sorting
  const sortByRaw = cleanFilter(raw.sortBy);
  const sortBy: EmployeeSortField = (sortByRaw ?? 'id') as EmployeeSortField;
  if (!EMPLOYEE_SORT_FIELDS.includes(sortBy)) {
    return {
      ok: false,
      error: `Invalid "sortBy": must be one of ${EMPLOYEE_SORT_FIELDS.join(', ')}`,
    };
  }

  const sortOrderRaw = cleanFilter(raw.sortOrder)?.toLowerCase() ?? 'asc';
  if (sortOrderRaw !== 'asc' && sortOrderRaw !== 'desc') {
    return { ok: false, error: 'Invalid "sortOrder": must be "asc" or "desc"' };
  }
  const sortOrder: SortOrder = sortOrderRaw;

  // Date filters
  const fromResult = parseDateParam(raw.joiningDateFrom);
  if (!fromResult.ok) {
    return { ok: false, error: 'Invalid "joiningDateFrom": must be a valid date (YYYY-MM-DD)' };
  }
  const toResult = parseDateParam(raw.joiningDateTo);
  if (!toResult.ok) {
    return { ok: false, error: 'Invalid "joiningDateTo": must be a valid date (YYYY-MM-DD)' };
  }

  // Exact-match + search filters (empty values are ignored)
  const filters: EmployeeFilters = {};
  const search = cleanFilter(raw.search);
  if (search) filters.search = search;
  const country = cleanFilter(raw.country);
  if (country) filters.country = country;
  const department = cleanFilter(raw.department);
  if (department) filters.department = department;
  const designation = cleanFilter(raw.designation);
  if (designation) filters.designation = designation;
  const employmentType = cleanFilter(raw.employmentType);
  if (employmentType) filters.employmentType = employmentType;
  const status = cleanFilter(raw.status);
  if (status) filters.status = status;
  if (fromResult.value) filters.joiningDateFrom = fromResult.value;
  if (toResult.value) filters.joiningDateTo = toResult.value;

  return {
    ok: true,
    value: {
      page: pageResult.value,
      pageSize: pageSizeResult.value,
      sortBy,
      sortOrder,
      filters,
    },
  };
}

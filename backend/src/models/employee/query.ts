/**
 * Types describing how employees can be filtered, sorted and queried.
 */

/** Sort direction for list queries. */
export type SortOrder = 'asc' | 'desc';

/** Columns that are allowed to be used for sorting (allow-list). */
export const EMPLOYEE_SORT_FIELDS = ['id', 'name', 'joiningDate', 'employeeId'] as const;
export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number];

/** Filters that can be applied when listing employees. All combine with AND. */
export interface EmployeeFilters {
  search?: string;
  country?: string;
  department?: string;
  designation?: string;
  employmentType?: string;
  status?: string;
  joiningDateFrom?: Date;
  joiningDateTo?: Date;
}

/** Fully-parsed, validated query for listing employees. */
export interface EmployeeQuery {
  page: number;
  pageSize: number;
  sortBy: EmployeeSortField;
  sortOrder: SortOrder;
  filters: EmployeeFilters;
}

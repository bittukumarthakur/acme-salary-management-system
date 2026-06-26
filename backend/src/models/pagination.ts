/**
 * Generic pagination types shared across resources.
 */

/** Pagination metadata returned alongside a page of results. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** A page of results plus pagination metadata. */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

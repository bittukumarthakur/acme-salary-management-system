# Employee GET API: Pagination & Filters

- **Date**: 2026-06-26
- **Status**: completed

## Summary

Enhance `GET /api/employees` to return small, manageable pages of data instead of the full list.
Add pagination plus a set of filters (and basic sorting) driven by query parameters, backed by
Prisma `where`, `skip`/`take`, and `orderBy`. `GET /api/employees/:id` is unchanged.

## Proposed Query Parameters

### Pagination
- `page` — 1-based page number. Default `1`. Must be >= 1.
- `pageSize` — items per page. Default `20`. Allowed range `1..100` (clamped/validated).

### Filters
- `search` — free-text, case-insensitive match across `name`, `email`, and `employeeId`
  (Prisma `OR` + `contains`, `mode: 'insensitive'`).
- `country` — exact match.
- `department` — exact match.
- `designation` — exact match.
- `employmentType` — exact match (e.g. Full-Time, Part-Time, Contract, Intern).
- `status` — exact match (e.g. Active, On Leave, Terminated).
- `joiningDateFrom` — inclusive lower bound on `joiningDate` (ISO date `YYYY-MM-DD`).
- `joiningDateTo` — inclusive upper bound on `joiningDate` (ISO date `YYYY-MM-DD`).

> Multiple filters combine with AND. Unknown/empty params are ignored.

### Sorting (optional, nice-to-have)
- `sortBy` — one of an allow-list: `id`, `name`, `joiningDate`, `employeeId`. Default `id`.
- `sortOrder` — `asc` | `desc`. Default `asc`.

## Proposed Response Shape

```json
{
  "data": [ /* Employee[] */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 137,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Design Notes / Decisions

- **Validation**: invalid `page`/`pageSize` (non-numeric, < 1, > max) return `400` with a clear
  error message; out-of-range `pageSize` is rejected rather than silently clamped (TBD — confirm
  preference: reject vs clamp).
- **`sortBy` allow-list**: only whitelisted columns are accepted to avoid arbitrary/unsafe ordering.
- **Service contract**: introduce a typed `EmployeeQuery` (filters + pagination + sort) input and a
  `PaginatedResult<Employee>` return type, kept in `src/models/employee.ts`.
- **Date handling**: `joiningDateFrom/To` parsed into `Date`; invalid dates return `400`.
- **Backward compatibility**: response shape changes from `{ data }` to `{ data, pagination }`.
  Existing tests that assert on `data` still work; new tests cover pagination + filters.

## Steps (once approved)

1. Add `EmployeeQuery`, `PaginationMeta`, and `PaginatedResult<T>` types to `src/models/employee.ts`.
2. Add a query-parsing/validation helper (parse + validate query params, return typed query or error).
3. Update `employeeService.getEmployees` to accept `EmployeeQuery`, build Prisma `where`/`orderBy`,
   run `findMany` + `count` (ideally in a transaction), and return `PaginatedResult<Employee>`.
4. Update the `GET /api/employees` route to parse query params, call the service, return 400 on
   invalid input, and emit the new response shape.
5. Add/update unit tests: query parsing/validation, service filtering/pagination/sorting (mocked
   Prisma), and route integration tests (happy path, filters, pagination, validation errors).
6. Run `yarn test` and ensure all pass.

## Open Questions

1. `pageSize` over the max (100): reject with `400`, or clamp to 100? (default plan: reject)
2. Should sorting be included now, or deferred to a follow-up?
3. Default `pageSize`: is `20` acceptable, or do you prefer `10`?

### Resolutions
1. Reject `pageSize` > 100 with `400`.
2. Sorting is included now (`sortBy` allow-list + `sortOrder`).
3. Default `pageSize` is `20`; max remains `100` (per-request cap; all 10k rows reachable via `page`).

## Status Updates

- 2026-06-26: Created (draft) — awaiting approval before implementation
- 2026-06-26: Approved with sorting included and default pageSize 20; implementing via TDD
- 2026-06-26: Completed via TDD — added `EmployeeQuery`/`PaginatedResult` types, `employeeQuery`
  parser/validator, paginated+filtered+sorted `getEmployees`, and the `GET /api/employees` route
  with 400 validation. 37 tests passing.






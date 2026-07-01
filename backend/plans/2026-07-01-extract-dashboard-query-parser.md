# Extract Dashboard Query Parser

- **Date**: 2026-07-01
- **Status**: completed

## Summary

Move the inline `countryCode` / `limit` validation out of the dashboard route
handler into a dedicated `parseDashboardQuery` util that returns a
`ParseResult<DashboardQuery>` (`{ ok: true, value } | { ok: false, error }`).
This mirrors the existing `parseEmployeeQuery` convention so the route stays thin
and the validation is unit-testable in isolation.

## Steps

1. (Red) Add `test/utils/dashboardQuery.test.ts` covering defaults, valid values,
   and error cases (unknown countryCode, limit < 1, limit > MAX_LIMIT, non-integer).
2. (Green) Add `src/utils/dashboardQuery.ts` exporting `parseDashboardQuery`.
3. (Refactor) Simplify `src/routes/dashboard.ts` to call `parseDashboardQuery`.
4. Run the full backend test suite and confirm green.

## Status Updates

- 2026-07-01: Created
- 2026-07-01: Completed — added `parseDashboardQuery` util + tests, slimmed the route; full suite green (126 tests).

# Extract Employee Code ID Param Helper

- **Date**: 2026-07-01
- **Status**: completed

## Summary

Remove the duplicated `:id` extraction + validation blocks in the employees
router. The two GET routes (`GET /:id`, `GET /:id/salary-history`) both parse,
validate (EMP-code format), and normalize the route param inline (3 near-identical
blocks total, including PUT). Extract a single `extractEmployeeCodeId` helper into
`utils/employeeId.ts` returning a `ParseResult`-style shape, and drop the dead
`Array.isArray(req.params.id)` branch (a `:id` param is always a string in Express 5).

Note: `PUT /:id` uses the **numeric database id** (`updateEmployee` does
`Number(id)`), NOT the EMP code — so it keeps its own semantics and error message;
only its dead array branch is simplified via `firstString`.

## Steps

1. (Red) Add `test/utils/employeeId.test.ts` covering `extractEmployeeCodeId`
   (defaults/valid/normalization, array input, missing, malformed format).
2. (Green) Add `extractEmployeeCodeId` + `INVALID_EMPLOYEE_ID_ERROR` to
   `src/utils/employeeId.ts`.
3. (Refactor) Use the helper in both GET routes; simplify PUT id extraction with
   `firstString`; remove now-unused imports.
4. Run the full backend suite and confirm green.

## Status Updates

- 2026-07-01: Created
- 2026-07-01: Completed — added `extractEmployeeCodeId` + tests, refactored both GET routes and simplified PUT id extraction; full suite green (135 tests).

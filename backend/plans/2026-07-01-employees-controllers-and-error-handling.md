# Employees Router: Controllers + Central Error Handling

- **Date**: 2026-07-01
- **Status**: completed

## Summary

Restructure the employees router so it is pure wiring, moving handler logic into
a controller module (B) and centralizing domain-error → HTTP mapping (A).

- **B**: Add `src/controllers/employeesController.ts` with the 5 handlers.
  The router (`src/routes/employees.ts`) becomes route→handler wiring only.
- **A**: Add `src/utils/routeErrorHandler.ts` with:
  - `mapDomainError(error)` — central mapping of `EmployeeNotFoundError` (404),
    `EmailAlreadyInUseError` (409), `DuplicateSalaryDateError` (409), and the
    duplicate-employee-id error (409) to their HTTP status + response body.
  - `asyncRoute(context, handler)` — wraps an async handler; on throw, maps
    domain errors centrally, else logs with the route's `logTag` and returns a
    500 with the route's `fallbackMessage`.

### Contract preservation

The suite asserts route-specific 500 log tags/messages
(`'Failed to fetch employees'`, `'Failed to create employee'`,
`'Failed to fetch salary history'`, and PUT's `error.message` fallback), so a
pure global error middleware is unsuitable. `asyncRoute` carries per-route 500
context while centralizing the domain-error mapping. All existing response
bodies/messages are preserved exactly; the 135-test suite is the safety net.

## Steps

1. (Red) Add `test/utils/routeErrorHandler.test.ts` for `mapDomainError` +
   `asyncRoute`.
2. (Green) Add `src/utils/routeErrorHandler.ts`.
3. (Refactor) Add `src/controllers/employeesController.ts`; slim
   `src/routes/employees.ts` to wiring.
4. Run the full backend suite and confirm green.

## Status Updates

- 2026-07-01: Created
- 2026-07-01: Completed — added `routeErrorHandler` (`mapDomainError` + `asyncRoute`) with tests, moved handlers to `employeesController`, slimmed the router to wiring. Build + format + full suite green (144 tests).

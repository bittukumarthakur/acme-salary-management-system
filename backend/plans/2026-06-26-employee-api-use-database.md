# Use Database for Employee API

- **Date**: 2026-06-26
- **Status**: completed

## Summary

The employee API currently returns hardcoded in-memory data from `employeeService.ts`. This plan
replaces the hardcoded data with queries against the Prisma/PostgreSQL database so the API serves
real persisted employee records.

## Steps

1. Refactor `employeeService.ts` to query the database via Prisma instead of using a hardcoded array.
2. Update the employee routes to handle the now-async service functions.
3. Update unit/integration tests to mock the Prisma client and validate DB-backed behavior.
4. Run the test suite to verify all changes pass.

## Improvement Decisions

- **Own the domain model, don't reuse the ORM type**: The public `Employee` type must not be imported
  from the Prisma-generated client (`generated/prisma`). That folder is git-ignored and only exists
  after `prisma generate`, and reusing it couples the API contract to the ORM and leaks ORM-only
  fields (`createdAt`, `updatedAt`) and types (`Date`).
- **Dedicated models directory**: Introduced `src/models/` and defined the `Employee` domain
  interface (plus an `EmployeeRow` input type) in `src/models/employee.ts` as the single source of
  truth for the API shape.
- **Map at the service boundary**: `employeeService.ts` imports the model and uses a typed
  `toEmployee(row)` mapper to convert a Prisma row into the `Employee` contract. The typed mapper
  still surfaces schema drift at compile time without coupling consumers to the ORM.
- **Stable date contract**: `joiningDate` is exposed as a `YYYY-MM-DD` `string` rather than the
  ORM `Date`, keeping the JSON response format stable.

## Status Updates

- 2026-06-26: Created
- 2026-06-26: In progress — refactoring service and routes to use Prisma
- 2026-06-26: Completed — service now queries the database; all 27 tests pass
- 2026-06-26: Refactored to a dedicated `src/models/` domain model with a service-layer mapper,
  decoupling the API contract from the git-ignored Prisma-generated type; all 27 tests pass




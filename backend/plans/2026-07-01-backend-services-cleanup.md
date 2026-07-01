# Backend services/ Cleanup

- **Date**: 2026-07-01
- **Status**: completed

## Summary

Clean up the backend `services/` (and closely-related `utils/`) directory after
discovering a dead, duplicated employee stack and a misplaced/misnamed helper
file. Executed in 4 steps, each landing as its own commit with a green build +
suite.

## Steps

1. Delete the dead legacy stack (`services/employeeService.ts`,
   `services/employeeQuery.ts`, and their two tests). Add a unit test for the
   live parser `utils/employeesQuery.ts` (currently untested directly).
2. Rename the misplaced `utils/employeesService.ts` (DB/mapping helpers) to a
   non-colliding name and update its importer.
3. De-dupe row→API mapping: check `mapEmployeeRowToApi` vs
   `services/employeeMapper.toEmployee`; consolidate if overlapping.
4. Consistency pass (e.g. relocate pure `salaryCalculation.ts` if warranted).

## Status Updates

- 2026-07-01: Created
- 2026-07-01: Step 1 done (539984f) — deleted dead stack, added employeesQuery test.
- 2026-07-01: Step 2 done (f5b166c) — renamed utils/employeesService → employeeDbHelpers.
- 2026-07-01: Step 3 done (f060141) — simplified mapEmployeeRowToApi (dropped dead
  convertedSalary); confirmed it is intentionally distinct from toEmployee, not merged.
- 2026-07-01: Step 4 done — relocated pure salaryCalculation.ts to utils/. All 4 steps
  complete; suite green (128 tests). Status: completed.

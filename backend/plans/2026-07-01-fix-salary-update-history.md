# Fix salary update history (append revisions, return full history)

- **Date**: 2026-07-01
- **Status**: completed

## Summary

Updating an employee's salary currently overwrites the current salary
revision instead of appending a new one, so `GET /api/v1/employees/:id/salary-history`
returns only one row and prior salaries are lost. Make salary changes
append a new `EmployeeSalaryStructure` revision (closing the previous
revision's `endDate`), and ensure the edit form supplies a distinct
effective date so a change is recorded as a new revision.

## Root Cause

- History is derived entirely from `EmployeeSalaryStructure` rows
  (`salaryHistoryService.getSalaryHistory` — one entry per row, newest first).
- `updateEmployeeService` matches an existing revision by exact
  `effectiveDate`. When the amount changed **and** a row with that date
  exists, it **updates that row in place** (overwrites), so no new
  revision is appended.
- The edit form pre-fills `effectiveFrom` with the *current* revision's
  date (`editEmployeeForm.ts:205`). A normal salary edit therefore submits
  the same date → hits the in-place-update branch → history is lost.
- Employee creation seeds exactly one structure row
  (`employeesService.ts:344`), so before any update there is a single
  revision; the overwrite keeps it at one → "no history".
- The previous revision's `endDate` is never set, so the timeline is
  never closed.

## Steps

1. (Backend, TDD) Add failing tests to `updateEmployeeService` covering:
   a salary change with a later `effectiveFrom` appends a new revision and
   sets the previous revision's `endDate`; a change with the same date as
   the current revision updates in place; an unchanged salary creates no
   new revision.
2. (Backend) Rework the salary-revision block: when salary changed, if the
   submitted `effectiveFrom` differs from the current revision's date,
   append a new revision and close the previous revision's `endDate`;
   otherwise update the current revision in place.
3. (Frontend, TDD) Default the edit form's `effectiveFrom` to today (still
   editable) so a salary change gets a distinct effective date, and add a
   validation that it must be on/after the current revision date.
4. Verify `GET /salary-history` returns all revisions newest-first with the
   correct `isCurrent` marker.
5. Run backend + frontend build/lint/format/test; keep suite green.

## Status Updates

- 2026-07-01: Created
- 2026-07-01: Implemented append-only salary revisions in updateEmployeeService
  (append + close previous endDate on a new effective date; in-place correction
  on the same date; no-op when unchanged) and defaulted the edit form's
  effectiveFrom to today. Backend 136 tests and frontend 159 tests green.
  Completed.

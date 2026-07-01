# Add Allowances field to the Add Employee form

- **Date**: 2026-07-02
- **Status**: completed

## Summary

Surface an `Allowances` earning on the Add Employee form so it is captured on
create and shown in the employee's salary breakdown. Keeps the Add and Edit
pages in sync: the backend persists an `Allowances` EARNING salary component,
which the details view displays and the edit page renders as an editable earning
automatically (edit earnings are dynamic, keyed by component name).

## Steps

1. Add `allowances` to `AddEmployeeFormState` + `initialFormState` (`formModel.ts`).
2. Validate the optional `allowances` amount (>= 0) in `formValidation.ts`.
3. Render an `Allowances` number field in `SalaryInfoSection.tsx`.
4. Send `allowances` in the create payload when provided (`AddEmployeePage.tsx`).
5. Add `allowances?` to the `CreateEmployeePayload.salaryStructure` type
   (`employees.ts`).
6. Cover the new field in `AddEmployeePage.test.tsx` (filled + asserted in the
   create payload).

## Status Updates

- 2026-07-02: Created
- 2026-07-02: Implemented; frontend build + 164 tests pass, lint + format clean. Completed.

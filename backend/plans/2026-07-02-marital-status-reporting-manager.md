# Align employee fields with DB schema (remove marital status & reporting manager)

- **Date**: 2026-07-02
- **Status**: completed

## Summary

Marital Status and Reporting Manager were collected on the Add Employee form and
Reporting Manager was shown on the details view, but the `employee` table has no
columns for either (Reporting Manager was always a hardcoded `null`). Rather than
add new DB columns, we align the UI/API with the existing schema by removing these
two fields everywhere.

`workLocation` is kept — it is derived from the employee's `country` column, so it
is schema-backed.

## Steps

1. Backend create: drop `maritalStatus` (was required) and `reportingManagerEmployeeId`
   (optional) from the create payload parser, `CreateEmployeeInput`, and constants.
2. Backend view (details): remove `reportingManager` from `JobInformation` and the
   service mapping.
3. Frontend Add form: remove Marital Status + Reporting Manager fields (form state,
   options, validation, section components, submit payload, `CreateEmployeePayload`).
4. Frontend view: remove the Reporting Manager row from the overview panel and
   `reportingManager` from `JobInformation`.
5. Update tests + fixtures accordingly.

## Deferred

- Superseded the earlier plan to add DB columns for these fields (not doing it, per
  decision to avoid new schema/complexity).

## Status Updates

- 2026-07-02: Created (originally as an "add DB columns" migration plan).
- 2026-07-02: Reversed direction — removed the fields to match the schema instead.
  Backend 136 tests pass, frontend 164 tests pass; lint + format clean on both.

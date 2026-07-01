# Fix Add/Edit employee field mismatches

- **Date**: 2026-07-01
- **Status**: completed

## Summary

The Add Employee and Edit Employee forms had mismatched option values and labels:

- **Bug #1**: Edit department options used Title-Case strings (`'Engineering'`) as both
  value and label, while the backend stores/returns UPPERCASE (`ENGINEERING`). The Edit
  department dropdown rendered empty for non-HR employees.
- **Bug #2**: Employment-type options/labels differed between Add (`Permanent`, missing
  Part Time) and Edit (`Full Time`, includes Part Time).

Also aligning editable fields: make **Date of Birth** and **Gender** editable end-to-end
(schema-backed). Marital Status and Reporting Manager are deferred (no DB columns).

## Steps

1. (Commit 1) Add a shared `employeeOptions` source of truth for department +
   employment-type options (UPPERCASE values, consistent labels); use it in both Add and
   Edit forms. TDD.
2. (Commit 2) Make DOB & gender editable: backend view response + update payload/service,
   frontend Edit form fields. TDD.

## Deferred

- Marital Status + Reporting Manager editability (require a Prisma schema migration:
  `maritalStatus` enum column + self-referential `reportingManagerId`).

## Status Updates

- 2026-07-01: Created; starting Commit 1 (shared options).
- 2026-07-01: Commit 1 done (shared department + employment-type options).
- 2026-07-01: Commit 2 done (DOB & gender editable end-to-end: backend details
  response, update payload parser + service persistence; frontend types, edit form
  fields, submit payload). Backend 136 tests pass, frontend 164 tests pass.

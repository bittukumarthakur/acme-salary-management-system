# Wire PF & ESI as salary components on employee create

- **Date**: 2026-07-02
- **Status**: completed

## Summary

Make the Add Employee salary inputs meaningful by persisting them as real
`EmployeeSalaryComponent` rows on create, instead of parsing and discarding
them. Adopts a lean component set: Basic Salary plus an `Allowances` earning,
with PF and ESI as toggle-gated deductions. Also trims the salary component
catalog and seed to just `Allowances`, `PF`, and `ESI`, removing components that
were never surfaced by the app.

## Steps

1. Trim the salary component catalog (`scripts/masterData.ts`) to `Allowances`
   (EARNING), `PF`, and `ESI` (DEDUCTION). Remove the unused DA, HRA, Conveyance,
   Meal Allowance, Health & Wellness Cess, and IncomeTax entries (ALLOWANCE/TAX
   types were never displayed by the details/history views, which only render
   EARNING/DEDUCTION).
2. Simplify `seedEmployeeSalaryComponents` (`scripts/seedEmployees.ts`) to seed
   Allowances/PF/ESI mappings, reusing `PF_RATE`/`ESI_RATE`.
3. Add `PF_RATE` (12%) and `ESI_RATE` (0.75%) rate constants in
   `src/utils/salaryCalculation.ts` and reuse `PF_RATE` in the breakdown calc.
4. Accept an optional `allowances` amount in the salary structure payload
   (`optionalNumber` reader in `shared.ts`, parsed/validated in
   `salaryStructure.ts`, typed in `CreateSalaryStructureInput`).
5. In `createEmployee` (`src/services/employeesService.ts`), within the
   transaction, create an `EmployeeSalaryComponent` row for the Allowances
   earning (when > 0) and for PF/ESI deductions (when toggled), amounts derived
   from basic × rate. Skip gracefully if the catalog component is absent.
6. Extend the prisma mock and add tests covering component creation on/off and
   the new `optionalNumber` reader.

## Status Updates

- 2026-07-02: Created
- 2026-07-02: Implemented backend wiring; 138 backend tests pass, lint + format clean. Completed.
- 2026-07-02: Added `Allowances` earning component end-to-end (catalog, payload, create-wiring, seed) with parser tests; 140 backend tests pass.

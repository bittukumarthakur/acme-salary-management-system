# Refactor Edit Employee Page And Test Fixtures

- **Date**: 2026-06-30
- **Status**: draft

## Summary

Refactor the employee edit UI flow to reduce page-level nesting and mixed responsibilities, then standardize employee test data into typed fixtures so tests are easier to maintain and less repetitive.

## Findings

1. EditEmployeePage is handling too many responsibilities in one file.
   - File: frontend/src/features/employees/pages/EditEmployeePage.tsx
   - Current responsibilities mixed together: load state lifecycle, request race protection, field update/blur handlers, validation triggering, payload mapping, save/cancel navigation, and page composition.
   - Refactor target: move state and action logic into a dedicated page hook and keep the page mostly compositional.

2. Edit page has avoidable layout/provider duplication.
   - File: frontend/src/features/employees/pages/EditEmployeePage.tsx
   - LocalizationProvider appears twice around sibling sections.
   - Refactor target: use a single provider wrapper in the page layout.

3. Basic info section is deeply nested and repetitive.
   - File: frontend/src/features/employees/components/edit/EditEmployeeBasicInfoSection.tsx
   - Large grid tree with repeated field patterns (TextField/FormControl/Select + repeated error rendering).
   - Refactor target: extract reusable field wrappers and sub-sections (profile block, contact block, employment block).

4. Salary section mixes heavy calculation logic with rendering.
   - File: frontend/src/features/employees/components/edit/EditEmployeeSalarySection.tsx
   - Multiple derived salary computations plus large inline JSX fragments (including earningsColumn) in one component.
   - Refactor target: move calculations to pure utility functions and keep section component presentation-focused.

5. Employee list test data is duplicated across tests instead of fixture-driven.
   - Files:
     - frontend/src/test/features/employees/hooks/useEmployeesData.test.ts
     - frontend/src/test/features/employees/services/employeesApi.test.ts
     - frontend/src/test/features/employees/pages/EmployeesPage.test.tsx
   - Existing fixture coverage is partial (employee details fixture exists), but list response/base hook data is redefined in multiple tests.
   - Refactor target: add shared typed list fixtures under frontend/src/test/data and reuse them in tests.

6. Missing component-level test coverage for salary edit section.
   - Existing component test: frontend/src/test/features/employees/components/edit/EditEmployeeBasicInfoSection.test.tsx
   - Missing parallel test file for salary edit interactions and derived totals behavior.
   - Refactor target: add EditEmployeeSalarySection component tests for editing amounts, derived totals, and error display.

## Steps

1. Baseline and safety checks
2. Extract EditEmployeePage state/actions into a dedicated hook
3. Simplify EditEmployeePage layout composition
4. Reduce nested UI structure in basic info and salary sections
5. Centralize repeated employee list API test data into typed fixtures
6. Add missing component-level tests for salary section behavior
7. Run targeted frontend tests and full frontend test suite

## Status Updates

- 2026-06-30: Created
- 2026-06-30: Added concrete findings from UI nesting and test-data analysis.

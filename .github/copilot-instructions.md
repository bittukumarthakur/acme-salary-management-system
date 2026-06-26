# Common Instructions

These rules apply across the whole repository (backend, frontend, and tooling).

## Plan Tracking

Whenever a plan is created (e.g., using Copilot's Plan mode), a tracking file **must** be saved in a `plans/` directory.

### Plan Location

Plans are scoped to the area they concern:

- **Backend plans** → `backend/plans/`
- **Frontend plans** → `frontend/plans/`
- **Repo-wide / cross-cutting plans** (e.g., CI/CD, tooling, root docs) → `plans/` at the project root.

Always create the plan inside the directory for the area it concerns; only use the root `plans/` for changes that span the whole repository.

### File Naming

```
<plans-dir>/YYYY-MM-DD-<short-description>.md
```

Examples:

```
backend/plans/2026-06-24-add-auth-module.md      # backend
frontend/plans/2026-06-24-employee-table.md      # frontend
plans/2026-06-24-ci-pipeline.md                  # repo-wide
```

- Use the current date as a prefix for chronological sorting
- Use kebab-case for the description (e.g., `2026-06-24-add-auth-module.md`)

### Required Content

Every plan tracking file must include these sections:

```markdown
# <Plan Title>

- **Date**: YYYY-MM-DD
- **Status**: draft | in-progress | completed

## Summary

<Brief description of what this plan aims to accomplish>

## Steps

1. Step one
2. Step two
3. ...

## Status Updates

- YYYY-MM-DD: Created
```

### Rules

- Create the file at the **start** of planning, with status `draft`
- Update status to `in-progress` once work begins
- Update status to `completed` when all steps are done
- Each plan gets its own file — do not combine multiple plans into one file
- Save the plan in the correct location for its area (backend → `backend/plans/`, frontend → `frontend/plans/`, repo-wide → root `plans/`)

## Package Manager

- Use **Yarn** as the package manager for installing dependencies and running scripts:

```
yarn install
yarn test
```

## Testing Requirements

Every feature or code change **must** include corresponding tests.

- Write unit tests for all new functions, methods, and services
- Update existing tests when modifying behavior of existing code
- Tests must be written in the same PR/commit as the feature code — never defer testing to a later step
- Aim for meaningful coverage: test happy paths, edge cases, and error scenarios
- Use the project's established testing framework and conventions for the area
- Test files should follow the existing directory structure (e.g., `test/` mirroring `src/`)

## Test-Driven Development (TDD)

All new features and behavior changes **must** follow a Test-Driven Development workflow.

### The Red-Green-Refactor Cycle

1. **Red** — Write a failing test that describes the desired behavior **before** writing any
   implementation code. Run the test and confirm it fails for the right reason.
2. **Green** — Write the minimum implementation code needed to make the test pass. Run the tests
   and confirm they pass.
3. **Refactor** — Clean up the implementation and tests while keeping all tests green.

### Rules

- Never write implementation code before there is a failing test covering it.
- Write tests in small increments; do not implement large features without intermediate test runs.
- Each Red step must produce a test that fails because the behavior is missing — not because of
  compile/setup errors unrelated to the feature.
- Keep the suite green before moving to the next behavior.
- Cover happy paths, edge cases, and error scenarios as separate tests.
- Run the test command after each Red and Green step to verify the cycle.

---

# Backend Instructions

Conventions specific to the `backend/` service (Node.js, Express, TypeScript, Prisma).

## Plans

- Backend plans live in `backend/plans/`.

## Testing

- Use **Jest** (with `ts-jest`) as the testing framework; use Supertest for API integration tests.
- Run tests with `yarn test` (and `yarn test:coverage` / `yarn test:ci` for coverage).
- Keep tests under `backend/test/` mirroring `backend/src/`.

## Refactoring Conventions

These conventions capture the agreed-upon structure for keeping the codebase modular and clean.
Apply them whenever adding or refactoring code.

### Domain Models

- Define the application's own domain/DTO types in `src/models` — never expose ORM-generated types
  (e.g. the git-ignored `generated/prisma` client) as the public API/service contract.
- Map ORM rows to domain models at the service boundary (e.g. a `toEmployee(row)` mapper).
- Keep ORM-only concerns (e.g. `createdAt`/`updatedAt`, `Date` columns) out of the public shape;
  expose stable formats instead (e.g. `joiningDate` as a `YYYY-MM-DD` string).

### Modular Files & Directories

- Group related types by domain into their own directory and files rather than one large file.
  Example: `src/models/employee/` with `employee.ts` (entity), `query.ts` (filters/sort/query).
- Provide a barrel `index.ts` per domain directory so consumers keep a single stable import path
  (e.g. `import { Employee } from '../models/employee'`).
- Put generic/shared types in their own file at the appropriate level, not inside a resource
  directory. Example: `src/models/pagination.ts` for `PaginationMeta` / `PaginatedResult<T>`.

### Test Data / Fixtures

- Store reusable test data as typed `.ts` fixtures under `test/data/` and import them into tests
  instead of inlining large fixtures or using untyped JSON.
- Validate each fixture against its domain type with the `satisfies` operator (e.g.
  `export const alice = { ... } satisfies Employee`) so missing/renamed/mismatched fields are
  caught at compile time, and rich types like `Date` are expressed natively (no JSON hydration).
- Silence expected `console.error`/log output in error-path tests via `jest.spyOn`, and restore it.

### Build Output & Tooling

- Treat `dist/` (and other build output) as disposable, git-ignored, and excluded from type-checking
  and test discovery. Remove stale `dist/` if it shadows source types or causes duplicate test runs.
- Scope Jest to the source tests with `roots: ["<rootDir>/test"]` rather than ignoring paths.

---

# Frontend Instructions

Conventions specific to the `frontend/` app (React, TypeScript, Vite).

## Plans

- Frontend plans live in `frontend/plans/`, mirroring the backend convention so frontend work is
  tracked alongside the frontend code.

## Testing

- Follow the same TDD and Testing Requirements from the Common section.
- Use the frontend's established testing tools (e.g., component and user-interaction tests) and keep
  test files alongside or mirroring the source structure.

## Refactoring Conventions

- Keep components and modules small and focused; group related files by feature/domain.
- Define the app's own view-model/DTO types rather than leaking API/transport shapes throughout the UI.

---
name: tdd
description: 'Drive new features and behavior changes with Test-Driven Development. Write a failing test first to lock the contract, then implement. Use when adding a feature, changing behavior, fixing a bug, or when the user says "TDD", "write tests first", "red-green-refactor", "test first", or "write a test before the feature" in this Yarn monorepo (Jest backend, Vitest frontend).'
argument-hint: 'Optional: the feature/behavior to build test-first'
---

# Test-Driven Development (TDD)

Write the test before the implementation so the test defines the contract. Never
write production code without a failing test that requires it.

## When to Use

- Adding a new function, service, route, component, or behavior.
- Fixing a bug (reproduce it with a failing test first).
- Changing existing behavior (update/extend tests before the code).

## When NOT to Use

- Pure formatting, comments, or renames with no behavior change.
- Spikes/throwaway exploration (but rewrite test-first before keeping code).

## Test Stack & Layout

| Area | Framework | Run | Location |
|------|-----------|-----|----------|
| Backend (`backend/`) | Jest (`ts-jest`) + Supertest for routes | `yarn test`, `yarn test:watch` | `backend/test/` mirroring `backend/src/` |
| Frontend (`frontend/`) | Vitest (+ Testing Library) | `yarn test`, `yarn test:watch` | alongside / mirroring `frontend/src/` |

Use typed fixtures under `test/data/` validated with `satisfies` (e.g.
`export const alice = { ... } satisfies Employee`) instead of inline/untyped data.

## The Red-Green-Refactor Cycle

Work in small increments. One behavior at a time.

### 1. RED — write a failing test that states the contract

- Name the behavior precisely (`describe`/`it` reads like a spec sentence).
- Assert on the **public contract**: inputs → outputs/effects, not internals.
- Run the test and **confirm it fails for the right reason** (assertion failure
  about missing behavior — not a compile/import/setup error).

```bash
cd backend   # or frontend
yarn test --watch   # or: yarn test <path>
```

### 2. GREEN — minimum code to pass

- Write the least implementation that makes the test pass. No extra features.
- Run the tests and confirm the new test (and all others) pass.

### 3. REFACTOR — clean up with tests green

- Remove duplication, clarify names, extract helpers — keep every test green.
- Re-run the suite after each change.

Repeat for the next behavior. Keep the suite green before moving on.

## What to Cover (the important cases)

For each behavior, add **separate** tests for:

- **Happy path** — typical valid input produces the expected result.
- **Edge cases** — empty/zero/boundary values, large input, defaults, pagination
  limits, off-by-one boundaries.
- **Error cases** — invalid input, missing/forbidden resource, validation
  failures; assert the error type/status/message, not just "it threw".
- **Contract details** — exact output shape (DTO/view-model fields, formats like
  `joiningDate` as `YYYY-MM-DD`), status codes, and side effects.
- **State/order independence** — tests don't depend on execution order or shared
  mutable state; reset between tests.

### Backend specifics

- Test services in isolation; test routes with Supertest (status + body shape).
- Silence expected `console.error` in error-path tests via `jest.spyOn`, and
  restore it afterward.
- Assert on domain/DTO models, never ORM-generated types.

### Frontend specifics

- Test observable behavior (rendered output, user interactions, callbacks), not
  implementation details or internal state.
- Prefer role/text queries; simulate real user events.

## Good Test Principles

- **One reason to fail** per test — focused assertions.
- **Arrange–Act–Assert** structure; keep setup minimal and explicit.
- **Deterministic** — no real network/time/randomness; fake or inject them.
- **Behavior over implementation** — refactors shouldn't break good tests.
- **Readable as docs** — a new reader learns the contract from the test names.

## Procedure Checklist

- [ ] Identify the next single behavior / contract to build
- [ ] RED: write a failing test asserting the contract; run it; confirm it fails
      for the right reason
- [ ] GREEN: minimal implementation; run tests; all pass
- [ ] REFACTOR: clean up; tests stay green
- [ ] Added happy-path, edge, and error tests as separate cases
- [ ] Tests live in the correct location and use typed fixtures
- [ ] Full suite green before finishing (and before committing — see `commit` skill)

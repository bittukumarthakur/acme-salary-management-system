# Salary History API — Expose Revision History on Employee Endpoint

- **Date**: 2026-06-30
- **Status**: in-progress
- **Author**: BA Planner
- **Persona**: Frontend / Full-Stack Developer (internal enabler story)
- **Blocks**: [2026-06-30-salary-history-ui.md](./2026-06-30-salary-history-ui.md)

---

## User Story

As a **frontend developer**, I want the GET Employee API to return a structured list of all
historical salary revisions (ordered newest-first) so that the Salary History tab can render each
revision as its own card without needing a separate API call.

---

## Background / Context

The Salary History tab on the Employee Detail page currently shows a fallback message —
_"No salary history records were provided. Showing the current salary structure instead."_ —
and falls back to rendering only the current salary structure card.

This indicates that either:
1. The GET Employee API does not include a `salaryHistory` array, **or**
2. The array is present but always empty.

Before building the UI, this story confirms what the API currently returns and extends it if
needed, so the UI story has a reliable contract to code against.

---

## Scope

### In Scope
- Audit the existing GET Employee API response shape for a `salaryHistory` (or equivalent) field.
- If the field is missing: design and implement a `salaryHistory` array on the response.
- Define the canonical shape of each history entry (see Acceptance Criteria).
- Ensure entries are ordered **descending by effective date** (newest first) at the API layer.
- Return the current salary structure as the first element when no prior revisions exist (so the
  frontend always receives at least one entry).

### Out of Scope
- Any frontend / UI changes (covered by [2026-06-30-salary-history-ui.md](./2026-06-30-salary-history-ui.md)).
- Creating or editing salary revisions via the API (write operations).
- Pagination of the history list (assume ≤ 50 records per employee for now).
- Authentication / authorisation changes.

---

## Brainstorm Notes

**Assumptions / Confirmed Decisions**
- ✅ A salary revisions table **already exists** in the DB — no Prisma migration required.
- ✅ Monetary values are stored and returned as **integers** (no decimals).
- The current salary structure counts as revision #1 if no prior history rows exist — so the API
  never returns an empty `salaryHistory` array.
- Dates are returned in ISO 8601 format (`YYYY-MM-DD`).

**Dependencies**
- DB table confirmed present — implementation can start immediately.
- The UI story is blocked until this story ships (or at least has an agreed API contract).

**Edge Cases**
- Employee with no prior revisions → return an array with a single entry (the current structure).
- Very new employee where `effectiveFrom` is in the future → include in list, ordered normally.
- Null / missing monetary values → return `null`; the UI will handle display.

---

## API Contract (proposed)

```
GET /api/employees/:id
```

**New field in response:**

```jsonc
{
  "id": "emp_123",
  // ... existing fields ...
  "salaryHistory": [
    {
      "id": "rev_3",
      "effectiveFrom": "2024-01-01",   // ISO date string
      "baseSalaryMonthly": 2252910,    // integer, smallest currency unit (paise) OR decimal Rs
      "netPayMonthly": 247821,
      "ctcAnnual": 6218040,
      "isCurrent": true                // true only for the latest / active entry
    },
    {
      "id": "rev_2",
      "effectiveFrom": "2023-01-01",
      "baseSalaryMonthly": 2000000,
      "netPayMonthly": 220000,
      "ctcAnnual": 5500000,
      "isCurrent": false
    }
    // ... older entries last
  ]
}
```

> **Note:** Confirm whether monetary values are stored as paise (integers) or rupees (decimals).
> This contract uses integers as the safer default. The UI story will format for display.

---

## Acceptance Criteria

- [ ] Given a request to `GET /api/employees/:id`, when the employee has salary revision records,
      then the response includes a `salaryHistory` array ordered descending by `effectiveFrom`
      (newest first).
- [ ] Given a request to `GET /api/employees/:id`, when the employee has **no** revision records,
      then `salaryHistory` contains exactly **one** entry representing the current salary structure,
      with `isCurrent: true`.
- [ ] Each entry in `salaryHistory` contains: `id`, `effectiveFrom` (ISO date), `baseSalaryMonthly`,
      `netPayMonthly`, `ctcAnnual`, and `isCurrent` (boolean).
- [ ] Only the most recent entry has `isCurrent: true`; all others have `isCurrent: false`.
- [ ] The existing GET Employee response shape is **backward-compatible** — no previously existing
      fields are removed or renamed.
- [ ] API returns HTTP 200 with the new shape; no regression on existing endpoint tests.
- [ ] New/updated backend unit tests cover: multiple revisions, single-revision (no history),
      and correct ordering.

---

## Screenshots / Mockups

> Screenshot pending — place the image at `docs/assets/2026-06-30-salary-history-current-state.png`
> and update the links below.

- [2026-06-30-salary-history-current-state.png](../assets/2026-06-30-salary-history-current-state.png)

<details>
<summary>Preview: Current state of the Salary History tab (fallback view)</summary>

![Current state — Salary History tab shows fallback message and single current salary card](../assets/2026-06-30-salary-history-current-state.png)

</details>

---

## Open Questions

- [x] ~~Does a `salary_revisions` table exist?~~ **Confirmed: yes — no migration needed.**
- [x] ~~Monetary unit?~~ **Confirmed: integers.**
- [x] ~~Increment/delta field?~~ **Confirmed: not shown — fully out of scope.**
- [ ] What are the exact column names on the existing salary revisions table? (Needed to map to
      the API contract fields: `effectiveFrom`, `baseSalaryMonthly`, `netPayMonthly`, `ctcAnnual`.)
- [ ] Is there a business rule limiting how far back history goes (e.g., last N revisions only)?
- [ ] Who creates salary revision records — a separate HR workflow, or automatic on employee
      update? (Relevant for understanding test data availability.)

# Salary History UI — Stacked Revision Cards on Employee Detail

- **Date**: 2026-06-30
- **Status**: in-progress
- **Author**: BA Planner
- **Persona**: HR Manager
- **Depends on**: [2026-06-30-salary-history-api.md](./2026-06-30-salary-history-api.md)

---

## User Story

As an **HR Manager**, I want the Salary History tab on the Employee Detail page to show all past
salary revisions as stacked cards (newest at the top, older ones below) so that I can quickly
review an employee's complete compensation timeline in a single glance.

---

## Background / Context

The Salary History tab currently shows a fallback message —
_"No salary history records were provided. Showing the current salary structure instead."_ —
followed by a single card for the current salary. This gives no visibility into previous
compensation changes.

Once the API story ([2026-06-30-salary-history-api.md](./2026-06-30-salary-history-api.md)) ships
and `salaryHistory` is available on the GET Employee response, this UI story replaces the
fallback logic with a proper stacked-card list.

---

## Scope

### In Scope
- Replace the fallback message + single card with a vertically stacked list of salary revision
  cards, one card per entry in `salaryHistory`, newest first.
- Each card displays: **Effective From** date, **Base Salary (Monthly)**, **Net Pay (Monthly)**,
  **CTC (Annual)** — mirroring the current card layout.
- The latest / current entry is tagged with a **"Current" badge**.
- Fallback behaviour (no history available) remains: show the current salary structure as a single
  card with a "Current" badge (consistent with the single-entry API response).
- Preserve the existing OVERVIEW → SALARY STRUCTURE → SALARY HISTORY tab navigation.

### Out of Scope
- Editing or creating salary revisions from this view.
- Pagination / infinite scroll (assume ≤ 50 records).
- Exportable / printable history view.
- Increment percentage / delta column between revisions (deferred).
- Mobile / responsive layout changes beyond what is already supported.
- Changes to the Overview or Salary Structure tabs.

---

## Brainstorm Notes

**Persona & Problem**
HR Managers regularly need to audit compensation history during reviews, promotions, or
compliance checks. The current UI hides all historical context and forces users to rely on
external spreadsheets or manual lookups.

**Value**
A structured, at-a-glance history list reduces lookup time and removes the need for
out-of-system records.

**Assumptions / Confirmed Decisions**
- ✅ Monetary values are **integers** from the API; formatted for display using the existing
  locale/currency formatter.
- ✅ All cards look **identical** — the "Current" badge is the only visual distinction.
- ✅ Section heading is always **"Salary Revision History"** regardless of entry count.
- ✅ Increment/delta field is **not shown** — fully out of scope.
- The API will always return entries ordered newest-first; the frontend does **not** re-sort.
- The `isCurrent: true` flag from the API drives the "Current" badge (no date comparison in UI).
- The "Effective From" date is formatted as `DD MMM YYYY` (e.g., `01 Jan 2024`) to match the
  current card design shown in the screenshot.
- Design tokens (colours, border-radius, shadows) reused from the existing salary card component.

**Dependencies**
- [2026-06-30-salary-history-api.md](./2026-06-30-salary-history-api.md) must be completed (or
  at least the API contract agreed) before implementation begins.
- Existing `SalaryStructureCard` (or equivalent) component can be reused or extended with a
  `badge` prop.

**Edge Cases**
- **Single entry** (no prior revisions): show one card tagged "Current"; no fallback message.
- **Many entries (> 10)**: cards stack naturally; no pagination required for MVP.
- **API loading state**: show skeleton cards while the employee data loads.
- **API error**: show existing error/retry UI — no new error design required.
- **Future effective date on current entry**: display the date as-is; no special treatment.

---

## UI Behaviour

### Normal state (history exists)
```
┌─────────────────────────────────────────┐
│  Current salary structure      [Current]│  ← isCurrent: true, newest date
│  Effective From: 01 Jan 2024            │
│  Base Salary (Monthly):  Rs 22,52,910  │
│  Net Pay (Monthly):      Rs  2,47,821  │
│  CTC (Annual):           Rs 62,18,040  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Previous salary structure              │  ← isCurrent: false
│  Effective From: 01 Jan 2023            │
│  Base Salary (Monthly):  Rs 20,00,000  │
│  Net Pay (Monthly):      Rs  2,20,000  │
│  CTC (Annual):           Rs 55,00,000  │
└─────────────────────────────────────────┘
...
```

### Fallback / empty state (single-entry API response)
Render the single card with "Current" badge; **remove** the blue info-banner fallback message
once the API reliably returns at least one entry.

> If the API is not yet updated and still returns no `salaryHistory`, keep the existing fallback
> banner and current-structure card as-is until the API story ships.

---

## Acceptance Criteria

- [ ] Given the Salary History tab loads and the API returns `salaryHistory` with multiple entries,
      then each entry is rendered as a separate card, stacked vertically, newest entry at the top.
- [ ] Given the newest entry has `isCurrent: true`, then that card displays a **"Current" badge**
      (visually distinct — e.g., a small blue pill/tag).
- [ ] Given all other entries have `isCurrent: false`, then those cards display **no** badge.
- [ ] Each card displays: **Effective From** (formatted `DD MMM YYYY`), **Base Salary (Monthly)**,
      **Net Pay (Monthly)**, **CTC (Annual)** — all formatted with the existing Rs locale formatter.
- [ ] Given `salaryHistory` contains exactly one entry (no prior revisions), then one card is
      rendered with a "Current" badge and **no** fallback info-banner is shown.
- [ ] Given the employee data is loading, then skeleton placeholder card(s) are shown in the
      history list area.
- [ ] Given the API returns an error, then the existing error/retry UI is displayed (no regression).
- [ ] The OVERVIEW, SALARY STRUCTURE, and SALARY HISTORY tabs continue to function correctly with
      no visual regressions on the other two tabs.
- [ ] All new/modified components have corresponding unit and/or component tests.

---

## Screenshots / Mockups

> The screenshot below shows the **current state** (fallback view) that this story replaces.
> Place the image at `docs/assets/2026-06-30-salary-history-current-state.png`.

- [2026-06-30-salary-history-current-state.png](../assets/2026-06-30-salary-history-current-state.png)

<details>
<summary>Preview: Current state — Salary History tab fallback (to be replaced)</summary>

![Current state — Salary History tab shows "No salary history records were provided" banner and a single current salary card](../assets/2026-06-30-salary-history-current-state.png)

</details>

---

## Open Questions

- [x] ~~Older card visual treatment?~~ **Confirmed: identical cards, badge only.**
- [x] ~~Increment/delta field?~~ **Confirmed: not shown — out of scope.**
- [x] ~~Section heading when single entry?~~ **Confirmed: always "Salary Revision History".**
- [ ] Which icon/component library is used for badges in the existing UI? (Determines how to
      implement the "Current" pill — reuse existing badge component if available.)

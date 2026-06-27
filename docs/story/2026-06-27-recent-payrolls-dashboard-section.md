# Recent Payrolls Section on Dashboard

- **Date**: 2026-06-27
- **Status**: completed
- **Author**: BA Planner
- **Persona**: HR Manager

## User Story
As an HR Manager, I want to view the most recent payroll records directly on the dashboard so that I can quickly verify recent payouts and navigate to full payroll details when needed.

## Background / Context
The dashboard should include a Recent Payrolls section based on the provided visual reference. The section will use mock data for now, but the data contract should align with the expected API response shape because this data will come from the same summary-related API flow already used for dashboard mock calls.

## Scope
### In Scope
- Add a Recent Payrolls dashboard section concept with data presented from mock data aligned to expected backend response shape.
- Show exactly 5 most recent payroll records by default.
- Order records by newest payroll first.
- Include a View action for each row.
- Include a See all link in the section header as a non-routing placeholder for now.
- Define desktop-focused responsive behavior across different desktop screen sizes.
- Include loading, empty, and error states for the section.

### Out of Scope
- Backend API implementation or contract changes.
- Download payslip action in this story.
- Mobile-first layout requirements.
- Full payroll page behavior beyond the See all navigation intent.

## Brainstorm Notes
- Assumptions: Existing dashboard summary API layer can include a recent payrolls payload without requiring a separate endpoint for this story.
- Assumptions: Recent payroll item fields include payroll period, payout date, status, and amount in a format consistent with current dashboard summary usage patterns.
- Assumptions: View action routes to an existing or planned payroll detail context; if details page is not yet available, action can be a stubbed navigation target.
- Dependencies: Design alignment with the screenshot reference.
- Dependencies: Dashboard summary data orchestration that already supports mock API calls.
- Edge cases: Less than 5 records available should render only available rows.
- Edge cases: Empty state should communicate no recent payrolls available.
- Edge cases: Error state should communicate failure to load and provide retry affordance.
- Edge cases: Loading state should preserve layout stability to avoid UI jump.
- Edge cases: Long employee names or localized currency formats should not break row layout at common desktop widths.

## Acceptance Criteria
- [x] Given dashboard summary data includes recent payrolls, when the dashboard loads successfully, then the Recent Payrolls section renders with newest records first.
- [x] Updated during visual review: Given more than 7 payroll records are available, when the section renders, then exactly 7 rows are shown and a View all link is visible.
- [x] Updated label during visual review: Given a user clicks the View all link, when the action is triggered, then no navigation occurs and the current dashboard context remains unchanged.
- [x] Updated threshold during visual review: Given 7 or fewer payroll records are available, when the section renders, then all available rows are shown with no visual break in layout.
- [x] Given a user clicks a payroll row, when the action is triggered, then the user is taken to payroll detail context (configured route target).
- [x] Given the recent payrolls request is in progress, when the section loads, then a loading state is shown with stable layout dimensions.
- [x] Given no recent payroll data exists, when the section loads, then an empty state message is shown.
- [x] Given the data request fails, when the section loads, then an error state is shown with retry affordance.
- [x] Given desktop viewport widths vary, when resizing across common desktop breakpoints, then section readability and actions remain usable without content overlap.
- [x] Given mock data is used during development, when integrating the section, then mock payload shape matches expected API contract fields.

## Implementation Update (2026-06-27)
- Added Recent Payrolls section with mock API-backed data using recentPayrolls in dashboard response shape.
- Integrated section into dashboard state flow for success, loading, empty, and error scenarios.
- Render behavior finalized after visual review feedback:
	- Row count set to 7 visible payroll items.
	- Header action label set to View all with non-routing placeholder behavior.
	- Full-row action is used for payroll detail navigation (no explicit per-row View text).
	- Spacing, divider alignment, muted date styling, and column width tuned to match mockup.
- Desktop layout adjusted for better visual parity with screenshot by narrowing Recent Payrolls panel relative to Payroll Summary.

## Verification Summary
- Visual review completed with iterative feedback and final approval from stakeholder.
- Automated tests passed for component, page integration, hook, and API contract updates.
- Last relevant run: 34 passed tests across story-touched suites.

## Screenshots / Mockups
- [2026-06-27-home-page-dashboard.png](../assets/2026-06-27-home-page-dashboard.png)

<details>
<summary>Preview: Dashboard reference with Recent Payrolls section</summary>

![Dashboard reference with Recent Payrolls section](../assets/2026-06-27-home-page-dashboard.png)

</details>

## Open Questions
- None at this time.

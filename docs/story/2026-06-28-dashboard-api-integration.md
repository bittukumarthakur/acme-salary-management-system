# Dashboard API Integration

- **Date**: 2026-06-28
- **Status**: draft
- **Author**: BA Planner
- **Persona**: HR Manager

## User Story
As an HR Manager, I want the dashboard to load live payroll summary data from the available API so that I can view current payroll metrics instead of outdated hardcoded values.

## Background / Context
The current dashboard UI uses hardcoded data. A backend dashboard API is now available at `https://cmqv6pc4r0c33zyf5dxvpnp7o.sin.prisma.build/api/v1/dashboard` and can supply live summary data for the dashboard. The current response includes summary cards, recent payrolls, and metadata such as currency and generation timestamp. Based on the intake and follow-up decisions, this story will integrate summary cards only, retain the current UI card titles, leave recent payrolls hardcoded for now, and defer any generated timestamp display.

## Scope
### In Scope
- Replace hardcoded dashboard summary card values with data from the available dashboard API.
- Fetch dashboard data on page load.
- Show a loading state while the API request is in progress.
- Show an error state with retry behavior if the API request fails.
- Format monetary values using the API currency metadata (`INR`).
- Format dates using locale-friendly presentation where dates are displayed from this payload.
- Preserve the current UI structure while changing the data source for the summary area.
- Re-fetch only the summary section when the user retries after an API error.

### Out of Scope
- Reworking dashboard layout or visual design.
- Adding auto-refresh behavior.
- Adding manual filtering or sorting controls.
- Implementing navigation from recent payroll rows.
- Replacing hardcoded recent payroll list data with API data in this story if that data will come from a separate future API.
- Changing backend API contracts.

## Brainstorm Notes
- Assumptions: The dashboard page already renders the required cards and only needs its summary data source changed from static values to the provided API. The screen should fetch data once on initial load. The existing recent payrolls UI stays visible and continues using placeholder or hardcoded values until a dedicated API is available in a separate follow-up story. The API response shape shown in the intake is stable for the fields used in this story. Current dashboard card titles remain unchanged and are mapped to the incoming `labelKey` values internally.
- Dependencies: Availability and reliability of the dashboard endpoint; frontend support for loading, error, and retry states scoped to the summary section; future separate API and story for recent payroll records.
- Edge cases: API timeout or network failure; malformed or partial summary card payload; unexpected currency metadata; empty `summaryCards` array; very large currency values requiring correct formatting; stale hardcoded recent payroll content appearing alongside fresh summary values and causing user confusion.

## Acceptance Criteria
- [ ] Given the HR Manager opens the dashboard, when the page loads, then the summary card values are requested from the dashboard API endpoint.
- [ ] Given the dashboard API responds successfully, when the response contains summary card data, then the UI replaces hardcoded summary values with the API values.
- [ ] Given the dashboard API request is still in progress, when the summary section has not resolved yet, then the UI shows a loading state instead of final values.
- [ ] Given the dashboard API request fails, when the dashboard cannot load summary data, then the UI shows an error message and a retry action for the summary section.
- [ ] Given the dashboard API returns monetary values and currency metadata, when the values are displayed, then they are formatted as INR currency.
- [ ] Given recent payrolls are not in scope for API integration in this story, when the dashboard renders the recent payrolls section, then it continues to use the current hardcoded or placeholder data without blocking summary card integration.
- [ ] Given the API returns no usable summary card entries, when the dashboard renders, then the UI shows a defined empty or fallback state instead of broken values.

## Screenshots / Mockups
No screenshots were supplied for this story.

## Open Questions
No open questions remain from the current intake.

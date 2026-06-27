# Add Dashboard API Endpoint for Executive Payroll Overview

- **Date**: 2026-06-27
- **Status**: in-progress
- **Author**: BA Planner
- **Persona**: HR Manager

## User Story
As an HR Manager, I want a single dashboard API endpoint that returns payroll KPIs and recent payroll history so that I can quickly review payroll health and trends without navigating multiple reports.

## Background / Context
The frontend currently consumes a dashboard-shaped mock contract with summary cards, monthly payroll trend values, and recent payroll runs. This story defines a backend API that formalizes that contract for real data retrieval and supports country-aware currency behavior. The business value is faster payroll monitoring, consistent executive reporting, and a stable integration point for dashboard UI delivery.

## Scope
### In Scope
- Define and deliver one aggregate endpoint: GET /api/v1/dashboard.
- Return dashboard sections in one response payload:
  - summaryCards (with labelKey enum)
  - recentPayrolls (with status enum)
  - meta (with appliedCountry and currency enums)
- Support a query parameter for country code to influence currency context.
- Perform currency conversion in backend as the single source of truth.
- Return authoritative converted numeric values from backend.
- Return conversion metadata in the API response, including conversion rate and conversion timestamp.
- Include country in the response payload for consumer context.
- Support recent payroll record limiting via query param, with default limit = 10.
- Source response data from a database-backed implementation.
- Keep endpoint publicly accessible for this story.

### Out of Scope
- Frontend layout, responsive behavior, or visual changes.
- Authentication/authorization hardening or role-based access controls.
- Historical exports (CSV/PDF) or drill-down analytics endpoints.
- Dashboard write operations, payroll processing workflows, or data mutation.
- Caching strategy and performance tuning beyond baseline functional behavior.

## Brainstorm Notes
- Assumptions:
  - The existing frontend contract shape is the baseline for object structure and section names.
  - Monetary fields are emitted as backend-converted numeric values, and UI handles display formatting only.
  - Conversion metadata includes both exchange rate and timestamp for auditability.
  - Country code is optional; when absent, backend applies a default country.
  - Default recent payroll limit is 10 when query param is omitted.
- Dependencies:
  - Reliable payroll and employee aggregates available in the primary datastore.
  - Mapping logic to transform persistence models into stable dashboard DTOs.
  - Agreement on country code format (for example ISO 3166-1 alpha-2).
  - Currency conversion rate provider or conversion table available to backend.
- Edge cases:
  - Unknown/unsupported country code should return a clear validation error.
  - limit values that are invalid (negative, zero, non-numeric, or too large).
  - Empty-state behavior when no payroll records exist.
  - Partial data availability (for example payroll history exists but summary cards are incomplete).
  - Month-series continuity when data is missing for one or more months.

## Acceptance Criteria
- [x] Given a valid request to GET /api/v1/dashboard, when no query params are provided, then the API returns 200 with summaryCards, recentPayrolls, meta (with appliedCountry, currency, conversion), and recentPayrolls defaults to 10 records.
- [x] Given a valid country query parameter, when the endpoint is requested, then the API returns 200 and includes the requested country as appliedCountry (CountryCode enum) in meta.
- [x] Given monetary metrics in the dashboard payload, when the response is returned, then all amount fields are backend-converted authoritative numeric values and not preformatted currency strings.
- [x] Given a successful dashboard response, when conversion is applied, then the payload includes conversion metadata in meta containing rate and convertedAt timestamp, with currency as CurrencyCode enum.
- [ ] Given dashboard data rendered in UI, when values are shown to users, then UI does not compute conversion and only renders backend-provided values with clear currency/country labeling.
- [x] Given a valid limit query parameter, when the endpoint is requested, then recentPayrolls returns at most the requested number of latest records.
- [x] Given an invalid country query parameter, when the endpoint is requested, then the API returns a 4xx validation response with actionable error details.
- [x] Given an invalid limit query parameter, when the endpoint is requested, then the API returns a 4xx validation response with actionable error details.
- [x] Given no underlying payroll data, when the endpoint is requested, then the API returns 200 with empty collections and safe defaults rather than server failure.

## Implementation Update (2026-06-28)
- Backend implementation is complete for this story scope.
- `GET /api/v1/dashboard` is live in backend route registration and backed by Prisma payroll data.
- Validation for `countryCode` and `limit` is implemented in route layer.
- Currency conversion and conversion metadata are emitted by backend service.
- Backend verification is green: 6/6 suites, 71/71 tests passed.
- Frontend integration to this real endpoint is still pending; frontend currently uses a mock dashboard service.

## Screenshots / Mockups
- No screenshots were provided for this story.

## Open Questions
- Resolved: query parameter is `countryCode`.
- Resolved: maximum allowed `limit` is 100 (`MAX_LIMIT`).
- Resolved: unsupported countries return `400` validation errors.
- Resolved: response includes country (`meta.appliedCountry`) and currency (`meta.currency`).
- Resolved: `meta.conversion.convertedAt` uses backend response generation time.
- Resolved: recent payroll ordering is `payoutDate DESC`, then `id DESC` for tie-breaking.

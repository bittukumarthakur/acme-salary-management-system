# Backend Employees API v1 - List Endpoint

- **Date**: 2026-06-28
- **Status**: draft
- **Author**: BA Planner
- **Persona**: Platform/API Engineer

## User Story
As a Platform/API Engineer, I want to implement `GET /api/v1/employees` with the agreed response contract so that the Employees tab frontend can integrate without contract rework and ship reliably.

## Background / Context
A frontend story for Employees tab list view already defines the contract shape expected by the UI. This backend story formalizes implementation scope for the same endpoint and payload structure, including pagination, filters, targetCurrencyCode-based salary conversion metadata, and standardized validation/error handling.

## Scope
### In Scope
- Implement `GET /api/v1/employees` contract-compatible list API.
- Support query params: `search`, `department`, `status`, `targetCurrencyCode`, `page`, `pageLimit`.
- Enforce pagination defaults: `page=1`, `pageLimit=10`.
- Return employee list payload with `meta` and `filters.applied` structure matching frontend contract.
- Return converted salary values based on requested `targetCurrencyCode`.
- Include `meta.currency` and `meta.conversion` details in response.
- Validate query params and return standardized error payload for invalid requests.
- Include basic observability (request/latency/error logs or equivalent baseline metrics).
- Include index/performance consideration for list/search/filter use case.

### Out of Scope
- Authentication/authorization implementation for this story.
- Employee create/update/delete endpoints.
- Row action backend behaviors (Edit/View workflows).
- Advanced caching strategy.
- Full SLO/performance benchmarking program.

## Brainstorm Notes
- Assumptions:
  - Contract parity with frontend story is mandatory; response shape should not diverge.
  - Salary values are converted by backend before response is returned.
  - `targetCurrencyCode` input controls conversion context and output currency metadata.
  - Since auth is out of scope, endpoint can be delivered in an internal/protected environment first.
- Dependencies:
  - Employee data source with fields required by contract.
  - Currency conversion source/service or deterministic conversion strategy.
  - Department and status canonical values.
  - Logging/metrics pipeline available for baseline observability.
- Edge cases:
  - Empty result set with valid filters should still return `200` with empty `data` and consistent `meta`.
  - Unsupported `targetCurrencyCode` or malformed pagination should return validation errors.
  - Very large page/pageLimit combinations should be constrained to safe bounds.
  - Missing avatar should not break payload rendering expectations.

## API Response Contract (Attached to Story Card)
### Endpoint
- **Method**: GET
- **Path**: `/api/v1/employees`

### Query Parameters
- `search` (string, optional): Search by name, email, or employeeId.
- `department` (string, optional): Department filter enum value (`ENGINEERING`, `MARKETING`, `FINANCE`, `HR`, `SALES`).
- `status` (string, optional): Employment status filter enum value (`ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`).
- `targetCurrencyCode` (string, optional): Target currency code used by backend to return converted salary values.
- `page` (number, optional, default: `1`): 1-based page index.
- `pageLimit` (number, optional, default: `10`): Page size.

### Enum Definitions
- `department`: `ENGINEERING`, `MARKETING`, `FINANCE`, `HR`, `SALES`
- `designation`: `SENIOR_DEVELOPER`, `MARKETING_MANAGER`, `ACCOUNTANT`, `HR_EXECUTIVE`, `UI_UX_DESIGNER`, `SALES_EXECUTIVE`
- `status`: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`

### Success Response (200)
```json
{
  "data": [
    {
      "employeeId": "EMP001",
      "fullName": "John Doe",
      "email": "john.doe@email.com",
      "department": "ENGINEERING",
      "designation": "SENIOR_DEVELOPER",
      "basicSalary": 60000,
      "currency": "INR",
      "status": "ACTIVE",
      "avatarUrl": "https://example.com/avatars/emp001.png"
    }
  ],
  "meta": {
    "page": 1,
    "pageLimit": 10,
    "totalRecords": 120,
    "totalPages": 12,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "currency": "INR",
    "targetCurrency": "INR",
    "conversion": {
      "rate": 1,
      "convertedAt": "2026-06-28T06:16:21.694Z"
    }
  },
  "filters": {
    "applied": {
      "search": "",
      "department": "",
      "status": ""
    }
  }
}
```

### Error Responses
- `400 Bad Request`: Invalid query parameter values (e.g., negative page/pageLimit, unsupported targetCurrencyCode).
- `500 Internal Server Error`: Unexpected server failure.
- `401 Unauthorized` and `403 Forbidden`: Reserved for future auth-enabled implementation.

### Contract Notes
- Salary is numeric in API and formatted by UI.
- Salary value is already converted by backend for requested `targetCurrencyCode`.
- `meta.currency` represents display currency for returned salary values.
- `meta.targetCurrency` represents requested target currency for conversion output.
- `meta.conversion` captures conversion rate and conversion timestamp.
- Department, designation, and status are returned as canonical enum codes.
- UI maps enum codes to human-readable labels (and localization where needed).
- Enum-backed fields should be implemented in Prisma schema enums (for example, `EmployeeStatus`, `Department`) and exposed as enum codes in API responses.
- If `designation` is expected to change often, model it as String/lookup-backed in Prisma rather than a strict enum.

## Acceptance Criteria
- [ ] Given a valid request with no query params, when `GET /api/v1/employees` is called, then backend returns `200` with default pagination (`page=1`, `pageLimit=10`) and contract-compliant payload shape.
- [ ] Given valid `search`, `department`, and `status` filters, when request is processed, then response `data` reflects filtered records and `filters.applied` echoes the applied values.
- [ ] Given a valid `targetCurrencyCode`, when request is processed, then salary values are returned in converted form and `meta.currency`, `meta.targetCurrency`, plus `meta.conversion` are present.
- [ ] Given invalid query values (for `page`, `pageLimit`, `status`, or `targetCurrencyCode`), when request is processed, then backend returns `400` with standardized error payload.
- [ ] Given no records match filters, when request is processed, then backend returns `200` with empty `data` and consistent `meta`.
- [ ] Given endpoint execution, when request completes, then baseline observability data (request/error/latency) is emitted.
- [ ] Given expected list/search/filter access patterns, when data retrieval is designed, then index/performance considerations are documented and applied for primary query paths.

## Screenshots / Mockups
- No backend-specific screenshot provided for this story.

## Open Questions
- Should `targetCurrencyCode` be optional with a deterministic default, or required for every request?
- What is the canonical standardized error schema for `400` and `500` responses in this service?
- What upper bound should be enforced for `pageLimit` to protect performance?
- For auth being out of scope now, should `401/403` be omitted from public API docs until auth is implemented?

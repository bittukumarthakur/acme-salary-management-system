# Update Employee Details API

- **Date**: 2026-06-29
- **Status**: draft
- **Author**: BA Planner
- **Persona**: HR Manager

## User Story

As an HR Manager, I want a backend API endpoint to update an existing employee's basic information and salary structure so that employee records remain accurate and salary changes are tracked with an effective date.

## Background / Context

The frontend "Edit Employee" page (see screenshot below) allows HR Admins to modify an employee's profile — covering personal details, employment metadata, and a new salary revision. The backend must expose a `PUT /api/employees/:id` endpoint that accepts the full editable payload, persists the changes, and returns the updated employee record. Salary changes must be stored as a new salary history entry (not overwriting the previous record) to preserve an audit trail.

## Scope

### In Scope

- `PUT /api/v1/employees/:id` REST endpoint
- Updating all **Basic Information** fields: `fullName`, `email`, `phone`, `department`, `designation`, `employmentType`, `status`, `joiningDate`, `country`, `currency`, `bankAccount`
- Accepting a **salary revision** sub-object: `baseMonthlySalary` + `effectiveFrom` (always required — both sections must be sent together)
- Creating a new **salary history** record when salary fields change; no update if salary fields are unchanged
- Input validation (required fields, format checks, enum values)
- Returning the updated employee domain model in the response
- Appropriate HTTP status codes: `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict`

### Out of Scope

- Profile photo upload (separate endpoint / multipart form)
- `employeeId` (e.g. `EMP0001`) — this is system-generated and read-only; must be rejected if included in the request body
- Salary component breakdown calculation logic (derived server-side from `baseMonthlySalary`; not accepted as input)
- Role-based access control / authorization (separate story)
- Soft-delete / deactivation-only workflow (handled via the `status` field update in this story)

## Brainstorm Notes

### Assumptions

- `PUT` semantics: the client sends all editable fields; partial updates (`PATCH`) are out of scope for this story.
- The `employeeId` field is immutable after creation and is identified via the URL path parameter `:id`, not from the request body.
- The `salary` object is always required — the frontend sends both basic information and salary together in every update request.
- Salary history is append-only: if `baseMonthlySalary` or `effectiveFrom` differs from the current active record, a new salary history entry is inserted.
- Salary components (Basic Salary, DA, HRA, Conveyance Allowance, PF, Professional Tax, TDS) are **computed server-side** by calling the existing salary calculation API/service — they are not accepted as request inputs.
- `effectiveFrom` for a salary revision must not be earlier than the employee's `joiningDate`.
- `department` and `designation` are FK references to lookup/master tables; values are validated by ID against those tables.
- `bankAccount` is a FK reference to a separate `BankAccount` table; the value is validated to exist.
- `employmentType` accepted values: `FULL_TIME`, `PART_TIME`, `CONTRACT`.
- `status` accepted values: `ACTIVE`, `INACTIVE`, `ON_LEAVE`.
- `currency` accepted values: ISO 4217 codes (e.g. `INR`, `USD`).
- No optimistic locking is required for this story.

### Dependencies

- Existing `Employee`, `SalaryHistory`, `Department`, `Designation`, and `BankAccount` Prisma models (or equivalent DB schema).
- Domain mapper (`toEmployee()`) at the service boundary — no ORM types leaked to the API layer.
- Existing salary calculation API/service — component breakdown is delegated to it; not re-implemented in this story.

### Edge Cases

- Request with `employeeId` in the body → `400 Bad Request` with clear message.
- `effectiveFrom` earlier than `joiningDate` → `400 Bad Request`.
- Employee not found by `:id` → `404 Not Found`.
- Duplicate `effectiveFrom` for a new salary entry that already exists → `409 Conflict`.
- No salary fields changed → skip salary history insert, update basic info only.
- Invalid enum values for `department`, `employmentType`, `status`, `currency` → `400 Bad Request`.
- `email` already in use by a different employee → `409 Conflict`.

## Request / Response Contract

### Endpoint

```
PUT /api/v1/employees/:id
Content-Type: application/json
```

### Request Body

```json
{
  "fullName": "John Doe",
  "email": "john.doe@acme.com",
  "phone": "+91 98765 43210",
  "department": "Engineering",
  "designation": "Senior Developer",
  "employmentType": "FULL_TIME",
  "status": "ACTIVE",
  "joiningDate": "2022-01-15",
  "country": "India",
  "currency": "INR",
  "bankAccount": "ACC-000123",
  "salary": {
    "baseMonthlySalary": 60000,
    "effectiveFrom": "2024-04-01"
  }
}
```

> **Note:** `salary` is **required**. Both `basicInformation` fields and the `salary` sub-object must always be sent together.

### Success Response — `200 OK`

```json
{
  "id": "EMP0001",
  "fullName": "John Doe",
  "email": "john.doe@acme.com",
  "phone": "+91 98765 43210",
  "department": "Engineering",
  "designation": "Senior Developer",
  "employmentType": "FULL_TIME",
  "status": "ACTIVE",
  "joiningDate": "2022-01-15",
  "country": "India",
  "currency": "INR",
  "bankAccount": "ACC-000123",
  "salary": {
    "baseMonthlySalary": 60000,
    "effectiveFrom": "2024-04-01",
    "ctcAnnual": 1063200,
    "netPayMonthly": 71650,
    "totalEarnings": 88600,
    "totalDeductions": 16950,
    "components": {
      "earnings": [
        { "name": "Basic Salary", "amount": 60000 },
        { "name": "DA (Dearness Allowance)", "amount": 12000 },
        { "name": "HRA (House Rent Allowance)", "amount": 15000 },
        { "name": "Conveyance Allowance", "amount": 1600 }
      ],
      "deductions": [
        { "name": "Provident Fund (Employee)", "amount": 7200 },
        { "name": "Professional Tax", "amount": 200 },
        { "name": "Income Tax (TDS)", "amount": 9550 }
      ]
    }
  },
  "updatedAt": "2026-06-29T10:00:00.000Z"
}
```

### Error Responses

| Status | Scenario | Example `message` |
|--------|----------|-------------------|
| `400`  | Validation failure | `"joiningDate must be a valid ISO date"` |
| `400`  | `employeeId` in body | `"employeeId is read-only and cannot be updated"` |
| `400`  | `effectiveFrom` before `joiningDate` | `"effectiveFrom cannot be earlier than joiningDate"` |
| `404`  | Employee not found | `"Employee EMP9999 not found"` |
| `409`  | Email already taken | `"Email already in use by another employee"` |
| `409`  | Duplicate salary effective date | `"A salary record with effectiveFrom 2024-04-01 already exists"` |

## Acceptance Criteria

- [ ] Given a valid payload, when `PUT /api/v1/employees/:id` is called, then all basic information fields are persisted and the updated employee object is returned with `200 OK`.
- [ ] Given a valid payload with a new `salary.baseMonthlySalary` or `salary.effectiveFrom`, when the endpoint is called, then a new salary history entry is created and the response includes the computed salary breakdown.
- [ ] Given a payload where `salary` fields are identical to the current active record, when the endpoint is called, then no new salary history entry is created (idempotent salary update).
- [ ] Given a payload containing `employeeId`, when the endpoint is called, then a `400 Bad Request` is returned with message `"employeeId is read-only and cannot be updated"`.
- [ ] Given an unknown employee `:id`, when the endpoint is called, then `404 Not Found` is returned.
- [ ] Given `salary.effectiveFrom` earlier than the employee's `joiningDate`, when the endpoint is called, then `400 Bad Request` is returned.
- [ ] Given an `email` already used by a different employee, when the endpoint is called, then `409 Conflict` is returned.
- [ ] Given an invalid enum value for `employmentType`, `status`, or `currency`, when the endpoint is called, then `400 Bad Request` is returned with a descriptive message.
- [ ] The endpoint must not expose any Prisma/ORM types; the response shape matches the domain model.

## Screenshots / Mockups

- [2026-06-29-edit-employee-page.png](../assets/2026-06-29-edit-employee-page.png)

<details>
<summary>Preview: Edit Employee page — all editable fields visible</summary>

![Edit Employee page showing Basic Information and Salary Structure sections](../assets/2026-06-29-edit-employee-page.png)

</details>

## Open Questions

_All open questions resolved as of 2026-06-29._

| Question | Resolution |
|----------|------------|
| Salary object required or optional? | **Always required** — frontend always sends both sections together. |
| `PUT` vs `PATCH`? | **`PUT`** — full replacement of all editable fields. |
| Salary component calculation rules? | **Delegated to existing API** — server calls the existing salary calculation service; no fixed config or per-employee rules needed in this story. |
| `bankAccount` field type? | **FK reference** to a separate `BankAccount` table. |
| `department` and `designation` field type? | **FK references** to lookup/master tables. |
| Optimistic locking needed? | **No** — not required for this story. |

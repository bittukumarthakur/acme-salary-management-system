# View Employee Page

- **Date**: 2026-06-29
- **Status**: draft
- **Author**: BA Planner
- **Persona**: HR Manager

## User Story

As an HR Manager, I want to view detailed employee information (profile, job details, salary structure, and history) so that I can quickly access complete employee records for management and compliance purposes.

## Background / Context

The View Employee page is a detailed employee record interface that displays comprehensive information including personal details, job information, salary structure (monthly earnings and deductions), and salary history. The backend API is ready, and the page design is finalized. The UI needs to be wired to fetch and display data from the `/v1/employee/:id` endpoint, making it ready for production use.

## Scope

### In Scope

- View Employee page with full employee profile display matching the provided design.
- Display employee profile card with avatar, name, employee ID, status badge, and quick contact info.
- Display quick-info cards (Department, Designation, Employment Type, Country, Currency, Bank Account).
- **Overview tab** (default active):
  - Personal Information section (Full Name, Employee ID, Email, Phone, Joining Date, Country, Employment Type, Status, Avatar URL).
  - Job Information section (Department, Designation, Reporting Manager, Work Location).
  - Salary Structure breakdown (Monthly earnings and deductions with totals).
  - Net Pay card (monthly, annual, base salary monthly, effective from date).
- **Salary Structure tab**: Display salary structure details and breakdowns for selected periods.
- **Salary History tab**: Display historical salary records and changes.
- Breadcrumb navigation (Employees > View Employee).
- Edit Employee button (stub/placeholder; no navigation wired in this story).
- Responsive behavior for desktop and tablet viewports.
- Error handling for API failures and missing data with graceful fallbacks.

### Out of Scope

- Edit Employee workflow or form implementation.
- Download/Print/Export actions.
- Role-based permission/access control.
- Mobile-specific layout optimization.
- Backend API implementation.
- Salary change workflows or approval processes.

## Brainstorm Notes

- Assumptions:
  - Backend endpoint `GET /v1/employee/:id` returns all required details (personal info, job info, salary structure, salary history).
  - All amounts are currency-formatted and provided by backend with appropriate locale/currency codes.
  - Salary Structure tab will display data from the API; no additional filtering or parameter passing required in this story.
  - Salary History tab will display data from the API; no sorting/filtering in this story.
  - Edit Employee button remains a placeholder stub for now; no navigation is wired.
  - No permission checks are enforced; all authenticated users can view any employee profile.
  - Missing optional fields (e.g., Avatar URL, Reporting Manager) should fall back to safe UI defaults (placeholder avatar, "—" for empty fields).

- Dependencies:
  - Backend endpoint availability: `GET /v1/employee/:id`.
  - Consistent data shape from backend (personal info, job info, salary structure, salary history).
  - Shared enum definitions for Department, Designation, Status, Employment Type.
  - Currency formatting and locale-aware number display.

- Edge cases:
  - Employee record not found (404) → display a friendly error page with option to return to Employees list.
  - API/network errors → show error banner with retry option; preserve UI shell and avoid full page crash.
  - Missing optional fields → fall back to placeholder values without breaking layout.
  - Very long names, addresses, or other text → truncate or wrap gracefully to maintain layout integrity.
  - Salary values with multiple decimal places → format to 2 decimal places or backend-specified precision.
  - Switching between tabs with slow network → show skeleton loader or disable tabs during loading.

## API Response Contract

### Endpoint

- **Method**: GET
- **Path**: `/v1/employee/:id`

### Success Response (200)

```json
{
  "summary": {
    "fullName": "Aniya Roob",
    "status": "ACTIVE",
    "employeeId": "EMP00001",
    "email": "aniya.roob.1@acme.com",
    "phone": "+91-1749252918",
    "joinedOn": "08 Apr 2017",
    "department": "MARKETING",
    "designation": "ACCOUNTANT",
    "employmentType": "PERMANENT",
    "country": "India",
    "currency": "INR",
    "bankAccount": "0785574171063787"
  },
  "overview": {
    "personalInformation": {
      "fullName": "Aniya Roob",
      "employeeId": "EMP00001",
      "email": "aniya.roob.1@acme.com",
      "phone": "+91-1749252918",
      "joiningDate": "08 Apr 2017",
      "country": "India",
      "employmentType": "PERMANENT",
      "status": "ACTIVE",
      "avatarUrl": "https://i.pravatar.cc/150?img=1"
    },
    "jobInformation": {
      "department": "MARKETING",
      "designation": "ACCOUNTANT",
      "reportingManager": null,
      "workLocation": "India"
    }
  },
  "salaryStructure": {
    "currency": "INR",
    "earnings": [
      {
        "component": "DA",
        "amount": 143891
      },
      {
        "component": "HRA",
        "amount": 269795
      }
    ],
    "deductions": [
      {
        "component": "PF",
        "amount": 215836
      }
    ],
    "totalEarnings": 413686,
    "totalDeductions": 215836,
    "netPayMonthly": 197850,
    "ctcAnnual": 4964232,
    "baseSalaryMonthly": 1798635,
    "effectiveFrom": "01 Jan 2024"
  }
}
```

### Error Responses

- `400 Bad Request`: Invalid employee ID format.
- `401 Unauthorized`: Authentication missing/invalid.
- `403 Forbidden`: User lacks permission to view this employee (if permission checks are added in future).
- `404 Not Found`: Employee record not found.
- `500 Internal Server Error`: Unexpected server failure.

## Acceptance Criteria

- [ ] Given an HR Manager navigates to an employee's view page, when the page loads, then the employee profile card is displayed with name, profile picture, status badge, employee ID, and quick contact info.
- [ ] Given the page is loaded, when the Overview tab is active (default), then Personal Information and Job Information sections are displayed with all applicable fields correctly populated from the API.
- [ ] Given the page is loaded, when the Overview tab is active, then the Salary Structure (Monthly) section displays earnings breakdown, deductions breakdown, totals, and Net Pay summary card.
- [ ] Given the user clicks the Salary Structure tab, when the tab is active, then detailed salary structure data is fetched and displayed from the API.
- [ ] Given the user clicks the Salary History tab, when the tab is active, then historical salary records are fetched and displayed from the API.
- [ ] Given the user clicks the Edit Employee button, when the button is clicked, then a placeholder/stub state is shown (e.g., toast notification or disabled state), and no navigation is executed.
- [ ] Given breadcrumbs are shown, when the user clicks the Employees breadcrumb, then navigation returns to the Employees list page.
- [ ] Given an optional field is missing (e.g., Avatar URL, Reporting Manager), when the field is rendered, then a safe fallback value is shown (e.g., placeholder avatar, "—" for empty fields).
- [ ] Given an API error occurs (404, 500, network failure), when the error is received, then an error message is displayed with an option to retry or return to the Employees list without crashing the page.
- [ ] Given desktop and tablet viewports, when the page is rendered, then layout remains usable and visually aligned with the provided mockup.

## Screenshots / Mockups

- [2026-06-29-view-employee-page.png](../assets/2026-06-29-view-employee-page.png)

<details>
<summary>Preview: View Employee page with profile, tabs, and salary structure details</summary>

![View Employee page with profile, tabs, and salary structure details](../assets/2026-06-29-view-employee-page.png)

</details>

## Open Questions / Assumptions

- **Confirmed**: Edit Employee button is a stub with no navigation wired in this story.
- **Confirmed**: Salary Structure and Salary History tabs display fully functional data from the API.
- **Confirmed**: Backend endpoint `GET /v1/employee/:id` returns all employee details in a single response.
- **Confirmed**: No permission checks; all authenticated users can view any employee profile.
- **Confirmed**: Desktop and tablet responsive layout required; mobile is out of scope.
- **Confirmed**: No additional row actions (Download, Print, Export) in this story.

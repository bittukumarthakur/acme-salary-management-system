# Add Employee From Employees Tab

- **Date**: 2026-06-28
- **Status**: completed
- **Author**: BA Planner
- **Persona**: HR Manager

## User Story

As an HR Manager, I want to add a new employee from the Employees tab so that I can onboard staff into the salary management system and continue into that employee's details after saving.

## Background / Context

The Employees area needs a clear entry point for creating employee records. From the Employee tab, the user should be able to click the Add Employee action, open a dedicated form, capture personal, work, and salary information, and save a complete employee record. The provided mockup establishes the expected form structure, field grouping, and primary actions.

## Scope

### In Scope

- Entry to the Add Employee screen from the Employees tab via the Add Employee action.
- Display of the Add Employee page with breadcrumb navigation and grouped sections for Personal Information, Work Information, and Salary Information.
- Capture of employee details using text, date, dropdown, and toggle inputs.
- Validation of required fields, field formats, and core business rules before saving.
- Validation that employee ID is unique before record creation.
- Save Employee action that creates the employee and opens that employee's details view.
- Cancel action that returns the user to the Employee List without saving.
- Desktop and tablet behavior for the form layout.

### Out of Scope

- Editing an existing employee from this screen.
- Defining backend implementation, database schema, or API contracts.
- Bulk employee import or employee creation from external systems.
- Mobile-specific layout behavior.
- Advanced manager lookup or directory search behavior beyond plain string input.
- Defining the source system behind dropdown options beyond their presence as selectable fields.

## Brainstorm Notes

- Assumptions: The Add Employee action is available from within the Employees tab navigation flow. Reporting Manager is a free-text input for now rather than a searchable user picker. Department, gender, marital status, and employment type are selectable fields with available options presented to the user, but option sourcing is not defined in this story. The saved employee can be shown in a details page immediately after creation.
- Dependencies: Employee list view exposes an Add Employee action. A details page or equivalent post-save destination exists for newly created employees. The system supports uniqueness validation for employee ID. The system can persist salary-related attributes including toggles for PF and ESI applicability.
- Edge cases: User opens the form and cancels without changes. User enters partial data and attempts to save. User enters an invalid email or phone number. User enters non-numeric salary, allowance, bonus, or deduction values. User selects an invalid or future-incompatible date combination. User enters a duplicate employee ID. Optional salary fields are left blank. PF and ESI toggles are switched independently. Form needs to remain usable on tablet width without losing action visibility.

## Acceptance Criteria

- [ ] Given the user is in the Employees tab, when they click Add Employee, then the system opens the Add Employee page.
- [ ] Given the Add Employee page loads, when the form is displayed, then the user sees breadcrumb navigation and the three sections Personal Information, Work Information, and Salary Information.
- [ ] Given the form is displayed, when the user reviews the fields, then the page includes inputs for full name, email, phone number, date of birth, gender, marital status, employee ID, department, designation, joining date, reporting manager, employment type, basic salary, allowances, bonus, deduction, PF applicable, and ESI applicable.
- [ ] Given the user attempts to save with required fields missing, when they submit the form, then the system blocks submission and highlights the missing required fields with clear validation feedback.
- [ ] Given the user enters invalid field values, when they submit the form, then the system blocks submission and shows validation feedback for invalid email format, invalid phone format, invalid dates, and invalid numeric salary-related values.
- [ ] Given the user enters an employee ID that already exists, when they submit the form, then the system prevents creation and informs the user that the employee ID must be unique.
- [ ] Given the user completes the form with valid values, when they click Save Employee, then the system creates the employee record successfully.
- [ ] Given the employee record is created successfully, when save completes, then the system opens the details view for that newly created employee.
- [ ] Given the user clicks Cancel, when no save is performed, then the system returns the user to the Employee List without creating an employee.
- [ ] Given the page is viewed on desktop or tablet, when the layout adapts to available width, then the form sections and primary actions remain readable, usable, and visually consistent with the provided mockup.

## Screenshots / Mockups

- [2026-06-28-add-employee.png](../assets/2026-06-28-add-employee.png)

<details>
<summary>Preview: Add Employee form showing grouped personal, work, and salary sections from the Employees tab</summary>

![Add Employee form showing grouped personal, work, and salary sections from the Employees tab](../assets/2026-06-28-add-employee.png)

</details>

## Open Questions / Assumptions

- Assumption: Reporting Manager remains a plain text input in this story and is not a searchable employee selector.
- Assumption: Department, gender, marital status, and employment type are presented as selectable fields, but the authoritative source and option management are deferred.
- Assumption: Duplicate validation is required for employee ID only; duplicate checks for email or phone are not part of this story unless later specified.
- Open question: Should the post-save employee details page open in view mode only, or should it land in an editable state?
- Open question: Should Cancel warn the user when unsaved changes exist, or is immediate navigation back to Employee List acceptable for this first version?

## Status Updates

- 2026-06-28: Created (draft)
- 2026-06-28: Implemented Add Employee page UI flow with validation and routing (completed)

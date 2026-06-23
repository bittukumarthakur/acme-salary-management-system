# ACME Salary Management System - Requirements Document

## Overview

ACME currently manages employee compensation data for approximately 10,000 employees across multiple countries using spreadsheets. This process is time-consuming, error-prone, and makes it difficult to maintain accurate records and gain visibility into compensation trends.

The goal of this project is to build a web-based Salary Management System that enables HR Managers to manage employee salary information, track compensation changes, and analyze compensation data across the organization.

---

## Target User

**Primary User:** HR Manager

The HR Manager should be able to:

* View and manage employee salary records.
* Update compensation details.
* Track salary revision history.
* Analyze compensation data across departments and countries.

---

## Goals

* Replace spreadsheet-based salary management with a centralized system.
* Support salary management for 10,000 employees.
* Provide visibility into compensation data through dashboards and analytics.
* Maintain a historical audit trail of salary changes.

---

## Functional Scope

### 1. Employee Management

HR can:

* View employee directory.
* Search employees by name or employee ID.
* Filter employees by:

    * Country
    * Department
    * Designation
    * Employment Type
* View employee details.

### 2. Salary Management

HR can:

* View employee compensation details.
* Update salary information.
* Modify bonus and allowance values.
* Record salary changes with effective dates.

### 3. Salary Revision History

HR can:

* View historical salary changes.
* See previous and current compensation values.
* Track change reasons and effective dates.
* Maintain an audit trail for compensation updates.

### 4. Compensation Analytics Dashboard

The system should provide:

* Total employee count.
* Total payroll cost.
* Average salary.
* Payroll distribution by country.
* Employee distribution by department.
* Average compensation by department.
* Recent salary revision activity.

---

## Non-Functional Requirements

* Support 10,000 seeded employee records.
* Responsive web interface.
* Fast search and filtering experience.
* Maintainable and testable codebase.
* Automated unit tests for core business logic.
* Deployed and accessible application.
* Frontend and backend run as separate services on separate ports within a single repository.

---

## Data Model (High Level)

### Employee

* Employee ID
* Name
* Email
* Country
* Department
* Designation
* Employment Type
* Joining Date
* Status

### Salary

* Currency
* Base Salary
* Bonus
* Allowance
* Gross Salary
* Net Salary
* Effective Date

### Salary Revision

* Previous Salary
* New Salary
* Change Reason
* Effective Date
* Updated By

---

## Out of Scope

The following capabilities are intentionally excluded from the MVP:

* Payroll processing
* Tax calculations
* Payslip generation
* Attendance tracking
* Leave management
* Bank transfer integrations
* Employee self-service portal
* Recruitment and onboarding workflows
* Complex role-based access control
* Separate repositories for backend and frontend
* Full microservice decomposition beyond frontend/backend service separation

### Rationale

The objective of this project is to provide a centralized system for managing employee compensation data and tracking salary changes. Payroll, taxation, attendance, and broader HRMS functionality significantly increase complexity and are outside the scope of this MVP. For MVP delivery, frontend and backend will run as separate services on separate ports while staying in a single shared repository.

---

## Success Criteria

The solution will be considered successful if an HR Manager can:

1. Manage compensation data for 10,000 employees.
2. Track salary changes over time.
3. Understand payroll trends through dashboards and reports.
4. Search and filter employee compensation records efficiently.
5. Perform all core salary management tasks without relying on spreadsheets.

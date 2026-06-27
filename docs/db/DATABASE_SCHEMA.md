# Salary Management Portal - Database Schema

## Overview
Complete database schema for a comprehensive salary management system with 18 core tables organized by functional domain.

---

## 1. CORE ORGANIZATIONAL STRUCTURE

### 1.1 Employee
**Summary:** Core employee information including personal details, employment status, and organizational assignment.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | Primary key |
| employeeId | STRING | UNIQUE, NOT NULL | EMP-001, EMP-002, etc. |
| name | STRING | NOT NULL | Full name |
| email | STRING | UNIQUE, NOT NULL | Corporate email |
| phoneNumber | STRING | Nullable | Contact number |
| dateOfBirth | DATE | Nullable | For age calculation |
| gender | ENUM | Nullable | MALE, FEMALE, OTHER |
| country | STRING | FK → Company.country | Employee location/tax jurisdiction |
| department | STRING | FK → Department.id | Which department |
| designation | STRING | FK → Designation.id | Job title/role |
| employmentType | ENUM | NOT NULL | PERMANENT, CONTRACT, TEMPORARY, INTERN |
| joiningDate | DATETIME | NOT NULL | Employment start date |
| status | ENUM | DEFAULT: Active | ACTIVE, INACTIVE, ON_LEAVE, TERMINATED |
| bankAccountId | INT | FK → BankAccount.id | Primary payment account |
| createdAt | DATETIME | AUTO | Record creation timestamp |
| updatedAt | DATETIME | AUTO | Last update timestamp |

**Relationships:**
- 1 → Many with `Payroll`, `Attendance`, `LeaveRequest`, `SalaryComponent`

---

### 1.2 Department
**Summary:** Organizational departments/divisions.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | DEPT-HR, DEPT-IT, DEPT-FINANCE, etc. |
| name | STRING | NOT NULL | HR, Engineering, Sales, etc. |
| description | TEXT | Nullable | Dept description |
| managerEmployeeId | INT | FK → Employee.id | Department head |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Summary:** HR organizes employees by department for reporting and payroll aggregation.

---

### 1.3 Designation
**Summary:** Job titles and role definitions.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | DES-MGR, DES-ENG, DES-ANALYST, etc. |
| title | STRING | NOT NULL | Manager, Engineer, Analyst, etc. |
| description | TEXT | Nullable | Role responsibilities |
| level | INT | Nullable | Seniority level (1-10) |
| salaryGrade | STRING | FK → SalaryGrade.id | Associated grade |
| createdAt | DATETIME | AUTO | |

**Summary:** Standardizes job titles and links to salary grades for consistent compensation.

---

## 2. SALARY STRUCTURE & COMPONENTS

### 2.1 SalaryComponent
**Summary:** Types of salary components (allowances, deductions, earnings).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | ALLOW-DA, ALLOW-HRA, DED-TAX, etc. |
| name | STRING | NOT NULL | Dearness Allowance, HRA, Income Tax, etc. |
| type | ENUM | NOT NULL | EARNING, ALLOWANCE, DEDUCTION, TAX |
| calculationType | ENUM | NOT NULL | FIXED, PERCENTAGE, FORMULA |
| displayOrder | INT | Default: 0 | UI rendering order |
| isActive | BOOLEAN | DEFAULT: true | Active/inactive |
| createdAt | DATETIME | AUTO | |

**Summary:** Catalog of all salary components used in payroll calculation (e.g., DA=5%, HRA=10%, etc.).

---

### 2.2 EmployeeSalaryStructure
**Summary:** Individual employee's salary breakdown and component mapping.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| baseSalary | FLOAT | NOT NULL | Base monthly salary |
| effectiveDate | DATE | NOT NULL | When this structure starts |
| endDate | DATE | Nullable | When structure ends (NULL = current) |
| currency | STRING | DEFAULT: INR | Salary currency |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Summary:** Stores the base salary and effective dates for employee compensation changes (promotions, raises, etc.).

---

### 2.3 EmployeeSalaryComponent
**Summary:** Maps specific salary component values to each employee.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| salaryComponentId | STRING | FK → SalaryComponent.id | Which component (DA, HRA, etc.) |
| amount | FLOAT | NOT NULL | Amount or percentage |
| effectiveDate | DATE | NOT NULL | When this component applies |
| endDate | DATE | Nullable | When it stops (NULL = ongoing) |
| remarks | TEXT | Nullable | Special notes |
| createdAt | DATETIME | AUTO | |

**Example:**
- Employee EMP-001: DA = 5000, HRA = 8000, Conveyance = 2000, Income Tax = -1200

**Summary:** Assigns individual allowances/deductions to employees (some earn DA, others don't).

---

### 2.4 SalaryGrade
**Summary:** Pre-defined salary grade bands for standardized compensation.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | GRADE-A1, GRADE-A2, GRADE-B, etc. |
| name | STRING | NOT NULL | Grade A, Grade B, Grade C, etc. |
| minSalary | FLOAT | NOT NULL | Minimum salary in this grade |
| maxSalary | FLOAT | NOT NULL | Maximum salary in this grade |
| description | TEXT | Nullable | Grade description |
| createdAt | DATETIME | AUTO | |

**Summary:** Defines salary ranges by grade (e.g., Grade A: ₹50K-100K) for HR planning.

---

## 3. PAYROLL & PAYMENT

### 3.1 Payroll (EXISTING)
**Summary:** Aggregate monthly payroll data for all employees combined.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| payrollId | STRING | UNIQUE, NOT NULL | PAY-2026-06, PAY-2026-07, etc. |
| payrollPeriod | STRING | NOT NULL | "June 2026", "July 2026" |
| payoutDate | DATETIME | NOT NULL | When salary is paid |
| status | ENUM | DEFAULT: PENDING | DRAFT, PENDING, PROCESSING, COMPLETED, FAILED |
| totalAmount | FLOAT | NOT NULL | Sum of all net salaries |
| totalDeductions | FLOAT | NOT NULL | Sum of all deductions |
| netAmount | FLOAT | NOT NULL | totalAmount - totalDeductions |
| currency | STRING | DEFAULT: INR | Payment currency |
| country | STRING | DEFAULT: IN | Country for tax rules |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Summary:** High-level monthly payroll summary. Total of ₹25.2M paid to all employees each month.

---

### 3.2 PayrollBreakdown
**Summary:** Per-employee detailed payroll for each cycle (joins Employee + Payroll).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| payrollId | INT | FK → Payroll.id | Which payroll cycle |
| employeeId | INT | FK → Employee.id | Which employee |
| baseSalary | FLOAT | NOT NULL | Base salary for period |
| earnings | FLOAT | NOT NULL | Total allowances/earnings |
| deductions | FLOAT | NOT NULL | Total deductions |
| netSalary | FLOAT | NOT NULL | earnings - deductions |
| daysWorked | INT | NOT NULL | Days worked in period |
| attendancePercentage | FLOAT | NOT NULL | Attendance % |
| paymentStatus | ENUM | DEFAULT: PENDING | PENDING, PAID, FAILED, REVERSED |
| bankTransactionId | STRING | Nullable | Bank transfer ID |
| createdAt | DATETIME | AUTO | |

**Example Row:**
- Payroll: PAY-2026-06, Employee: EMP-001, BaseSalary: 50000, Earnings: 63000, Deductions: 8000, NetSalary: 55000

**Summary:** Itemized payroll per employee. Used to generate payslips and verify employee payments.

---

### 3.3 PayrollComponentBreakdown
**Summary:** Component-level detail within each PayrollBreakdown (allowances, deductions per employee).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| payrollBreakdownId | INT | FK → PayrollBreakdown.id | Which payroll row |
| salaryComponentId | STRING | FK → SalaryComponent.id | Which component |
| amount | FLOAT | NOT NULL | Calculated amount |
| createdAt | DATETIME | AUTO | |

**Example:**
- PayrollBreakdown (EMP-001, PAY-2026-06):
  - SalaryComponent: DA, Amount: 5000
  - SalaryComponent: HRA, Amount: 8000
  - SalaryComponent: IncomeTax, Amount: -1200

**Summary:** Shows exactly how each salary component was calculated for each employee.

---

### 3.4 BankAccount
**Summary:** Employee bank account details for payment.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| bankName | STRING | NOT NULL | HDFC, ICICI, AXIS, etc. |
| accountNumber | STRING | NOT NULL | Bank account number |
| ifscCode | STRING | NOT NULL | HDFC0001234 (for wire routing) |
| accountHolderName | STRING | NOT NULL | Name as per bank |
| accountType | ENUM | DEFAULT: SAVINGS | SAVINGS, CURRENT, NRI |
| isPrimary | BOOLEAN | DEFAULT: true | Primary payment account |
| isActive | BOOLEAN | DEFAULT: true | Active/inactive |
| createdAt | DATETIME | AUTO | |

**Summary:** Stores employee banking details for salary transfer via NEFT/RTGS.

---

### 3.5 PaymentMode
**Summary:** How salaries are paid (bank transfer, check, cash, etc.).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | BANK_TRANSFER, CHEQUE, CASH, CRYPTO, etc. |
| name | STRING | NOT NULL | Bank Transfer, Cheque, Cash |
| description | TEXT | Nullable | Payment method description |
| isActive | BOOLEAN | DEFAULT: true | Active/inactive |

**Summary:** Catalog of supported payment methods. Most companies use BANK_TRANSFER.

---

## 4. ATTENDANCE & LEAVE

### 4.1 Attendance
**Summary:** Daily attendance records for employees.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| attendanceDate | DATE | NOT NULL | Date of attendance |
| status | ENUM | NOT NULL | PRESENT, ABSENT, LEAVE, HALF_DAY, WFH, HOLIDAY |
| hoursWorked | FLOAT | Nullable | Hours for that day |
| remarks | TEXT | Nullable | Notes |
| createdAt | DATETIME | AUTO | |
| createdBy | INT | FK → Employee.id | Who marked it |

**Summary:** Tracks daily attendance used to calculate working days for payroll (affects payment if absent).

---

### 4.2 LeaveType
**Summary:** Types of leave available (PTO, Sick, Personal, etc.).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | LEAVE-PTO, LEAVE-SICK, LEAVE-PERSONAL, etc. |
| name | STRING | NOT NULL | Paid Time Off, Sick Leave, Personal Leave |
| allocatedDaysPerYear | INT | NOT NULL | 20, 10, 5, etc. |
| isEncashed | BOOLEAN | DEFAULT: false | Can unused days be cashed out? |
| isCarryForward | BOOLEAN | DEFAULT: false | Can unused days carry to next year? |
| maxCarryForwardDays | INT | Nullable | Max days that can be carried |
| createdAt | DATETIME | AUTO | |

**Summary:** Defines leave policy (PTO = 20 days/year, Sick = 10 days/year, etc.).

---

### 4.3 LeaveBalance
**Summary:** Current leave balance per employee.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| leaveTypeId | STRING | FK → LeaveType.id | Which leave type |
| year | INT | NOT NULL | 2026, 2027, etc. |
| allocatedDays | INT | NOT NULL | Days allocated this year |
| usedDays | INT | NOT NULL | Days already used |
| availableDays | INT | NOT NULL | allocatedDays - usedDays |
| carriedForwardDays | INT | DEFAULT: 0 | Days from previous year |
| createdAt | DATETIME | AUTO | |

**Example:**
- Employee EMP-001, PTO, 2026: Allocated=20, Used=5, Available=15, CarriedForward=2

**Summary:** Tracks leave balance per employee per year. HR uses this to approve leave requests.

---

### 4.4 LeaveRequest
**Summary:** Leave applications from employees.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Who's requesting |
| leaveTypeId | STRING | FK → LeaveType.id | Which type (PTO, Sick, etc.) |
| startDate | DATE | NOT NULL | Leave start date |
| endDate | DATE | NOT NULL | Leave end date |
| daysRequested | INT | NOT NULL | Number of days |
| reason | TEXT | Nullable | Reason for leave |
| status | ENUM | DEFAULT: PENDING | PENDING, APPROVED, REJECTED, CANCELLED |
| approverEmployeeId | INT | FK → Employee.id | Manager who approves |
| approvedDate | DATETIME | Nullable | When it was approved |
| createdAt | DATETIME | AUTO | |

**Summary:** Employee leave applications. Manager approves/rejects. Updates LeaveBalance when approved.

---

## 5. CONFIGURATION & SETUP

### 5.1 Company
**Summary:** Company-wide configuration and tax information.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | DEFAULT, MAIN, etc. |
| name | STRING | NOT NULL | Company legal name |
| registrationNumber | STRING | NOT NULL | CIN/Registration ID |
| taxId | STRING | NOT NULL | TAN/PAN for tax |
| country | STRING | NOT NULL | Country of operations |
| currency | STRING | DEFAULT: INR | Default currency |
| financialYearStart | INT | NOT NULL | 4 (April for India) |
| financialYearEnd | INT | NOT NULL | 3 (March for India) |
| createdAt | DATETIME | AUTO | |

**Summary:** Stores company-level configuration for payroll calculations (tax year, currency, etc.).

---

### 5.2 TaxSlab
**Summary:** Income tax brackets and rates.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| country | STRING | FK → Company.country | Tax jurisdiction (IN, US, etc.) |
| financialYear | INT | NOT NULL | 2025-26, 2026-27, etc. |
| minSalary | FLOAT | NOT NULL | Minimum salary for this bracket |
| maxSalary | FLOAT | NOT NULL | Maximum salary for this bracket |
| taxRate | FLOAT | NOT NULL | Tax percentage (5%, 10%, 20%, etc.) |
| createdAt | DATETIME | AUTO | |

**Example (India):**
- Min: 0, Max: 250000, Rate: 0% (No tax)
- Min: 250000, Max: 500000, Rate: 5%
- Min: 500000, Max: 1000000, Rate: 20%

**Summary:** Income tax slabs by country/year. Used to calculate income tax deduction.

---

### 5.3 PayrollTemplate
**Summary:** Template for calculating payroll (which components apply, calculation order).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | STRING | PK | TEMPLATE-DEFAULT, TEMPLATE-CONTRACT, etc. |
| name | STRING | NOT NULL | Default, Contract Employee, etc. |
| employmentType | ENUM | FK → Employee.employmentType | PERMANENT, CONTRACT, etc. |
| description | TEXT | Nullable | Template description |
| isActive | BOOLEAN | DEFAULT: true | Active/inactive |
| createdAt | DATETIME | AUTO | |

**Summary:** Defines which components apply to which employment types (contract employees may not get all benefits).

---

### 5.4 PayrollTemplateComponent
**Summary:** Components included in each payroll template.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| payrollTemplateId | STRING | FK → PayrollTemplate.id | Which template |
| salaryComponentId | STRING | FK → SalaryComponent.id | Which component |
| isIncluded | BOOLEAN | DEFAULT: true | Whether to include |
| calculationOrder | INT | NOT NULL | Order of calculation |
| createdAt | DATETIME | AUTO | |

**Summary:** Maps components to templates. E.g., "PERMANENT" template includes DA, HRA; "CONTRACT" only includes basic salary.

---

## 6. AUDIT & LOGGING

### 6.1 PayrollAudit
**Summary:** Audit trail for payroll changes and approvals.

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| payrollId | INT | FK → Payroll.id | Which payroll |
| action | ENUM | NOT NULL | CREATED, MODIFIED, APPROVED, REJECTED, FINALIZED |
| performedBy | INT | FK → Employee.id | Who did it |
| previousValues | JSON | Nullable | Before state |
| newValues | JSON | Nullable | After state |
| reason | TEXT | Nullable | Why changed |
| createdAt | DATETIME | AUTO | |

**Summary:** Complete change history of payroll. Compliance requirement for audits.

---

### 6.2 SalaryChangeHistory
**Summary:** Track employee salary adjustments (promotions, raises, demotions).

| Field | Data Type | Constraint | Notes |
|-------|-----------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| effectiveDate | DATE | NOT NULL | When change applies |
| previousBaseSalary | FLOAT | NOT NULL | Old salary |
| newBaseSalary | FLOAT | NOT NULL | New salary |
| changeType | ENUM | NOT NULL | PROMOTION, RAISE, DEMOTION, CORRECTION, ADJUSTMENT |
| reason | TEXT | Nullable | Promotion to Manager, etc. |
| approvedBy | INT | FK → Employee.id | Approver |
| createdAt | DATETIME | AUTO | |

**Summary:** Complete record of every salary change for audit and employee reference.

---

## Implementation Priority

**Phase 1 (Critical - Now):**
- Employee (existing ✅)
- Payroll (existing ✅)
- Department, Designation
- EmployeeSalaryStructure
- SalaryComponent, EmployeeSalaryComponent

**Phase 2 (High - Week 2):**
- Attendance
- LeaveType, LeaveBalance, LeaveRequest
- BankAccount
- PayrollBreakdown, PayrollComponentBreakdown

**Phase 3 (Medium - Week 3):**
- PayrollTemplate, PayrollTemplateComponent
- TaxSlab, Company
- PaymentMode

**Phase 4 (Low Priority - Week 4):**
- PayrollAudit, SalaryChangeHistory
- (These are for compliance/reporting later)

---

## Summary

**Total Tables: 18**
- 1 (Employee Core)
- 6 (Salary & Compensation)
- 5 (Payroll & Payment)
- 4 (Attendance & Leave)
- 3 (Configuration)
- 2 (Audit)

**Key Relationships:**
- Employee → Salary (1→Many)
- Payroll → PayrollBreakdown → Employee (1→Many→1)
- SalaryComponent → EmployeeSalaryComponent (1→Many)
- LeaveType → LeaveBalance, LeaveRequest (1→Many)

# Employee Schema Update Plan

**Date**: 2026-06-28  
**Status**: In Progress  
**Phase**: 1 - Phase 1 Analysis & Planning

---

## 1. Executive Summary

This document outlines the complete database schema update for the salary management system. We will implement 18 tables organized in 4 phases, with Phase 1 being critical for supporting the `/api/v1/employees` endpoint.

### Current State
- **Existing Tables**: Employee, Payroll (basic)
- **Total Tables Needed**: 18
- **Implementation Timeline**: 4 phases

---

## 2. Complete Table Breakdown (18 Tables)

### Phase 1: CRITICAL - Organizational & Salary Core (6 New Tables + Employee Update)

#### 1.1 Employee (UPDATE)
**Status**: Exists (needs field expansion)  
**Purpose**: Core employee information with personal details, employment status, and organizational assignment

**Current Fields** (in backend):
- id, employeeId, name, email, department, designation, status, basicSalary, currency, joiningDate

**NEW Fields to Add**:
- phoneNumber (STRING, nullable)
- dateOfBirth (DATE, nullable)
- gender (ENUM: MALE, FEMALE, OTHER - nullable)
- country (STRING, required for tax jurisdiction)
- employmentType (ENUM: PERMANENT, CONTRACT, TEMPORARY, INTERN - required)
- bankAccountId (INT, FK → BankAccount - nullable)
- avatarUrl (STRING, nullable)
- createdAt, updatedAt (timestamps)

**Why**: Enables complete employee profile, tax calculation, and payment processing

---

#### 1.2 Department (NEW)
**Purpose**: Organizational departments/divisions

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | STRING | PK | DEPT-HR, DEPT-IT, etc. |
| name | STRING | NOT NULL | HR, Engineering, Sales |
| description | TEXT | Nullable | Department description |
| managerEmployeeId | INT | FK → Employee.id | Department manager |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Why**: Employee.department → Department.id relationship. Needed for filtering employees by department in API

---

#### 1.3 Designation (NEW)
**Purpose**: Job titles and role definitions

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | STRING | PK | DES-MGR, DES-ENG, etc. |
| title | STRING | NOT NULL | Manager, Engineer, Analyst |
| description | TEXT | Nullable | Role responsibilities |
| level | INT | Nullable | Seniority level (1-10) |
| salaryGradeId | STRING | FK → SalaryGrade.id | Associated grade (Phase 3) |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Why**: Employee.designation → Designation.id. Standardizes job titles across organization

---

#### 1.4 SalaryComponent (NEW)
**Purpose**: Types of salary components (allowances, deductions, earnings)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | STRING | PK | ALLOW-DA, ALLOW-HRA, DED-TAX, etc. |
| name | STRING | NOT NULL | Dearness Allowance, HRA, Income Tax |
| type | ENUM | NOT NULL | EARNING, ALLOWANCE, DEDUCTION, TAX |
| calculationType | ENUM | NOT NULL | FIXED, PERCENTAGE, FORMULA |
| displayOrder | INT | Default: 0 | UI rendering order |
| isActive | BOOLEAN | DEFAULT: true | Active/inactive |
| createdAt | DATETIME | AUTO | |

**Example Records**:
- DA (Dearness Allowance) - EARNING, PERCENTAGE
- HRA (House Rent Allowance) - EARNING, PERCENTAGE
- IncomeTax - DEDUCTION, FORMULA
- Conveyance - EARNING, FIXED

**Why**: Catalog of all salary components. Used by EmployeeSalaryComponent for flexible salary structures

---

#### 1.5 EmployeeSalaryStructure (NEW)
**Purpose**: Individual employee's salary breakdown and component mapping

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| baseSalary | FLOAT | NOT NULL | Base monthly salary |
| effectiveDate | DATE | NOT NULL | When this structure starts |
| endDate | DATE | Nullable | When structure ends (NULL = current) |
| currency | STRING | DEFAULT: INR | Salary currency |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Example**:
- Employee EMP-001: BaseSalary=₹50,000, effectiveDate=2026-01-01, endDate=null (current)

**Why**: Tracks salary history. Multiple records per employee for promotions/raises

---

#### 1.6 EmployeeSalaryComponent (NEW)
**Purpose**: Maps specific salary component values to each employee

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| salaryComponentId | STRING | FK → SalaryComponent.id | DA, HRA, Tax, etc. |
| amount | FLOAT | NOT NULL | Amount or percentage |
| effectiveDate | DATE | NOT NULL | When this component applies |
| endDate | DATE | Nullable | When it stops (NULL = ongoing) |
| remarks | TEXT | Nullable | Special notes |
| createdAt | DATETIME | AUTO | |

**Example**:
- Employee EMP-001 + DA: amount=5%, effectiveDate=2026-01-01
- Employee EMP-001 + HRA: amount=₹8,000, effectiveDate=2026-01-01
- Employee EMP-001 + IncomeTax: amount=₹1,200, effectiveDate=2026-01-01

**Why**: Flexible salary structure - different employees get different allowances. Supports individual component calculations

---

#### 1.7 BankAccount (NEW)
**Purpose**: Employee bank account details for payment

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | INT | PK, Auto-increment | |
| employeeId | INT | FK → Employee.id | Which employee |
| bankName | STRING | NOT NULL | HDFC, ICICI, AXIS |
| accountNumber | STRING | NOT NULL | Bank account number |
| ifscCode | STRING | NOT NULL | HDFC0001234 |
| accountHolderName | STRING | NOT NULL | Name on bank account |
| accountType | ENUM | DEFAULT: SAVINGS | SAVINGS, CURRENT, NRI |
| isPrimary | BOOLEAN | DEFAULT: true | Primary payment account |
| isActive | BOOLEAN | DEFAULT: true | Active/inactive |
| createdAt | DATETIME | AUTO | |
| updatedAt | DATETIME | AUTO | |

**Why**: Enables salary transfer via NEFT/RTGS. Supports multiple accounts per employee

---

### Phase 1 Summary - Why These 7 Tables?

**Dependency Chain for `/api/v1/employees` API**:
```
Employee (core)
  ├─ Department (filtering)
  ├─ Designation (job title)
  ├─ EmployeeSalaryStructure (salary info in response)
  │   └─ SalaryComponent (component definitions)
  ├─ EmployeeSalaryComponent (individual component values)
  └─ BankAccount (payment info)
```

**API Response Requirements**:
```json
{
  "data": [
    {
      "employeeId": "EMP-001",
      "fullName": "Alice Johnson",
      "email": "alice@company.com",
      "department": "Engineering",          // ← Department.name
      "designation": "Senior Developer",     // ← Designation.title
      "basicSalary": 50000,                 // ← EmployeeSalaryStructure.baseSalary
      "currency": "INR",
      "status": "ACTIVE",
      "joiningDate": "2024-01-15",
      "country": "IN",                      // ← NEW
      "employmentType": "PERMANENT",        // ← NEW
      "bankAccount": {                      // ← BankAccount info
        "bankName": "HDFC",
        "accountNumber": "****1234"
      }
    }
  ]
}
```

---

## 3. Phase 2: HIGH Priority (4 Tables)

### Attendance & Leave Management
- **Attendance** - Daily attendance records
- **LeaveType** - Leave type definitions
- **LeaveBalance** - Current leave balance per employee
- **LeaveRequest** - Leave applications

**Implementation**: After Phase 1 ✅

---

## 4. Phase 3: MEDIUM Priority (5 Tables)

### Payroll Details & Configuration
- **PayrollBreakdown** - Per-employee payroll details
- **PayrollComponentBreakdown** - Component-level breakdown
- **PayrollTemplate** - Payroll calculation templates
- **PayrollTemplateComponent** - Components per template
- **SalaryGrade** - Salary grade bands
- **Company** - Company configuration
- **TaxSlab** - Tax bracket definitions

**Implementation**: After Phase 1 & 2 ✅

---

## 5. Phase 4: LOW Priority (3 Tables)

### Audit & Logging
- **PaymentMode** - Payment methods
- **PayrollAudit** - Payroll change audit trail
- **SalaryChangeHistory** - Salary adjustment history

**Implementation**: Final cleanup ✅

---

## 6. Implementation Steps - Phase 1

### Step 1: Update Employee Schema
- Add new fields: phoneNumber, dateOfBirth, gender, country, employmentType, avatarUrl
- Add timestamps: createdAt, updatedAt
- Add foreign key: bankAccountId

### Step 2: Create 6 New Tables
1. Department
2. Designation
3. SalaryComponent
4. EmployeeSalaryStructure
5. EmployeeSalaryComponent
6. BankAccount

### Step 3: Create Prisma Migration
- Generate migration file with all changes
- Apply migration to database

### Step 4: Update Employee API Response
- Expand response to include new fields
- Add department/designation lookups
- Include salary structure information

### Step 5: Add Test Data
- Create seed data for departments, designations, salary components
- Update employee seeding to use new schema

---

## 7. API Impact - `/api/v1/employees`

### Before (Current)
```
GET /api/v1/employees?page=1&pageLimit=10
```

Response includes:
- employeeId, fullName, email, department, designation, basicSalary, currency, status, joiningDate, avatarUrl

### After (Phase 1 Complete)
```
GET /api/v1/employees?page=1&pageLimit=10&employmentType=PERMANENT
```

Response includes (ADDITIONS):
- country ✅
- employmentType ✅
- bankAccountDetails ✅
- departmentId + department object ✅
- designationId + designation object ✅
- salaryStructure ✅

---

## 8. Timeline

| Phase | Tables | Effort | Timeline | Status |
|-------|--------|--------|----------|--------|
| 1 | 7 (6 new + 1 update) | 🔴 HIGH | 2-3 hours | **STARTING** |
| 2 | 4 | 🟡 MEDIUM | 2 hours | Planned |
| 3 | 5 | 🟡 MEDIUM | 2 hours | Planned |
| 4 | 3 | 🟢 LOW | 1 hour | Planned |

---

## 9. Next Action

**Ready to**: Create Phase 1 Prisma schema and database migration

**File to Create**:
- `backend/prisma/schema.prisma` (update Employee + add 6 tables)
- `backend/prisma/migrations/` (new migration)

**Then**: Seed Phase 1 data and update Employee API response handler

---

## Checklist

- [ ] Review and approve Phase 1 table structure
- [ ] Create Prisma schema for Phase 1
- [ ] Generate and apply migration
- [ ] Create Phase 1 seed data
- [ ] Update Employee API response
- [ ] Test with updated schema
- [ ] Document API changes
- [ ] Move to Phase 2

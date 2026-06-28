# Phase 1 Implementation Plan - Employee & Salary Structure

- **Date**: 2026-06-28
- **Status**: in-progress
- **Focus**: Phase 1 Database Schema & API v1/employees Endpoint

## Summary

Implementation of Phase 1 database schema updates required for the `/api/v1/employees` endpoint. This includes 6 new tables + updates to the Employee model, enabling complete employee profiles, flexible salary structures, and payment processing.

## Deliverables

### 1. Database Schema Files ✅
Created separate Prisma schema files for each Phase 1 table in `backend/prisma/schemas/`:

- ✅ `employee.prisma` - Updated Employee model with Phase 1 relationships
- ✅ `department.prisma` - Department lookup table
- ✅ `designation.prisma` - Designation lookup table  
- ✅ `salaryComponent.prisma` - Salary components catalog
- ✅ `employeeSalaryStructure.prisma` - Salary history tracking
- ✅ `employeeSalaryComponent.prisma` - Individual employee components
- ✅ `bankAccount.prisma` - Bank account details

### 2. Main Schema ✅
- ✅ `backend/prisma/schema.prisma` - Updated with all Phase 1 models and proper relationships

### 3. Database Migration ✅
- ✅ `backend/prisma/migrations/20260628_phase1_employee_salary_structure/migration.sql` - Complete migration script

### 4. Documentation ✅
- ✅ `docs/story/2026-06-28-backend-employees-api-v1.md` - Updated with Phase 1 schema section
- ✅ `docs/SCHEMA_UPDATE_PLAN.md` - Complete 18-table breakdown with implementation phases

## Phase 1 Tables

| # | Table | Status | Purpose |
|---|-------|--------|---------|
| 1 | Employee (update) | ✅ | Core employee with Phase 1 fields & relationships |
| 2 | Department | ✅ | Organizational departments |
| 3 | Designation | ✅ | Job titles & roles |
| 4 | SalaryComponent | ✅ | Salary components catalog |
| 5 | EmployeeSalaryStructure | ✅ | Salary history tracking |
| 6 | EmployeeSalaryComponent | ✅ | Individual component mappings |
| 7 | BankAccount | ✅ | Payment account details |

## Employee Model Updates

### New Fields Added
```prisma
phoneNumber String?              // Contact number
dateOfBirth DateTime?            // Tax & age calculation
gender Gender?                   // MALE, FEMALE, OTHER
departmentId String (FK)         // Links to Department
designationId String (FK)        // Links to Designation
employmentType EmploymentType    // PERMANENT, CONTRACT, TEMPORARY, INTERN
bankAccountId Int? (FK)          // Primary bank account
```

### New Relationships
```prisma
department Department              // N:1 relationship
designation Designation            // N:1 relationship
bankAccount BankAccount?           // 1:1 optional relationship
salaryStructures EmployeeSalaryStructure[]  // 1:N history
salaryComponents EmployeeSalaryComponent[]  // 1:N components
bankAccounts BankAccount[]         // 1:N multiple accounts
managedDepartments Department[]    // 1:N as manager
```

## Next Steps

### Step 1: Verify Schema ✅
- [x] Create separate schema files for organization
- [x] Update main schema.prisma with all models
- [x] Define migration SQL

### Step 2: Apply Migration 🔄
- [ ] Run TypeScript type check: `npx tsc --noEmit`
- [ ] Review migration: `npx prisma migrate dev --name phase1`
- [ ] Verify database schema changes

### Step 3: Generate Prisma Client 🔄
- [ ] Generate updated Prisma client: `npx prisma generate`
- [ ] Verify types in `generated/prisma/`

### Step 4: Create Seed Data 🔄
- [ ] Seed departments (ENGINEERING, MARKETING, FINANCE, HR, SALES)
- [ ] Seed designations (SENIOR_DEVELOPER, MARKETING_MANAGER, etc.)
- [ ] Seed salary components (DA, HRA, IncomeTax, Conveyance, etc.)
- [ ] Update employee seed to use new relationships

### Step 5: Update API Response Handler 🔄
- [ ] Update `src/routes/employees.ts` to handle new schema
- [ ] Update employee model mapper to include new fields
- [ ] Ensure backward compatibility with existing tests

### Step 6: Update Tests 🔄
- [ ] Update test fixtures to use new schema
- [ ] Add tests for new fields (country, employmentType, etc.)
- [ ] Verify all 81 existing tests still pass

### Step 7: Validate API Response 🔄
- [ ] Verify `/api/v1/employees` returns all Phase 1 fields
- [ ] Test filtering by department
- [ ] Test with new query parameters
- [ ] Validate meta and filters sections

## Schema Organization

```
backend/
├── prisma/
│   ├── schemas/              # Individual table definitions
│   │   ├── employee.prisma
│   │   ├── department.prisma
│   │   ├── designation.prisma
│   │   ├── salaryComponent.prisma
│   │   ├── employeeSalaryStructure.prisma
│   │   ├── employeeSalaryComponent.prisma
│   │   └── bankAccount.prisma
│   ├── schema.prisma         # Main schema (combines all)
│   └── migrations/
│       ├── 20260626113326_init/
│       ├── 20260627160459_add_payroll_table/
│       └── 20260628_phase1_employee_salary_structure/
```

## Acceptance Criteria

- [ ] All Phase 1 tables created with correct relationships
- [ ] Employee model includes all Phase 1 fields
- [ ] Migration applies without errors
- [ ] Prisma client generates successfully
- [ ] Database indexes created for performance
- [ ] Test data can be seeded
- [ ] API response includes new fields
- [ ] All existing tests pass (81 tests)
- [ ] New field types validated in responses
- [ ] Backward compatibility maintained

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Foreign key constraints fail | Cannot apply migration | Review FK relationships, ensure IDs match |
| Test data seeding fails | Cannot validate schema | Create default seed data first |
| API response format changes | Frontend breaks | Maintain backward compatibility fields |
| Performance with new indexes | Query slowdown | Verify index strategy |

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| Create schema files | ✅ 30 min | Complete |
| Create migration | ✅ 30 min | Complete |
| Apply migration | 🔄 30 min | Ready |
| Update API handler | 🔄 1 hour | Next |
| Update tests | 🔄 1 hour | Next |
| Validation | 🔄 30 min | Next |

## Status Updates

- 2026-06-28 10:00 AM: Created Phase 1 schema files in `backend/prisma/schemas/`
- 2026-06-28 10:15 AM: Updated main `schema.prisma` with all models
- 2026-06-28 10:30 AM: Created migration SQL file
- 2026-06-28 10:45 AM: Updated API story document with Phase 1 details
- **NEXT**: Apply migration and generate Prisma client

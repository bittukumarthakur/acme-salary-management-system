# Multi-Tenancy Implementation Guide

## Current State vs. Multi-Tenancy

### ❌ Current Design (Single Company)
The schema currently treats `Company` as a static configuration table with a single row (id='DEFAULT'). Each table assumes only one company's data exists in the database.

```
Company (id='DEFAULT')
├── Employees (all from company 'DEFAULT')
├── Departments (all from company 'DEFAULT')
├── Payroll (all from company 'DEFAULT')
└── ... (all other tables)
```

**Problem:** If you add a second company, data from different companies mix together with no isolation.

---

## ✅ Multi-Tenancy Solution

### Strategy 1: **Database-Per-Tenant** (Recommended for Isolation)
Each company gets its own separate database.

**Pros:**
- ✅ Complete data isolation
- ✅ Easy backup per company
- ✅ Easy scaling per company
- ✅ Compliance/GDPR friendly

**Cons:**
- ❌ More infrastructure cost
- ❌ More complex operations

---

### Strategy 2: **Schema-Per-Tenant** (PostgreSQL Only)
Each company gets its own schema within one database.

**Pros:**
- ✅ Good isolation
- ✅ Easier than database-per-tenant
- ✅ Shared infrastructure

**Cons:**
- ❌ PostgreSQL specific
- ❌ Schema management overhead

---

### Strategy 3: **Row-Level Tenancy** (Recommended for Cost)
All companies share same tables, but each row tagged with `companyId`.

**Pros:**
- ✅ Lowest infrastructure cost
- ✅ Easiest to scale
- ✅ Works with any database

**Cons:**
- ⚠️ Must enforce `companyId` on every query
- ⚠️ Risk of data leakage if filter forgotten

---

## Recommended: Row-Level Tenancy with Hard Enforcement

### Step 1: Add `companyId` to All Tables

```diff
// Current Employee table
{
  id: INT
  employeeId: STRING
  name: STRING
  ...
}

// Multi-tenant Employee table
{
  id: INT
  companyId: STRING  // ← ADD THIS
  employeeId: STRING
  name: STRING
  ...
  UNIQUE (companyId, employeeId)  // ← Unique per company, not globally
}
```

---

## Implementation: Prisma Schema Changes

### Before (Single Company)
```prisma
model Employee {
  id                  Int     @id @default(autoincrement())
  employeeId          String  @unique
  name                String
  email               String  @unique
  department          String? @relation("EmployeeDepartment", fields: [departmentId], references: [id])
  departmentId        String?
  @@map("Employee")
}

model Company {
  id                  String  @id @default("DEFAULT")
  name                String
  country             String
  currency            String  @default("INR")
}
```

### After (Multi-Tenant)
```prisma
model Company {
  id                  String  @id  // "ACME", "GLOBEX", "INITECH", etc.
  name                String
  registrationNumber  String  @unique
  taxId               String  @unique
  country             String
  currency            String  @default("INR")
  
  // Relations
  employees           Employee[]
  departments         Department[]
  payrolls            Payroll[]
  attendance          Attendance[]
  leaveRequests       LeaveRequest[]
  salaryComponents    SalaryComponent[]
  // ... all child tables
  
  @@map("Company")
}

model Employee {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyEmployees", fields: [companyId], references: [id])  // ← ADD
  employeeId          String
  name                String
  email               String
  department          Department?  @relation("DepartmentEmployees", fields: [departmentId], references: [id])
  departmentId        String?
  
  // Enforce uniqueness per company
  @@unique([companyId, employeeId])
  @@unique([companyId, email])
  @@map("Employee")
}

model Department {
  id                  String  @id
  companyId           String  @relation("CompanyDepartments", fields: [companyId], references: [id])  // ← ADD
  name                String
  
  @@unique([companyId, id])
  @@map("Department")
}

model Payroll {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyPayrolls", fields: [companyId], references: [id])  // ← ADD
  payrollId           String
  payrollPeriod       String
  totalAmount         Float
  
  @@unique([companyId, payrollId])
  @@map("Payroll")
}

// ... Apply same pattern to ALL 18 tables
```

---

## Implementation: Context-Based Queries

### Problem: Easy to Forget `companyId` Filter
```typescript
// ❌ DANGEROUS: Queries all employees from ALL companies
const employees = await prisma.employee.findMany();

// ❌ DANGEROUS: Forgets companyId, leaks data to wrong company
const payrolls = await prisma.payroll.findMany({
  where: { payrollPeriod: 'June 2026' }
});
```

### Solution: Middleware to Auto-Inject `companyId`
```typescript
// middleware/tenancy.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store current company in async context
import { AsyncLocalStorage } from 'async_hooks';

export const companyContext = new AsyncLocalStorage<string>();

export const getCurrentCompany = (): string => {
  const company = companyContext.getStore();
  if (!company) throw new Error('Company context not set');
  return company;
};

// Middleware for Express
export const tenancyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get companyId from JWT token, header, or subdomain
  const companyId = req.user?.companyId || req.headers['x-company-id'];
  
  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' });
  }
  
  // Run all queries within this company context
  companyContext.run(companyId, next);
};
```

### Solution: Prisma Extension (Auto-Filter)
```typescript
// lib/prisma-with-tenancy.ts
const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        const companyId = getCurrentCompany();
        args.where = { ...args.where, companyId };
        return query(args);
      },
      async findFirst({ model, args, query }) {
        const companyId = getCurrentCompany();
        args.where = { ...args.where, companyId };
        return query(args);
      },
      async findUnique({ model, args, query }) {
        const companyId = getCurrentCompany();
        args.where = { ...args.where, companyId };
        return query(args);
      },
    },
  },
});
```

### Result: Safe Queries
```typescript
// ✅ SAFE: Automatically filtered by companyId
const employees = await prisma.employee.findMany();
// Becomes: SELECT * FROM Employee WHERE companyId = 'ACME'

// ✅ SAFE: Finds payroll only for current company
const payrolls = await prisma.payroll.findMany({
  where: { payrollPeriod: 'June 2026' }
});
// Becomes: SELECT * FROM Payroll WHERE companyId = 'ACME' AND payrollPeriod = 'June 2026'
```

---

## Implementation: API Changes

### Authentication & Company Resolution
```typescript
// routes/employees.ts
import { Router } from 'express';
import { tenancyMiddleware, getCurrentCompany } from '../middleware/tenancy';

const router = Router();

router.use(tenancyMiddleware);  // ← Protect all routes

// GET /employees - Returns only employees from current company
router.get('/', async (req, res) => {
  const employees = await prisma.employee.findMany({
    include: { department: true },
  });
  // Auto-filtered: only from getCurrentCompany()
  
  res.json(employees);
});

// POST /employees - Creates employee in current company
router.post('/', async (req, res) => {
  const employee = await prisma.employee.create({
    data: {
      companyId: getCurrentCompany(),  // ← Enforced
      ...req.body,
    },
  });
  res.json(employee);
});
```

### Dashboard API (Multi-Tenant)
```typescript
// routes/dashboard.ts
router.get('/', async (req, res) => {
  const companyId = getCurrentCompany();  // ← From JWT
  
  // All queries auto-filtered by companyId
  const payrolls = await prisma.payroll.findMany({
    where: { payrollId: { startsWith: `PAY-${new Date().getFullYear()}` } },
  });
  // Only returns payrolls from CURRENT company
  
  const totalPayroll = payrolls.reduce((sum, p) => sum + p.totalAmount, 0);
  
  res.json({
    company: companyId,
    summaryCards: [...],
    recentPayrolls: payrolls,
    meta: { appliedCompany: companyId, ... }
  });
});
```

---

## Implementation: Authentication

### JWT Token with Company Info
```typescript
// services/auth.ts
import jwt from 'jsonwebtoken';

export const createToken = (user: { id: string; companyId: string; role: string }) => {
  return jwt.sign(
    {
      userId: user.id,
      companyId: user.companyId,  // ← Include company
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify & extract
export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET) as {
    userId: string;
    companyId: string;
    role: string;
  };
};
```

### Middleware to Set Context
```typescript
// middleware/auth.ts
import { tenancyMiddleware, companyContext } from './tenancy';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  const payload = verifyToken(token);
  
  req.user = {
    id: payload.userId,
    companyId: payload.companyId,
    role: payload.role,
  };
  
  // Set company context for all nested queries
  companyContext.run(payload.companyId, next);
};
```

---

## Database Schema Changes Summary

### Tables That Need `companyId` Added:

| Table | New Field | Unique Constraint |
|-------|-----------|-------------------|
| Employee | companyId | (companyId, employeeId) |
| Department | companyId | (companyId, name) |
| Designation | companyId | (companyId, title) |
| SalaryComponent | companyId | (companyId, name) |
| SalaryGrade | companyId | (companyId, name) |
| EmployeeSalaryStructure | companyId | (companyId, employeeId, effectiveDate) |
| EmployeeSalaryComponent | companyId | (companyId, employeeId, salaryComponentId, effectiveDate) |
| BankAccount | companyId | (companyId, employeeId, accountNumber) |
| Attendance | companyId | (companyId, employeeId, attendanceDate) |
| LeaveType | companyId | (companyId, name) |
| LeaveBalance | companyId | (companyId, employeeId, leaveTypeId, year) |
| LeaveRequest | companyId | (companyId, employeeId, startDate) |
| Payroll | companyId | (companyId, payrollId) |
| PayrollBreakdown | companyId | (companyId, payrollId, employeeId) |
| PayrollComponentBreakdown | companyId | (companyId, payrollBreakdownId, salaryComponentId) |
| PayrollTemplate | companyId | (companyId, name) |
| PayrollTemplateComponent | companyId | (companyId, payrollTemplateId, salaryComponentId) |
| TaxSlab | companyId | (companyId, country, financialYear, minSalary) |

**Note:** PaymentMode stays global (not company-specific) as it's a catalog of payment methods.

---

## Multi-Company Scenarios

### Scenario 1: ACME Corp Hires 100 Employees
```
Company: ACME
├── Employees: [EMP-ACME-001, EMP-ACME-002, ..., EMP-ACME-100]
├── Payroll: [PAY-ACME-2026-06, PAY-ACME-2026-07, ...]
└── TaxSlabs: [ACME India, ACME USA, ACME UK]
```

### Scenario 2: Globex Corp (Different Country, Currency)
```
Company: GLOBEX
├── Employees: [EMP-GLOBEX-001, EMP-GLOBEX-002, ...]
├── Currency: USD (vs ACME's INR)
├── Payroll: [PAY-GLOBEX-2026-06, ...]
└── TaxSlabs: [GLOBEX USA, GLOBEX Canada]
```

### Scenario 3: Initech Corp (Separate Database via Schema)
```
Schema: initech_prod
├── Company: INITECH
├── Employees: [100 rows]
├── Payroll: [monthly data]
└── (Isolated from ACME & GLOBEX)
```

---

## Query Examples: Multi-Tenant

### Get All Employees for Current Company
```typescript
// Assuming JWT sets companyId = 'ACME'

const employees = await prisma.employee.findMany({
  include: {
    department: true,
    designation: true,
  },
  orderBy: { employeeId: 'asc' },
});

// Result: Only ACME employees
// WHERE companyId = 'ACME'
```

### Get Payroll for Current Company
```typescript
const payroll = await prisma.payroll.findMany({
  where: {
    payrollPeriod: 'June 2026',
  },
  include: {
    payrollBreakdowns: {
      include: { employee: true },
    },
  },
});

// Result: Only ACME payroll for June 2026
// WHERE companyId = 'ACME' AND payrollPeriod = 'June 2026'
```

### Create Employee in Current Company
```typescript
const newEmployee = await prisma.employee.create({
  data: {
    companyId: getCurrentCompany(), // ← ENFORCED
    employeeId: 'EMP-ACME-101',
    name: 'Alice Johnson',
    email: 'alice@acme.com',
    department: { connect: { id: 'DEPT-ACME-ENG' } },
  },
});

// Creates in ACME company only
```

### Transfer Employee to Globex (Rare)
```typescript
// Delete from ACME and create in GLOBEX
await prisma.$transaction([
  // Delete from ACME
  prisma.employee.delete({
    where: {
      id: employeeId,
      companyId: 'ACME',
    },
  }),
  
  // Create in GLOBEX with new employeeId
  prisma.employee.create({
    data: {
      companyId: 'GLOBEX',
      employeeId: 'EMP-GLOBEX-201',
      name: 'Alice Johnson',
      email: 'alice@globex.com',
    },
  }),
]);
```

---

## Data Isolation & Security Checklist

- ✅ Every INSERT includes `companyId`
- ✅ Every SELECT filters by `companyId`
- ✅ JWT token includes `companyId`
- ✅ Middleware enforces `companyId` context
- ✅ UNIQUE constraints per company (not global)
- ✅ Foreign keys scoped by company
- ✅ No cross-company queries possible
- ✅ Audit logs include `companyId`
- ✅ Database backups organized per company
- ✅ Tests run isolated by company

---

## Migration Path

### Phase 1: Prepare Schema
- Add `companyId` to all 18 tables
- Update UNIQUE constraints
- Create indexes on `companyId`
- Write data migration script

### Phase 2: Update Backend
- Install tenancy middleware
- Update all repository queries
- Add JWT company extraction
- Test with two companies

### Phase 3: Update Frontend
- Store `companyId` from JWT
- Include in API headers
- Show company in dashboard title
- Add company switcher (if needed)

### Phase 4: Deploy
- Backup current data as "DEFAULT" company
- Set all existing records to `companyId = 'DEFAULT'`
- Deploy new code
- Test both single and multi-company flows

---

## Performance Considerations

### Indexing Strategy
```sql
-- Add indexes for faster queries
CREATE INDEX idx_employee_company ON Employee(companyId);
CREATE INDEX idx_payroll_company ON Payroll(companyId);
CREATE INDEX idx_attendance_company ON Attendance(companyId, attendanceDate);
CREATE INDEX idx_payrollbreakdown_company ON PayrollBreakdown(companyId, payrollId);

-- Composite indexes for common queries
CREATE INDEX idx_payroll_company_period ON Payroll(companyId, payrollPeriod);
CREATE INDEX idx_employee_company_status ON Employee(companyId, status);
```

### Query Performance
- **Before:** `SELECT * FROM Employee` → 1M rows (slow, no isolation)
- **After:** `SELECT * FROM Employee WHERE companyId = 'ACME'` → 100 rows (fast, safe)

### Scaling: Database-Per-Tenant (Future)
If traffic grows, migrate to Strategy 1:
```
Company: ACME → acme_prod database
Company: GLOBEX → globex_prod database
Company: INITECH → initech_prod database
```

---

## Compliance & Audit

### GDPR: Right to Erasure
```typescript
// Delete all company data
await prisma.$transaction([
  prisma.employee.deleteMany({ where: { companyId: 'ACME' } }),
  prisma.payroll.deleteMany({ where: { companyId: 'ACME' } }),
  prisma.attendance.deleteMany({ where: { companyId: 'ACME' } }),
  // ... all tables
  prisma.company.delete({ where: { id: 'ACME' } }),
]);
```

### Audit Logs (All Changes Per Company)
```typescript
// Log every change per company
model AuditLog {
  id        Int     @id @default(autoincrement())
  companyId String  @relation("CompanyAudits", fields: [companyId], references: [id])
  tableName String
  action    String  // CREATE, UPDATE, DELETE
  userId    String
  changes   Json
  createdAt DateTime @default(now())
  
  @@index([companyId])
}
```

---

## Summary

| Aspect | Single Company | Multi-Tenant (Row-Level) |
|--------|----------------|--------------------------|
| **Data Isolation** | N/A | ✅ Automatic via companyId |
| **Infrastructure Cost** | Low | Low |
| **Complexity** | Simple | Medium |
| **Scalability** | Limited | High |
| **GDPR Compliance** | Difficult | Easy |
| **Setup Time** | Days | Weeks |

**Recommendation:** Start with **Row-Level Tenancy** for cost efficiency. If traffic/isolation needs grow, migrate to **Database-Per-Tenant** (plug-and-play upgrade).

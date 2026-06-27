# Multi-Tenancy Implementation - Complete Working Example

## Overview
This guide shows **step-by-step** how to implement row-level multi-tenancy with `companyId` isolation, auto-filtering middleware, and JWT enforcement.

---

# PART 1: Database Schema Changes

## Step 1.1: Current Schema (Single Company)

### Before: Prisma Schema
```prisma
// prisma/schema.prisma (CURRENT - Single Company)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Company {
  id    String @id @default("DEFAULT")  // ← Only one company
  name  String
  // Only supports one company instance
}

model Employee {
  id           Int     @id @default(autoincrement())
  employeeId   String  @unique
  name         String
  email        String  @unique
  department   String?
  
  @@map("Employee")
}

model Payroll {
  id           Int     @id @default(autoincrement())
  payrollId    String  @unique
  payrollPeriod String
  totalAmount  Float
  
  @@map("Payroll")
}
```

**Problem:** If you add ACME and GLOBEX employees, they all mix together:
```sql
SELECT * FROM Employee;
-- Returns: EMP-ACME-001, EMP-GLOBEX-001, EMP-GLOBEX-002, ... (no isolation!)
```

---

## Step 1.2: Multi-Tenant Schema (with `companyId`)

### After: Prisma Schema
```prisma
// prisma/schema.prisma (MULTI-TENANT)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ===== COMPANY (Unchanged - Root entity) =====
model Company {
  id                  String  @id  // "ACME", "GLOBEX", "INITECH"
  name                String
  registrationNumber  String  @unique
  taxId               String  @unique
  country             String
  currency            String  @default("INR")
  financialYearStart  Int
  financialYearEnd    Int
  createdAt           DateTime @default(now())

  // Relations to child tables (for cascading deletes)
  employees           Employee[]
  departments         Department[]
  payrolls            Payroll[]
  attendance          Attendance[]
  leaveRequests       LeaveRequest[]
  salaryComponents    SalaryComponent[]
  
  @@map("Company")
}

// ===== EMPLOYEE (ADD companyId) =====
model Employee {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyEmployees", fields: [companyId], references: [id], onDelete: Cascade)
  employeeId          String
  name                String
  email               String
  phoneNumber         String?
  dateOfBirth         DateTime?
  gender              String?
  country             String?
  status              String  @default("ACTIVE")
  joiningDate         DateTime @default(now())
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  department          Department? @relation("DepartmentEmployees", fields: [departmentId], references: [id])
  departmentId        String?

  bankAccounts        BankAccount[]
  attendanceRecords   Attendance[]
  payrollBreakdowns   PayrollBreakdown[]
  leaveRequests       LeaveRequest[]

  // ← NEW: Enforce uniqueness PER COMPANY
  @@unique([companyId, employeeId])
  @@unique([companyId, email])
  @@index([companyId])
  @@map("Employee")
}

// ===== DEPARTMENT (ADD companyId) =====
model Department {
  id                  String  @id
  companyId           String  @relation("CompanyDepartments", fields: [companyId], references: [id], onDelete: Cascade)
  name                String
  description         String?
  managerEmployeeId   Int?
  createdAt           DateTime @default(now())

  // Relations
  employees           Employee[] @relation("DepartmentEmployees")

  @@unique([companyId, id])
  @@unique([companyId, name])
  @@index([companyId])
  @@map("Department")
}

// ===== PAYROLL (ADD companyId) =====
model Payroll {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyPayrolls", fields: [companyId], references: [id], onDelete: Cascade)
  payrollId           String
  payrollPeriod       String
  payoutDate          DateTime
  status              String  @default("PENDING")
  totalAmount         Float
  totalDeductions     Float
  netAmount           Float
  currency            String  @default("INR")
  country             String  @default("IN")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  payrollBreakdowns   PayrollBreakdown[]

  @@unique([companyId, payrollId])
  @@index([companyId])
  @@index([companyId, payrollPeriod])
  @@map("Payroll")
}

// ===== PAYROLL_BREAKDOWN (ADD companyId) =====
model PayrollBreakdown {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyPayrollBreakdowns", fields: [companyId], references: [id], onDelete: Cascade)
  payrollId           Int     @relation(fields: [payrollId], references: [id], onDelete: Cascade)
  employeeId          Int     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  baseSalary          Float
  earnings            Float
  deductions          Float
  netSalary           Float
  createdAt           DateTime @default(now())

  payroll             Payroll @relation(fields: [payrollId], references: [id])
  employee            Employee @relation(fields: [employeeId], references: [id])

  @@unique([companyId, payrollId, employeeId])
  @@index([companyId])
  @@index([companyId, payrollId])
  @@map("PayrollBreakdown")
}

// ===== ATTENDANCE (ADD companyId) =====
model Attendance {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyAttendance", fields: [companyId], references: [id], onDelete: Cascade)
  employeeId          Int     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  attendanceDate      DateTime
  status              String  @default("ABSENT")  // PRESENT, ABSENT, LEAVE, etc.
  hoursWorked         Float?
  remarks             String?
  createdAt           DateTime @default(now())

  employee            Employee @relation(fields: [employeeId], references: [id])

  @@unique([companyId, employeeId, attendanceDate])
  @@index([companyId])
  @@index([companyId, employeeId])
  @@map("Attendance")
}

// ===== LEAVE_REQUEST (ADD companyId) =====
model LeaveRequest {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyLeaveRequests", fields: [companyId], references: [id], onDelete: Cascade)
  employeeId          Int     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  startDate           DateTime
  endDate             DateTime
  daysRequested       Int
  reason              String?
  status              String  @default("PENDING")  // PENDING, APPROVED, REJECTED
  approvedDate        DateTime?
  createdAt           DateTime @default(now())

  employee            Employee @relation(fields: [employeeId], references: [id])

  @@index([companyId])
  @@index([companyId, employeeId])
  @@map("LeaveRequest")
}

// ===== SALARY_COMPONENT (ADD companyId) =====
model SalaryComponent {
  id                  String  @id
  companyId           String  @relation("CompanySalaryComponents", fields: [companyId], references: [id], onDelete: Cascade)
  name                String
  type                String  // EARNING, ALLOWANCE, DEDUCTION, TAX
  calculationType     String  // FIXED, PERCENTAGE, FORMULA
  isActive            Boolean @default(true)
  createdAt           DateTime @default(now())

  @@unique([companyId, name])
  @@index([companyId])
  @@map("SalaryComponent")
}

// ===== BANK_ACCOUNT (ADD companyId) =====
model BankAccount {
  id                  Int     @id @default(autoincrement())
  companyId           String  @relation("CompanyBankAccounts", fields: [companyId], references: [id], onDelete: Cascade)
  employeeId          Int     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  bankName            String
  accountNumber       String
  ifscCode            String
  accountHolderName   String
  createdAt           DateTime @default(now())

  employee            Employee @relation(fields: [employeeId], references: [id])

  @@unique([companyId, employeeId, accountNumber])
  @@index([companyId])
  @@map("BankAccount")
}

// === Add companyId to remaining 11 tables similarly ===
```

---

# PART 2: Middleware & Context Setup

## Step 2.1: Create Tenancy Context (Async Context)

```typescript
// backend/src/lib/tenancy-context.ts

import { AsyncLocalStorage } from 'async_hooks';

// Store company info in async context (thread-safe)
export const companyContext = new AsyncLocalStorage<{
  companyId: string;
  userId: string;
}>();

/**
 * Get current company from context
 * Throws if not set (prevents accidental data leakage)
 */
export function getCurrentCompanyId(): string {
  const context = companyContext.getStore();
  if (!context?.companyId) {
    throw new Error(
      'Company context not initialized. ' +
      'Did you forget to use authMiddleware?'
    );
  }
  return context.companyId;
}

export function getCurrentUserId(): string {
  const context = companyContext.getStore();
  if (!context?.userId) {
    throw new Error('User context not initialized.');
  }
  return context.userId;
}

export function getContext() {
  const context = companyContext.getStore();
  if (!context) {
    throw new Error('Context not initialized.');
  }
  return context;
}
```

---

## Step 2.2: Create Authentication Middleware

```typescript
// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { companyContext } from '../lib/tenancy-context';

// Extend Express Request with user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        companyId: string;
        role: string;
        email: string;
      };
    }
  }
}

/**
 * Verify JWT and extract company info
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const token = authHeader.substring(7);

    // Verify and decode JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret') as {
      userId: string;
      companyId: string;
      role: string;
      email: string;
    };

    // Store in request (for manual access)
    req.user = payload;

    // Store in async context (for queries inside middleware chain)
    companyContext.run(
      {
        companyId: payload.companyId,
        userId: payload.userId,
      },
      () => next()
    );
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## Step 2.3: Create Prisma Extension (Auto-Filter)

```typescript
// backend/src/lib/prisma-extended.ts

import { PrismaClient } from '@prisma/client';
import { getCurrentCompanyId } from './tenancy-context';

// Tables that need companyId filtering
const TENANT_MODELS = [
  'employee',
  'department',
  'payroll',
  'payrollBreakdown',
  'attendance',
  'leaveRequest',
  'salaryComponent',
  'bankAccount',
  'salaryGrade',
  'designation',
  'employeeSalaryStructure',
  'employeeSalaryComponent',
  'payrollTemplate',
  'payrollTemplateComponent',
  'leaveType',
  'leaveBalance',
  'taxSlab',
  'payrollAudit',
];

const prismaClient = new PrismaClient();

/**
 * Extend Prisma client with automatic company filtering
 * Every query to tenant models automatically filters by companyId
 */
export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      // Intercept findMany
      async findMany({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },

      // Intercept findFirst
      async findFirst({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },

      // Intercept findUnique
      async findUnique({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          // For findUnique, add to where object carefully
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },

      // Intercept create
      async create({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.data = { ...args.data, companyId };
        }
        return query(args);
      },

      // Intercept createMany
      async createMany({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.data = args.data.map((item) => ({
            ...item,
            companyId,
          }));
        }
        return query(args);
      },

      // Intercept update
      async update({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },

      // Intercept updateMany
      async updateMany({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },

      // Intercept delete
      async delete({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },

      // Intercept deleteMany
      async deleteMany({ model, args, query }) {
        if (TENANT_MODELS.includes(model)) {
          const companyId = getCurrentCompanyId();
          args.where = { ...args.where, companyId };
        }
        return query(args);
      },
    },
  },
});
```

---

# PART 3: JWT Token Creation

## Step 3.1: Create JWT Token (on Login)

```typescript
// backend/src/services/authService.ts

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface LoginPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token with company info
 */
export function generateToken(payload: LoginPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      companyId: payload.companyId,  // ← Company embedded in token
      email: payload.email,
      role: payload.role,
    },
    process.env.JWT_SECRET || 'your-secret',
    { expiresIn: '24h' }
  );
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): LoginPayload {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret') as LoginPayload;
}

/**
 * Example login endpoint
 */
export async function loginUser(email: string, password: string, companyId: string) {
  // In real scenario: lookup user in database, verify password, etc.
  
  const user = {
    userId: crypto.randomUUID(),
    email,
    companyId,
    role: 'ADMIN',
  };

  const token = generateToken(user);

  return {
    token,
    user: {
      userId: user.userId,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    },
  };
}
```

---

# PART 4: Complete Flow Example

## Step 4.1: Setup Application

```typescript
// backend/src/app.ts

import express from 'express';
import { authMiddleware } from './middleware/auth';
import employeeRoutes from './routes/employees';
import payrollRoutes from './routes/payroll';
import dashboardRoutes from './routes/dashboard';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(express.json());

// Public routes (no auth required)
app.use('/auth', authRoutes);

// Protected routes (auth required)
app.use('/employees', authMiddleware, employeeRoutes);
app.use('/payroll', authMiddleware, payrollRoutes);
app.use('/dashboard', authMiddleware, dashboardRoutes);

export default app;
```

---

## Step 4.2: Example Flow - ACME Company

### Scenario: ACME user logs in

**Step 1: Login Request**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "alice@acme.com",
  "password": "secret123",
  "companyId": "ACME"
}
```

**Step 2: Backend Generates JWT**
```typescript
// backend/src/routes/auth.ts
router.post('/login', async (req, res) => {
  const { email, password, companyId } = req.body;

  // Verify password (simplified)
  if (password !== 'secret123') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = generateToken({
    userId: 'USER-ACME-001',
    companyId: 'ACME',  // ← Company embedded here
    email,
    role: 'HR_ADMIN',
  });

  res.json({
    token,
    user: {
      userId: 'USER-ACME-001',
      companyId: 'ACME',
      email,
      role: 'HR_ADMIN',
    },
  });
});
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU0VSLUFDTE0LTAwMSIsImNvbXBhbnlJZCI6IkFDTUUiLCJlbWFpbCI6ImFsaWNlQGFjbWUuY29tIiwicm9sZSI6IkhSX0FETUlOIiwiaWF0IjoxNjg4MDAwMDAwLCJleHAiOjE2ODgwODY0MDB9.xxx",
  "user": {
    "userId": "USER-ACME-001",
    "companyId": "ACME",
    "email": "alice@acme.com",
    "role": "HR_ADMIN"
  }
}
```

---

### Scenario: Frontend Stores Token and Makes Request

**Step 3: Frontend Request (with token)**
```bash
GET /employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU0VSLUFDTE0LTAwMSIsImNvbXBhbnlJZCI6IkFDTUUiLCJlbWFpbCI6ImFsaWNlQGFjbWUuY29tIiwicm9sZSI6IkhSX0FETUlOIiwiaWF0IjoxNjg4MDAwMDAwLCJleHAiOjE2ODgwODY0MDB9.xxx
```

---

### Scenario: Backend Middleware Processes Token

**Step 4: Middleware Extracts & Sets Context**
```typescript
// authMiddleware runs:
// 1. Decode JWT → { userId: 'USER-ACME-001', companyId: 'ACME', ... }
// 2. Set context: companyContext.run({ companyId: 'ACME', userId: 'USER-ACME-001' }, () => next())
// 3. Call next() with context active
```

---

### Scenario: Route Handler Queries Employees

**Step 5: Employee Query (auto-filtered)**
```typescript
// backend/src/routes/employees.ts

router.get('/', async (req, res) => {
  // Query WITHOUT specifying companyId
  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { employeeId: 'asc' },
  });

  // ← Prisma extension INTERCEPTS this query
  // ← Automatically adds: WHERE companyId = 'ACME'
  // ← So it becomes:
  // SELECT * FROM Employee 
  // WHERE companyId = 'ACME' 
  // ORDER BY employeeId ASC

  res.json(employees);
});
```

**Result: Returns only ACME employees**
```json
{
  "data": [
    {
      "id": 1,
      "companyId": "ACME",
      "employeeId": "EMP-ACME-001",
      "name": "Alice Johnson",
      "email": "alice@acme.com",
      "department": { "id": "DEPT-ACME-HR", "name": "HR" }
    },
    {
      "id": 2,
      "companyId": "ACME",
      "employeeId": "EMP-ACME-002",
      "name": "Bob Smith",
      "email": "bob@acme.com",
      "department": { "id": "DEPT-ACME-ENG", "name": "Engineering" }
    }
  ]
}
```

---

## Step 4.3: Same Request from GLOBEX User (Different Company)

**Step 1: GLOBEX User Logs In**
```bash
POST /auth/login

{
  "email": "charlie@globex.com",
  "password": "secret123",
  "companyId": "GLOBEX"
}
```

**Token Generated:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU0VSLUZMT0JFWC0wMDEiLCJjb21wYW55SWQiOiJHTE9CRVgiLCJlbWFpbCI6ImNoYXJsaWVAZ2xvYmV4LmNvbSIsInJvbGUiOiJIUl9BRE1JTiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoxNjg4MDg2NDAwfQ.xxx",
  "user": {
    "userId": "USER-GLOBEX-001",
    "companyId": "GLOBEX",
    "email": "charlie@globex.com"
  }
}
```

**Step 2: Same /employees Request**
```bash
GET /employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU0VSLUZMT0JFWC0wMDEiLCJjb21wYW55SWQiOiJHTE9CRVgiLCJlbWFpbCI6ImNoYXJsaWVAZ2xvYmV4LmNvbSIsInJvbGUiOiJIUl9BRE1JTiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoxNjg4MDg2NDAwfQ.xxx
```

**Step 3: Middleware Sets Different Context**
```typescript
// Context set to: { companyId: 'GLOBEX', userId: 'USER-GLOBEX-001' }
```

**Step 4: Same Query, Different Result**
```typescript
const employees = await prisma.employee.findMany();

// ← Automatically adds: WHERE companyId = 'GLOBEX'
// SELECT * FROM Employee WHERE companyId = 'GLOBEX'
```

**Result: Returns only GLOBEX employees**
```json
{
  "data": [
    {
      "id": 101,
      "companyId": "GLOBEX",
      "employeeId": "EMP-GLOBEX-001",
      "name": "Charlie Brown",
      "email": "charlie@globex.com",
      "department": { "id": "DEPT-GLOBEX-SALES", "name": "Sales" }
    },
    {
      "id": 102,
      "companyId": "GLOBEX",
      "employeeId": "EMP-GLOBEX-002",
      "name": "Diana Prince",
      "email": "diana@globex.com",
      "department": { "id": "DEPT-GLOBEX-SALES", "name": "Sales" }
    }
  ]
}
```

---

## ✅ Key Point: Same Code, Different Data!

Both ACME and GLOBEX use the **same endpoint code**, but get different results because the middleware automatically filters by `companyId`.

---

# PART 5: Detailed Examples

## Example 1: Create Employee (Auto-Adds companyId)

### Without Multi-Tenancy (Current)
```typescript
router.post('/', async (req, res) => {
  const employee = await prisma.employee.create({
    data: {
      employeeId: 'EMP-001',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      // ❌ No company isolation - all employees mix together
    },
  });
  res.json(employee);
});
```

**Problem:** Both ACME and GLOBEX would create EMP-001 globally!

### With Multi-Tenancy
```typescript
router.post('/', async (req, res) => {
  // ✅ Context automatically has companyId
  const employee = await prisma.employee.create({
    data: {
      // ← Prisma extension AUTOMATICALLY adds:
      // companyId: getCurrentCompanyId()  // "ACME"
      
      employeeId: 'EMP-001',  // Unique within ACME, not globally
      name: 'Alice Johnson',
      email: 'alice@acme.com',
    },
  });

  // ← Created as: { companyId: "ACME", employeeId: "EMP-001", ... }
  
  res.json(employee);
});
```

**Result:** 
- ACME user creates: `{ companyId: "ACME", employeeId: "EMP-001", ... }`
- GLOBEX user can create same `employeeId: "EMP-001"` because it's unique per company!
- Database stores both:
  ```sql
  SELECT * FROM Employee WHERE employeeId = 'EMP-001';
  -- Returns:
  -- (1, ACME, EMP-001, alice@acme.com)
  -- (101, GLOBEX, EMP-001, alice@globex.com)
  ```

---

## Example 2: Get Payroll for Current Month

### Without Multi-Tenancy
```typescript
router.get('/current-month', async (req, res) => {
  const payroll = await prisma.payroll.findMany({
    where: {
      payrollPeriod: 'June 2026',
    },
    include: {
      payrollBreakdowns: { include: { employee: true } },
    },
  });

  // ❌ Returns payroll from ALL companies for June!
  // Result: ACME + GLOBEX + INITECH data mixed together
  
  res.json(payroll);
});
```

### With Multi-Tenancy
```typescript
router.get('/current-month', async (req, res) => {
  const payroll = await prisma.payroll.findMany({
    where: {
      payrollPeriod: 'June 2026',
      // ← Prisma extension AUTOMATICALLY adds:
      // companyId: getCurrentCompanyId()  // "ACME" for ACME user
    },
    include: {
      payrollBreakdowns: { include: { employee: true } },
    },
  });

  // ✅ Returns ONLY ACME payroll for June
  // Becomes SQL:
  // SELECT * FROM Payroll 
  // WHERE payrollPeriod = 'June 2026' AND companyId = 'ACME'
  // JOIN PayrollBreakdown WHERE companyId = 'ACME'
  
  res.json(payroll);
});
```

**ACME Result:**
```json
{
  "data": [
    {
      "id": 1,
      "companyId": "ACME",
      "payrollId": "PAY-ACME-2026-06",
      "payrollPeriod": "June 2026",
      "totalAmount": 2500000,
      "payrollBreakdowns": [
        {
          "id": 1,
          "companyId": "ACME",
          "employeeId": 1,
          "netSalary": 55000,
          "employee": { "employeeId": "EMP-ACME-001", "name": "Alice" }
        },
        {
          "id": 2,
          "companyId": "ACME",
          "employeeId": 2,
          "netSalary": 45000,
          "employee": { "employeeId": "EMP-ACME-002", "name": "Bob" }
        }
      ]
    }
  ]
}
```

**GLOBEX Result (same code):**
```json
{
  "data": [
    {
      "id": 101,
      "companyId": "GLOBEX",
      "payrollId": "PAY-GLOBEX-2026-06",
      "payrollPeriod": "June 2026",
      "totalAmount": 1800000,
      "payrollBreakdowns": [
        {
          "id": 101,
          "companyId": "GLOBEX",
          "employeeId": 101,
          "netSalary": 60000,
          "employee": { "employeeId": "EMP-GLOBEX-001", "name": "Charlie" }
        }
      ]
    }
  ]
}
```

---

## Example 3: Update Department

### Without Multi-Tenancy (Data Leakage Risk)
```typescript
router.put('/:deptId', async (req, res) => {
  const dept = await prisma.department.update({
    where: { id: req.params.deptId },
    data: { name: req.body.name },
  });

  // ❌ DANGER: If ACME user knows GLOBEX's deptId,
  // they can update GLOBEX department!
  
  res.json(dept);
});
```

### With Multi-Tenancy (Protected)
```typescript
router.put('/:deptId', async (req, res) => {
  const dept = await prisma.department.update({
    where: {
      id: req.params.deptId,
      // ← Prisma extension AUTOMATICALLY adds:
      // companyId: getCurrentCompanyId()  // "ACME"
    },
    data: { name: req.body.name },
  });

  // ✅ SAFE: Can only update ACME departments!
  // If user tries GLOBEX deptId, query fails because:
  // WHERE id = 'DEPT-GLOBEX-HR' AND companyId = 'ACME'
  // → No match found → Returns 404
  
  res.json(dept);
});
```

**SQL:**
```sql
UPDATE Department 
SET name = 'Human Resources'
WHERE id = 'DEPT-ACME-HR' AND companyId = 'ACME'
-- ✅ Success: Updates ACME HR department

UPDATE Department 
SET name = 'Human Resources'
WHERE id = 'DEPT-GLOBEX-HR' AND companyId = 'ACME'
-- ❌ Fails: No rows affected (GLOBEX data protected)
```

---

## Example 4: Generate Payslip (Complex Query)

### Without Multi-Tenancy
```typescript
router.get('/payslip/:payrollId/:employeeId', async (req, res) => {
  const breakdown = await prisma.payrollBreakdown.findFirst({
    where: {
      payrollId: parseInt(req.params.payrollId),
      employeeId: parseInt(req.params.employeeId),
    },
    include: {
      payroll: true,
      employee: { include: { bankAccounts: true } },
      payrollComponentBreakdowns: {
        include: { salaryComponent: true },
      },
    },
  });

  // ❌ Returns data from ANY company if IDs known
  
  res.json(breakdown);
});
```

### With Multi-Tenancy
```typescript
router.get('/payslip/:payrollId/:employeeId', async (req, res) => {
  const breakdown = await prisma.payrollBreakdown.findFirst({
    where: {
      payrollId: parseInt(req.params.payrollId),
      employeeId: parseInt(req.params.employeeId),
      // ← Prisma extension AUTOMATICALLY adds:
      // companyId: getCurrentCompanyId()  // "ACME"
    },
    include: {
      payroll: true,  // Also filtered by companyId automatically
      employee: { include: { bankAccounts: true } },  // Also filtered
      payrollComponentBreakdowns: {
        include: { salaryComponent: true },  // Also filtered
      },
    },
  });

  // ✅ SAFE: All related tables automatically filtered by ACME
  // Even if GLOBEX user guesses the IDs, they get nothing!
  
  res.json(breakdown);
});
```

**SQL (Automatic):**
```sql
SELECT pb.* FROM PayrollBreakdown pb
WHERE pb.payrollId = 5 
  AND pb.employeeId = 2 
  AND pb.companyId = 'ACME'  -- ← Auto-added
JOIN Payroll p ON pb.payrollId = p.id 
  AND p.companyId = 'ACME'  -- ← Auto-added
JOIN Employee e ON pb.employeeId = e.id 
  AND e.companyId = 'ACME'  -- ← Auto-added
```

---

# PART 6: Complete Request/Response Flow

## End-to-End: ACME Gets Dashboard Data

### Step 1: Frontend Login (ACME User)
```bash
POST /auth/login
{
  "email": "alice@acme.com",
  "companyId": "ACME"
}

Response:
{
  "token": "JWT_TOKEN_WITH_ACME_COMPANYID",
  "user": { "companyId": "ACME" }
}
```

### Step 2: Frontend Stores Token
```typescript
// Frontend: store token in localStorage
localStorage.setItem('authToken', 'JWT_TOKEN_WITH_ACME_COMPANYID');
```

### Step 3: Frontend Makes Dashboard Request
```bash
GET /dashboard
Authorization: Bearer JWT_TOKEN_WITH_ACME_COMPANYID
```

### Step 4: Backend Process
```typescript
// 1. authMiddleware intercepts request
// 2. Decode JWT → { companyId: 'ACME', userId: 'USER-001', ... }
// 3. Set context: companyContext.run({ companyId: 'ACME' }, () => next())

// 4. Dashboard route handler:
router.get('/dashboard', async (req, res) => {
  // Query 1: Get recent payrolls
  const payrolls = await prisma.payroll.findMany({
    // ← Auto-filtered: companyId = 'ACME'
    where: { status: 'COMPLETED' },
    take: 5,
  });

  // Query 2: Get summary data
  const totalEmployees = await prisma.employee.count({
    // ← Auto-filtered: companyId = 'ACME'
    where: { status: 'ACTIVE' },
  });

  // Query 3: Get attendance summary
  const attendance = await prisma.attendance.groupBy({
    // ← Auto-filtered: companyId = 'ACME'
    by: ['status'],
    where: { attendanceDate: { gte: new Date('2026-06-01') } },
    _count: { id: true },
  });

  res.json({
    summaryCards: [
      { label: 'Total Employees', value: totalEmployees },
      { label: 'Recent Payrolls', value: payrolls.length },
    ],
    recentPayrolls: payrolls,
    attendance,
    meta: { appliedCompany: 'ACME' },
  });
});
```

### Step 5: Response (ACME Data Only)
```json
{
  "summaryCards": [
    { "label": "Total Employees", "value": 100 },
    { "label": "Recent Payrolls", "value": 5 }
  ],
  "recentPayrolls": [
    {
      "companyId": "ACME",
      "payrollId": "PAY-ACME-2026-06",
      "totalAmount": 2500000
    }
  ],
  "meta": { "appliedCompany": "ACME" }
}
```

---

## Same Dashboard for GLOBEX User

```bash
POST /auth/login
{
  "email": "charlie@globex.com",
  "companyId": "GLOBEX"
}

Response:
{
  "token": "JWT_TOKEN_WITH_GLOBEX_COMPANYID",
  "user": { "companyId": "GLOBEX" }
}
```

**Same GET /dashboard Request → Different Data**
```json
{
  "summaryCards": [
    { "label": "Total Employees", "value": 50 },
    { "label": "Recent Payrolls", "value": 3 }
  ],
  "recentPayrolls": [
    {
      "companyId": "GLOBEX",
      "payrollId": "PAY-GLOBEX-2026-06",
      "totalAmount": 1800000
    }
  ],
  "meta": { "appliedCompany": "GLOBEX" }
}
```

---

# PART 7: Security Features

## Feature 1: Query Interception Prevents Data Leakage

```typescript
// Even if code tries to query without companyId:
const all = await prisma.employee.findMany();
// Becomes: SELECT * FROM Employee WHERE companyId = 'ACME'
// Cannot bypass!

// Even with explicit different companyId:
const globex = await prisma.employee.findMany({
  where: { companyId: 'GLOBEX' }
});
// Becomes: SELECT * FROM Employee 
// WHERE companyId = 'GLOBEX' AND companyId = 'ACME'
// → Returns 0 rows (contradictory WHERE clause)
```

## Feature 2: JWT Token Validation

```typescript
// Invalid token → No context set → Error on first query
const employees = await prisma.employee.findMany();
// Throws: "Company context not initialized"

// Expired token → Middleware rejects before reaching handler
// → Returns 401 Unauthorized
```

## Feature 3: Unique Constraints Per Company

```sql
-- UNIQUE (companyId, employeeId) means:
-- ACME can have EMP-001
-- GLOBEX can also have EMP-001
-- But within ACME, no duplicate EMP-001

INSERT INTO Employee (companyId, employeeId, name) 
VALUES ('ACME', 'EMP-001', 'Alice');
-- ✅ Success

INSERT INTO Employee (companyId, employeeId, name) 
VALUES ('ACME', 'EMP-001', 'Bob');
-- ❌ Duplicate key error

INSERT INTO Employee (companyId, employeeId, name) 
VALUES ('GLOBEX', 'EMP-001', 'Charlie');
-- ✅ Success (different company)
```

---

# PART 8: Testing Multi-Tenancy

```typescript
// backend/test/multi-tenancy.test.ts

import { companyContext } from '../src/lib/tenancy-context';
import { prisma } from '../src/lib/prisma-extended';

describe('Multi-Tenancy', () => {
  test('ACME queries return only ACME data', async () => {
    // Set ACME context
    let result: any;
    await new Promise((resolve) => {
      companyContext.run({ companyId: 'ACME', userId: 'user1' }, async () => {
        result = await prisma.employee.findMany();
        resolve(null);
      });
    });

    // All results should have companyId = 'ACME'
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ companyId: 'ACME' }),
      ])
    );
    expect(result.some((e: any) => e.companyId !== 'ACME')).toBe(false);
  });

  test('GLOBEX and ACME data are isolated', async () => {
    let acmeEmployees: any;
    let globexEmployees: any;

    // Get ACME employees
    await new Promise((resolve) => {
      companyContext.run({ companyId: 'ACME', userId: 'user1' }, async () => {
        acmeEmployees = await prisma.employee.findMany();
        resolve(null);
      });
    });

    // Get GLOBEX employees
    await new Promise((resolve) => {
      companyContext.run({ companyId: 'GLOBEX', userId: 'user2' }, async () => {
        globexEmployees = await prisma.employee.findMany();
        resolve(null);
      });
    });

    // Should be different
    expect(acmeEmployees.length).not.toBe(globexEmployees.length);
    expect(acmeEmployees[0]?.companyId).toBe('ACME');
    expect(globexEmployees[0]?.companyId).toBe('GLOBEX');
  });

  test('Cross-company update fails', async () => {
    await new Promise((resolve) => {
      companyContext.run({ companyId: 'ACME', userId: 'user1' }, async () => {
        // Try to update GLOBEX department from ACME context
        const result = await prisma.department.updateMany({
          where: { id: 'DEPT-GLOBEX-HR' },
          data: { name: 'Changed' },
        });

        // Should update 0 rows (GLOBEX dept protected from ACME context)
        expect(result.count).toBe(0);
        resolve(null);
      });
    });
  });
});
```

---

# Summary: How It All Works

| Component | What It Does | Example |
|-----------|-------------|---------|
| **JWT Token** | Embeds `companyId` in signed token | `{ companyId: "ACME", userId: "USER-001" }` |
| **Auth Middleware** | Extracts `companyId` from JWT, sets context | Sets `companyContext` to "ACME" |
| **Tenancy Context** | Thread-safe storage of current company | `getCurrentCompanyId()` returns "ACME" |
| **Prisma Extension** | Intercepts all queries, auto-adds WHERE companyId | `findMany()` → `WHERE companyId = 'ACME'` |
| **Database Uniqueness** | Enforces unique per company, not globally | Can have EMP-001 in both ACME and GLOBEX |

**Result:** Same code, different data for each company!


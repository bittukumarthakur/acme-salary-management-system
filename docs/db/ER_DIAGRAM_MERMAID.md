# Salary Management Portal - Entity Relationship Diagram

```mermaid
erDiagram
    COMPANY ||--o{ TAXSLAB : has
    COMPANY ||--o{ DEPARTMENT : has
    COMPANY ||--o{ LEAVETYPE : defines
    
    DEPARTMENT ||--o{ EMPLOYEE : contains
    DEPARTMENT ||--o{ DESIGNATION : has
    DESIGNATION ||--o{ SALARYGRADE : links
    DESIGNATION ||--o{ EMPLOYEE : assigns
    
    EMPLOYEE ||--o{ EMPLOYEESALARYSTRUCTURE : has
    EMPLOYEE ||--o{ EMPLOYEESALARYCOMPONENT : has
    EMPLOYEE ||--o{ BANKACCOUNT : has
    EMPLOYEE ||--o{ ATTENDANCE : has
    EMPLOYEE ||--o{ LEAVEREQUEST : submits
    EMPLOYEE ||--o{ LEAVEBALANCE : tracks
    EMPLOYEE ||--o{ PAYROLLBREAKDOWN : included_in
    EMPLOYEE ||--o{ SALARYCHANGEHISTORY : tracked_in
    
    SALARYCOMPONENT ||--o{ EMPLOYEESALARYCOMPONENT : assigned_to
    SALARYCOMPONENT ||--o{ PAYROLLCOMPONENTBREAKDOWN : calculated_in
    SALARYCOMPONENT ||--o{ PAYROLLTEMPLATECOMPONENT : mapped_to
    
    PAYROLL ||--o{ PAYROLLBREAKDOWN : contains
    PAYROLL ||--o{ PAYROLLAUDIT : tracked_in
    
    PAYROLLBREAKDOWN ||--o{ PAYROLLCOMPONENTBREAKDOWN : breaks_down_to
    
    LEAVETYPE ||--o{ LEAVEBALANCE : tracked_in
    LEAVETYPE ||--o{ LEAVEREQUEST : requested_for
    
    PAYROLLTEMPLATE ||--o{ PAYROLLTEMPLATECOMPONENT : includes

    COMPANY {
        string id PK
        string name
        string registrationNumber
        string taxId
        string country
        string currency
        int financialYearStart
        int financialYearEnd
        datetime createdAt
    }
    
    DEPARTMENT {
        string id PK
        string name
        text description
        int managerEmployeeId FK
        datetime createdAt
    }
    
    DESIGNATION {
        string id PK
        string title
        text description
        int level
        string salaryGrade FK
        datetime createdAt
    }
    
    SALARYGRADE {
        string id PK
        string name
        float minSalary
        float maxSalary
        text description
        datetime createdAt
    }
    
    EMPLOYEE {
        int id PK
        string employeeId
        string name
        string email
        string phoneNumber
        date dateOfBirth
        string gender
        string country FK
        string department FK
        string designation FK
        string employmentType
        datetime joiningDate
        string status
        int bankAccountId FK
        datetime createdAt
        datetime updatedAt
    }
    
    SALARYCOMPONENT {
        string id PK
        string name
        string type
        string calculationType
        int displayOrder
        boolean isActive
        datetime createdAt
    }
    
    EMPLOYEESALARYSTRUCTURE {
        int id PK
        int employeeId FK
        float baseSalary
        date effectiveDate
        date endDate
        string currency
        datetime createdAt
        datetime updatedAt
    }
    
    EMPLOYEESALARYCOMPONENT {
        int id PK
        int employeeId FK
        string salaryComponentId FK
        float amount
        date effectiveDate
        date endDate
        text remarks
        datetime createdAt
    }
    
    BANKACCOUNT {
        int id PK
        int employeeId FK
        string bankName
        string accountNumber
        string ifscCode
        string accountHolderName
        string accountType
        boolean isPrimary
        boolean isActive
        datetime createdAt
    }
    
    PAYMENTMODE {
        string id PK
        string name
        text description
        boolean isActive
    }
    
    ATTENDANCE {
        int id PK
        int employeeId FK
        date attendanceDate
        string status
        float hoursWorked
        text remarks
        datetime createdAt
        int createdBy FK
    }
    
    LEAVETYPE {
        string id PK
        string name
        int allocatedDaysPerYear
        boolean isEncashed
        boolean isCarryForward
        int maxCarryForwardDays
        datetime createdAt
    }
    
    LEAVEBALANCE {
        int id PK
        int employeeId FK
        string leaveTypeId FK
        int year
        int allocatedDays
        int usedDays
        int availableDays
        int carriedForwardDays
        datetime createdAt
    }
    
    LEAVEREQUEST {
        int id PK
        int employeeId FK
        string leaveTypeId FK
        date startDate
        date endDate
        int daysRequested
        text reason
        string status
        int approverEmployeeId FK
        datetime approvedDate
        datetime createdAt
    }
    
    PAYROLL {
        int id PK
        string payrollId
        string payrollPeriod
        datetime payoutDate
        string status
        float totalAmount
        float totalDeductions
        float netAmount
        string currency
        string country
        datetime createdAt
        datetime updatedAt
    }
    
    PAYROLLBREAKDOWN {
        int id PK
        int payrollId FK
        int employeeId FK
        float baseSalary
        float earnings
        float deductions
        float netSalary
        int daysWorked
        float attendancePercentage
        string paymentStatus
        string bankTransactionId
        datetime createdAt
    }
    
    PAYROLLCOMPONENTBREAKDOWN {
        int id PK
        int payrollBreakdownId FK
        string salaryComponentId FK
        float amount
        datetime createdAt
    }
    
    PAYROLLTEMPLATE {
        string id PK
        string name
        string employmentType
        text description
        boolean isActive
        datetime createdAt
    }
    
    PAYROLLTEMPLATECOMPONENT {
        int id PK
        string payrollTemplateId FK
        string salaryComponentId FK
        boolean isIncluded
        int calculationOrder
        datetime createdAt
    }
    
    PAYROLLAUDIT {
        int id PK
        int payrollId FK
        string action
        int performedBy FK
        json previousValues
        json newValues
        text reason
        datetime createdAt
    }
    
    TAXSLAB {
        int id PK
        string country FK
        int financialYear
        float minSalary
        float maxSalary
        float taxRate
        datetime createdAt
    }
    
    SALARYCHANGEHISTORY {
        int id PK
        int employeeId FK
        date effectiveDate
        float previousBaseSalary
        float newBaseSalary
        string changeType
        text reason
        int approvedBy FK
        datetime createdAt
    }
```

---

## Diagram Legend

**Relationships:**
- `||--o{` = One-to-Many (One entity relates to many other entities)
- `||--||` = One-to-One (One entity relates to exactly one other entity)
- `o{` = Many (multiple records)
- `||` = One (single record)

**Example:**
- `COMPANY ||--o{ DEPARTMENT : has` = One company has many departments
- `EMPLOYEE ||--o{ PAYROLLBREAKDOWN : included_in` = One employee included in many payroll breakdowns
- `PAYROLL ||--o{ PAYROLLBREAKDOWN : contains` = One payroll contains many payroll breakdowns

---

## Data Flow Example

### Monthly Payroll Processing Flow

```
1. Company setup (COMPANY, DEPARTMENT, DESIGNATION, SALARYGRADE, TAXSLAB)
                ↓
2. Hire Employee (EMPLOYEE with BANKACCOUNT)
                ↓
3. Setup Salary (EMPLOYEESALARYSTRUCTURE, EMPLOYEESALARYCOMPONENT)
                ↓
4. Track Attendance (ATTENDANCE)
                ↓
5. Mark Leaves (LEAVEREQUEST → LEAVEBALANCE updates)
                ↓
6. Generate Payroll (PAYROLL → PAYROLLBREAKDOWN)
                ↓
7. Calculate Components (PAYROLLCOMPONENTBREAKDOWN)
                ↓
8. Audit & Payment (PAYROLLAUDIT → BANKACCOUNT payment via PAYMENTMODE)
                ↓
9. Employee Payslip (from PAYROLLBREAKDOWN + PAYROLLCOMPONENTBREAKDOWN)
```

---

## Key Table Clusters

### Cluster 1: Organizational Setup
```
COMPANY
├── DEPARTMENT
├── DESIGNATION
├── SALARYGRADE
└── LEAVETYPE
```

### Cluster 2: Employee Management
```
EMPLOYEE (core)
├── EMPLOYEESALARYSTRUCTURE
├── EMPLOYEESALARYCOMPONENT
├── BANKACCOUNT
├── ATTENDANCE
├── LEAVEBALANCE
└── LEAVEREQUEST
```

### Cluster 3: Salary Calculation
```
SALARYCOMPONENT
├── EMPLOYEESALARYCOMPONENT
├── PAYROLLCOMPONENTBREAKDOWN
└── PAYROLLTEMPLATECOMPONENT
```

### Cluster 4: Payroll Processing
```
PAYROLL (monthly aggregate)
├── PAYROLLBREAKDOWN (per employee)
│   └── PAYROLLCOMPONENTBREAKDOWN (per component)
├── PAYROLLAUDIT (change tracking)
└── TAXSLAB (tax calculation)
```

### Cluster 5: History & Audit
```
PAYROLLAUDIT
└── SALARYCHANGEHISTORY
```

---

## Query Examples

**Get Employee Payslip:**
```sql
SELECT 
  e.employeeId,
  e.name,
  pb.baseSalary,
  pcb.salaryComponentId,
  pcb.amount,
  pb.netSalary
FROM PAYROLLBREAKDOWN pb
JOIN EMPLOYEE e ON pb.employeeId = e.id
JOIN PAYROLLCOMPONENTBREAKDOWN pcb ON pb.id = pcb.payrollBreakdownId
WHERE pb.payrollId = 'PAY-2026-06' AND e.employeeId = 'EMP-001'
```

**Get Employee Leave Balance:**
```sql
SELECT 
  e.name,
  lt.name as leaveType,
  lb.allocatedDays,
  lb.usedDays,
  lb.availableDays
FROM LEAVEBALANCE lb
JOIN EMPLOYEE e ON lb.employeeId = e.id
JOIN LEAVETYPE lt ON lb.leaveTypeId = lt.id
WHERE lb.year = 2026 AND e.employeeId = 'EMP-001'
```

**Get Total Monthly Payroll:**
```sql
SELECT 
  p.payrollId,
  p.payrollPeriod,
  SUM(pb.baseSalary) as totalBaseSalary,
  SUM(pb.earnings) as totalEarnings,
  SUM(pb.deductions) as totalDeductions,
  SUM(pb.netSalary) as totalNetSalary
FROM PAYROLL p
JOIN PAYROLLBREAKDOWN pb ON p.id = pb.payrollId
GROUP BY p.id, p.payrollId, p.payrollPeriod
```

**Get Attendance Summary:**
```sql
SELECT 
  e.name,
  COUNT(*) as totalDays,
  SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as presentDays,
  (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as attendancePercentage
FROM ATTENDANCE a
JOIN EMPLOYEE e ON a.employeeId = e.id
WHERE MONTH(a.attendanceDate) = 6 AND YEAR(a.attendanceDate) = 2026
GROUP BY e.id, e.name
```

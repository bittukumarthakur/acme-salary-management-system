-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('EARNING', 'ALLOWANCE', 'DEDUCTION', 'TAX');

-- CreateEnum
CREATE TYPE "CalculationType" AS ENUM ('FIXED', 'PERCENTAGE', 'FORMULA');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CURRENT', 'NRI');

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL DEFAULT 'SAVINGS',
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerEmployeeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "country" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'PERMANENT',
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatarUrl" TEXT,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll" (
    "id" SERIAL NOT NULL,
    "payrollId" TEXT NOT NULL,
    "payrollPeriod" TEXT NOT NULL,
    "payoutDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "country" TEXT NOT NULL DEFAULT 'IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ComponentType" NOT NULL,
    "calculationType" "CalculationType" NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_structure" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salary_structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_component" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "salaryComponentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salary_component_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_account_employeeId_idx" ON "bank_account"("employeeId");

-- CreateIndex
CREATE INDEX "bank_account_isActive_idx" ON "bank_account"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");

-- CreateIndex
CREATE INDEX "department_name_idx" ON "department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "designation_title_key" ON "designation"("title");

-- CreateIndex
CREATE INDEX "designation_title_idx" ON "designation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "employee_employeeId_key" ON "employee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- CreateIndex
CREATE INDEX "employee_departmentId_idx" ON "employee"("departmentId");

-- CreateIndex
CREATE INDEX "employee_designationId_idx" ON "employee"("designationId");

-- CreateIndex
CREATE INDEX "employee_status_idx" ON "employee"("status");

-- CreateIndex
CREATE INDEX "employee_name_idx" ON "employee"("name");

-- CreateIndex
CREATE INDEX "employee_email_idx" ON "employee"("email");

-- CreateIndex
CREATE INDEX "employee_employeeId_idx" ON "employee"("employeeId");

-- CreateIndex
CREATE INDEX "employee_country_idx" ON "employee"("country");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_payrollId_key" ON "payroll"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_payrollId_idx" ON "payroll"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_payrollPeriod_idx" ON "payroll"("payrollPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "salary_component_name_key" ON "salary_component"("name");

-- CreateIndex
CREATE INDEX "salary_component_name_idx" ON "salary_component"("name");

-- CreateIndex
CREATE INDEX "salary_component_type_idx" ON "salary_component"("type");

-- CreateIndex
CREATE INDEX "salary_component_isActive_idx" ON "salary_component"("isActive");

-- CreateIndex
CREATE INDEX "employee_salary_structure_employeeId_idx" ON "employee_salary_structure"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_structure_effectiveDate_idx" ON "employee_salary_structure"("effectiveDate");

-- CreateIndex
CREATE INDEX "employee_salary_structure_endDate_idx" ON "employee_salary_structure"("endDate");

-- CreateIndex
CREATE INDEX "employee_salary_component_employeeId_idx" ON "employee_salary_component"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_component_salaryComponentId_idx" ON "employee_salary_component"("salaryComponentId");

-- CreateIndex
CREATE INDEX "employee_salary_component_effectiveDate_idx" ON "employee_salary_component"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salary_component_employeeId_salaryComponentId_effe_key" ON "employee_salary_component"("employeeId", "salaryComponentId", "effectiveDate");

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_managerEmployeeId_fkey" FOREIGN KEY ("managerEmployeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_structure" ADD CONSTRAINT "employee_salary_structure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_component" ADD CONSTRAINT "employee_salary_component_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_component" ADD CONSTRAINT "employee_salary_component_salaryComponentId_fkey" FOREIGN KEY ("salaryComponentId") REFERENCES "salary_component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/**
 * Employee Data Seeder
 *
 * Seeds employee-related tables (requires master data to exist first):
 * 1. Employee
 * 2. EmployeeSalaryStructure
 * 3. EmployeeSalaryComponent
 * 4. BankAccount
 *
 * Run this AFTER seeding master data with seed:master
 * Usage: tsx scripts/seedEmployees.ts
 */

import { faker } from '@faker-js/faker';
import { prisma } from '../lib/prisma';
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_WEIGHTS,
  STATUS_OPTIONS,
  STATUS_WEIGHTS,
  GENDERS,
  BANK_ACCOUNT_TYPES,
  selectWeighted,
  generateSalaryForDepartment,
  generateIFSC,
} from './seedingConfig';
import { BANKS } from './masterData';
import { ESI_RATE, PF_RATE } from '../src/utils/salaryCalculation';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const TOTAL_EMPLOYEES = 100;
export const BATCH_SIZE = 50;

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedEmployees() {
  console.log(`👥 Seeding ${TOTAL_EMPLOYEES.toLocaleString()} employees...`);

  const departments = await prisma.department.findMany();
  const designations = await prisma.designation.findMany();

  if (departments.length === 0) {
    throw new Error('❌ No departments found. Run seed:master first!');
  }

  if (designations.length === 0) {
    throw new Error('❌ No designations found. Run seed:master first!');
  }

  // Find the highest existing employee ID to support incremental seeding
  const lastEmployee = await prisma.employee.findFirst({
    orderBy: { employeeId: 'desc' },
    take: 1,
  });

  let startFromId = 1;
  if (lastEmployee) {
    // Extract number from employeeId format: "EMP00123" -> 123
    const lastIdNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
    startFromId = lastIdNumber + 1;
    console.log(`ℹ️  Found existing employees. Continuing from ID: EMP${String(startFromId).padStart(5, '0')}\n`);
  } else {
    console.log(`ℹ️  No existing employees found. Starting from ID: EMP00001\n`);
  }

  let insertedCount = 0;

  for (let batchStart = 0; batchStart < TOTAL_EMPLOYEES; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_EMPLOYEES);
    const employeesData = [];

    for (let i = batchStart; i < batchEnd; i += 1) {
      const currentEmployeeNumber = startFromId + i;
      const employeeId = `EMP${String(currentEmployeeNumber).padStart(5, '0')}`;
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const randomDept = faker.helpers.arrayElement(departments);
      const randomDesig = faker.helpers.arrayElement(designations);

      employeesData.push({
        employeeId,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${currentEmployeeNumber}@acme.com`,
        phoneNumber: faker.phone.number('+91-##########'),
        dateOfBirth: faker.date.birthdate({ min: 20, max: 60, mode: 'age' }),
        gender: faker.helpers.arrayElement(GENDERS),
        country: 'India',
        departmentId: randomDept.id,
        designationId: randomDesig.id,
        employmentType: selectWeighted(EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_WEIGHTS),
        joiningDate: faker.date.between({
          from: new Date('2015-01-01'),
          to: new Date('2026-06-01'),
        }),
        status: selectWeighted(STATUS_OPTIONS, STATUS_WEIGHTS),
        avatarUrl: `https://i.pravatar.cc/150?img=${currentEmployeeNumber}`,
        basicSalary: generateSalaryForDepartment(randomDept.id),
        currency: 'INR',
      });
    }

    await prisma.employee.createMany({ data: employeesData });
    insertedCount += employeesData.length;
    console.log(`  → Inserted ${insertedCount.toLocaleString()} employees (total in database: ${(startFromId - 1 + insertedCount).toLocaleString()})`);
  }

  console.log(`✅ Created ${insertedCount.toLocaleString()} new employees`);
}

async function seedEmployeeSalaryStructures() {
  console.log('📊 Seeding employee salary structures...');

  const employees = await prisma.employee.findMany({
    select: { id: true, basicSalary: true, currency: true },
  });

  const salaryStructures = employees.map((emp) => ({
    employeeId: emp.id,
    basicSalary: emp.basicSalary,
    effectiveDate: new Date('2024-01-01'),
    currency: emp.currency,
  }));

  let insertedCount = 0;
  for (let i = 0; i < salaryStructures.length; i += BATCH_SIZE) {
    const batch = salaryStructures.slice(i, i + BATCH_SIZE);
    await prisma.employeeSalaryStructure.createMany({ data: batch });
    insertedCount += batch.length;
    console.log(`  → Inserted ${insertedCount.toLocaleString()} / ${salaryStructures.length.toLocaleString()} salary structures`);
  }

  console.log(`✅ Created ${insertedCount.toLocaleString()} salary structures`);
}

async function seedEmployeeSalaryComponents() {
  console.log('🔗 Seeding employee salary components...');

  const employees = await prisma.employee.findMany({ select: { id: true, basicSalary: true } });
  const components = await prisma.salaryComponent.findMany();

  const salaryComponentMappings: Array<{
    employeeId: number;
    salaryComponentId: string;
    amount: number;
    effectiveDate: Date;
  }> = [];

  // Assign components to each employee
  for (const emp of employees) {
    for (const comp of components) {
      let amount = 0;

      // Calculate amounts based on component type
      if (comp.name === 'Allowances') {
        amount = emp.basicSalary * 0.1; // 10% of basic
      } else if (comp.name === 'PF') {
        amount = emp.basicSalary * PF_RATE; // 12% of basic
      } else if (comp.name === 'ESI') {
        amount = emp.basicSalary * ESI_RATE; // 0.75% of basic
      }

      salaryComponentMappings.push({
        employeeId: emp.id,
        salaryComponentId: comp.id,
        amount: Math.round(amount),
        effectiveDate: new Date('2024-01-01'),
      });
    }
  }

  let insertedCount = 0;
  for (let i = 0; i < salaryComponentMappings.length; i += BATCH_SIZE) {
    const batch = salaryComponentMappings.slice(i, i + BATCH_SIZE);
    await prisma.employeeSalaryComponent.createMany({ data: batch, skipDuplicates: true });
    insertedCount += batch.length;
    if (insertedCount % (BATCH_SIZE * 10) === 0) {
      console.log(`  → Inserted ${insertedCount.toLocaleString()} / ${salaryComponentMappings.length.toLocaleString()} component mappings`);
    }
  }

  console.log(`✅ Created ${insertedCount.toLocaleString()} salary component mappings`);
}

async function seedBankAccounts() {
  console.log('🏦 Seeding bank accounts...');

  const employees = await prisma.employee.findMany({ select: { id: true } });

  const bankAccounts: Array<{
    employeeId: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    accountType: 'SAVINGS' | 'CURRENT';
    isPrimary: boolean;
    isActive: boolean;
  }> = [];

  // Create 1-3 bank accounts per employee
  for (const emp of employees) {
    const accountCount = 1; // Fixed to 1 account per employee

    for (let i = 0; i < accountCount; i += 1) {
      const bankName = faker.helpers.arrayElement(BANKS);
      bankAccounts.push({
        employeeId: emp.id,
        bankName,
        accountNumber: faker.string.numeric(16),
        ifscCode: generateIFSC(bankName),
        accountHolderName: `${emp.id}`, // Will be replaced with actual name in real scenario
        accountType: faker.helpers.arrayElement(BANK_ACCOUNT_TYPES),
        isPrimary: i === 0, // First account is primary
        isActive: true,
      });
    }
  }

  let insertedCount = 0;
  for (let i = 0; i < bankAccounts.length; i += BATCH_SIZE) {
    const batch = bankAccounts.slice(i, i + BATCH_SIZE);
    await prisma.bankAccount.createMany({ data: batch });
    insertedCount += batch.length;
    console.log(`  → Inserted ${insertedCount.toLocaleString()} / ${bankAccounts.length.toLocaleString()} bank accounts`);
  }

  console.log(`✅ Created ${insertedCount.toLocaleString()} bank accounts`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n🌱 Phase 1 Employee Seeding Started\n');

  try {
    // Clear employee-related data only (keep master data)
    console.log('🗑️  Clearing existing employee data...');
    await prisma.bankAccount.deleteMany({});
    await prisma.employeeSalaryComponent.deleteMany({});
    await prisma.employeeSalaryStructure.deleteMany({});
    await prisma.employee.deleteMany({});
    console.log('✅ Cleared all existing employee data\n');

    // Seed employees in dependency order
    await seedEmployees();
    await seedEmployeeSalaryStructures();
    await seedEmployeeSalaryComponents();
    await seedBankAccounts();

    console.log('\n✨ Employee seeding complete!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

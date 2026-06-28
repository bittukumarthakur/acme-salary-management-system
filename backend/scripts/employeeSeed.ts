/**
 * Employee Database Seeder
 *
 * Generates and inserts 10,000 realistic employee records with:
 * - Unique employee IDs and email addresses
 * - Random but realistic departments, designations, and employment types
 * - Salary ranges based on department
 * - Avatar URLs for profile pictures
 * - Joining dates spanning 2015-2026
 *
 * Usage: tsx scripts/employeeSeed.ts
 */

import { faker } from '@faker-js/faker';
import { EmployeeStatus, EmploymentType } from '../generated/prisma/enums';
import { prisma } from '../lib/prisma';
import { DEPARTMENTS, DESIGNATIONS } from './masterData';
import { generateSalaryForDepartment, selectWeighted } from './seedingConfig';

/**
 * Employment type distribution weights
 * Weights control probability: Permanent (70%), Contract (15%), Temporary (10%), Intern (5%)
 */
const EMPLOYMENT_TYPES = [
  EmploymentType.PERMANENT,
  EmploymentType.CONTRACT,
  EmploymentType.TEMPORARY,
  EmploymentType.INTERN,
] as const;
const EMPLOYMENT_TYPE_WEIGHTS = [70, 15, 10, 5] as const;

/**
 * Employee status distribution weights
 * Weights control probability: Active (85%), Inactive (5%), On Leave (5%), Terminated (5%)
 */
const STATUS_WEIGHTS = [85, 5, 5, 5] as const;

/**
 * Generate a random salary within the department's range
 */
interface GeneratedEmployee {
  employeeId: string;
  name: string;
  email: string;
  country: string;
  departmentId: string;
  designationId: string;
  employmentType: EmploymentType;
  joiningDate: Date;
  status: EmployeeStatus;
  basicSalary: number;
  currency: string;
  avatarUrl: string;
}

function generateEmployee(index: number): GeneratedEmployee {
  const employeeId = `EMP${String(index).padStart(5, '0')}`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const email = `${faker.internet.userName({ firstName, lastName })}.${index}@acme.com`.toLowerCase();
  const country = faker.location.country();
  const department = faker.helpers.arrayElement(DEPARTMENTS);
  const designation = faker.helpers.arrayElement(DESIGNATIONS);
  const employmentType = selectWeighted(EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_WEIGHTS);
  const status = selectWeighted(
    [EmployeeStatus.ACTIVE, EmployeeStatus.INACTIVE, EmployeeStatus.ON_LEAVE, EmployeeStatus.TERMINATED],
    STATUS_WEIGHTS
  );
  const joiningDate = faker.date.between({
    from: new Date('2015-01-01'),
    to: new Date('2026-06-01'),
  });
  const basicSalary = generateSalaryForDepartment(department.id);
  const currency = 'INR';
  const avatarUrl = `https://i.pravatar.cc/150?img=${index}`;

  return {
    employeeId,
    name,
    email,
    country,
    departmentId: department.id,
    designationId: designation.id,
    employmentType,
    joiningDate,
    status,
    basicSalary,
    currency,
    avatarUrl,
  };
}

/**
 * Main seed function
 */
async function main() {
  const TOTAL_EMPLOYEES = 10000;
  const BATCH_SIZE = 500;

  console.log(`🌱 Starting employee seed for ${TOTAL_EMPLOYEES.toLocaleString()} records...`);

  try {
    // Clear existing records
    const deletedCount = await prisma.employee.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.count} existing records`);

    // Seed employees in batches for better performance
    const employees: GeneratedEmployee[] = [];

    for (let index = 1; index <= TOTAL_EMPLOYEES; index += 1) {
      employees.push(generateEmployee(index));

      // Insert batch when it reaches batch size or at the end
      if (employees.length >= BATCH_SIZE || index === TOTAL_EMPLOYEES) {
        await prisma.employee.createMany({
          data: employees,
        });

        console.log(`✅ Inserted ${index.toLocaleString()} / ${TOTAL_EMPLOYEES.toLocaleString()} employees`);
        employees.length = 0;
      }
    }

    console.log(`\n✨ Employee seed complete: ${TOTAL_EMPLOYEES.toLocaleString()} records created successfully!`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

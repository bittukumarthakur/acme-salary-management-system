import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";

const COUNTRIES = [
  "USA",
  "UK",
  "India",
  "Germany",
  "Canada",
  "Australia",
  "Singapore",
  "Japan",
  "France",
  "Brazil",
];

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "Operations",
  "Legal",
  "Support",
];

const DESIGNATIONS_BY_DEPARTMENT: Record<string, string[]> = {
  Engineering: [
    "Intern",
    "Junior Engineer",
    "Software Engineer",
    "Senior Engineer",
    "Staff Engineer",
    "Tech Lead",
    "Engineering Manager",
    "Director of Engineering",
    "VP of Engineering",
    "CTO",
  ],
  Product: [
    "Product Analyst",
    "Product Manager",
    "Senior Product Manager",
    "Lead Product Manager",
    "Director of Product",
    "VP of Product",
  ],
  Design: [
    "Design Intern",
    "Junior Designer",
    "Product Designer",
    "Senior Designer",
    "Design Lead",
    "Design Manager",
    "Design Director",
  ],
  Marketing: [
    "Marketing Coordinator",
    "Marketing Specialist",
    "Marketing Manager",
    "Senior Marketing Manager",
    "Marketing Director",
    "VP of Marketing",
  ],
  Sales: [
    "Sales Representative",
    "Account Executive",
    "Sales Manager",
    "Senior Sales Manager",
    "Director of Sales",
    "VP of Sales",
  ],
  Finance: [
    "Finance Analyst",
    "Senior Finance Analyst",
    "Finance Manager",
    "Finance Director",
    "VP of Finance",
  ],
  HR: [
    "HR Coordinator",
    "HR Specialist",
    "HR Manager",
    "Senior HR Manager",
    "HR Director",
  ],
  Operations: [
    "Operations Coordinator",
    "Operations Analyst",
    "Operations Manager",
    "Senior Operations Manager",
    "Director of Operations",
  ],
  Legal: [
    "Legal Assistant",
    "Legal Counsel",
    "Senior Legal Counsel",
    "Legal Manager",
    "Director of Legal",
  ],
  Support: [
    "Support Specialist",
    "Senior Support Specialist",
    "Support Lead",
    "Support Manager",
    "Customer Support Director",
  ],
};

const EMPLOYMENT_TYPES = ["Full-Time", "Part-Time", "Contract", "Intern"];
const EMPLOYMENT_TYPE_WEIGHTS = [70, 10, 15, 5];
const STATUS_OPTIONS = ["Active", "On Leave", "Terminated"];
const STATUS_WEIGHTS = [90, 5, 5];

function randomWeighted<T>(items: readonly T[], weights: readonly number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i += 1) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }

  return items[items.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function normalizeEmail(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

async function main() {
  console.log("Starting employee seed for 10,000 records...");
  await prisma.employee.deleteMany({});

  const totalEmployees = 10000;
  const batchSize = 500;
  const employees = [] as Array<{
    employeeId: string;
    name: string;
    email: string;
    country: string;
    department: string;
    designation: string;
    employmentType: string;
    joiningDate: Date;
    status: string;
  }>;

  for (let index = 1; index <= totalEmployees; index += 1) {
    const employeeId = `EMP${String(index).padStart(5, "0")}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = `${faker.internet.userName({firstName, lastName})}.${index}@acme.com`.toLowerCase();
    const country = faker.helpers.arrayElement(COUNTRIES);
    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const designation = faker.helpers.arrayElement(DESIGNATIONS_BY_DEPARTMENT[department]);
    const employmentType = randomWeighted(EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_WEIGHTS);
    const status = randomWeighted(STATUS_OPTIONS, STATUS_WEIGHTS);
    const joiningDate = faker.date.between({
      from: new Date("2015-01-01"),
      to: new Date("2026-06-01"),
    });

    employees.push({
      employeeId,
      name,
      email,
      country,
      department,
      designation,
      employmentType,
      joiningDate,
      status,
    });

    if (employees.length >= batchSize || index === totalEmployees) {
      await prisma.employee.createMany({
        data: employees,
      });
      employees.length = 0;
      console.log(`Inserted ${index} / ${totalEmployees} employees.`);
    }
  }

  console.log("Employee seed complete: 10,000 records created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

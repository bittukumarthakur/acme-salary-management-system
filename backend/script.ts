import { prisma } from "./lib/prisma";

async function main() {
  // Create a new employee
  const employee = await prisma.employee.create({
    data: {
      employeeId: "EMP00001",
      name: "Alice Johnson",
      email: "alice.johnson@acme.com",
      country: "USA",
      department: "Engineering",
      designation: "Software Engineer",
      employmentType: "Full-Time",
      joiningDate: new Date("2021-03-15"),
      status: "Active",
    },
  });
  console.log("Created employee:", employee);

  // Fetch all employees
  const allEmployees = await prisma.employee.findMany();
  console.log("All employees:", JSON.stringify(allEmployees, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
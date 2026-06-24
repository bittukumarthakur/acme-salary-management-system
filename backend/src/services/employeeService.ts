export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  country: string;
  department: string;
  designation: string;
  employmentType: string;
  joiningDate: string;
  status: string;
}

const employees: Employee[] = [
  {
    id: 1,
    employeeId: 'EMP00001',
    name: 'Alice Johnson',
    email: 'alice.johnson@acme.com',
    country: 'USA',
    department: 'Engineering',
    designation: 'Software Engineer',
    employmentType: 'Full-Time',
    joiningDate: '2021-03-15',
    status: 'Active',
  },
  {
    id: 2,
    employeeId: 'EMP00002',
    name: 'Bob Smith',
    email: 'bob.smith@acme.com',
    country: 'UK',
    department: 'Product',
    designation: 'Product Manager',
    employmentType: 'Full-Time',
    joiningDate: '2020-07-01',
    status: 'Active',
  },
  {
    id: 3,
    employeeId: 'EMP00003',
    name: 'Priya Patel',
    email: 'priya.patel@acme.com',
    country: 'India',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    employmentType: 'Full-Time',
    joiningDate: '2019-11-20',
    status: 'Active',
  },
  {
    id: 4,
    employeeId: 'EMP00004',
    name: 'Carlos Müller',
    email: 'carlos.muller@acme.com',
    country: 'Germany',
    department: 'Design',
    designation: 'Senior Designer',
    employmentType: 'Contract',
    joiningDate: '2022-01-10',
    status: 'Active',
  },
  {
    id: 5,
    employeeId: 'EMP00005',
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@acme.com',
    country: 'Japan',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    employmentType: 'Full-Time',
    joiningDate: '2023-05-08',
    status: 'On Leave',
  },
];

export function getEmployees(): Employee[] {
  return employees;
}

export function getEmployeeById(id: string): Employee | null {
  const numericId = Number(id);

  if (!isNaN(numericId)) {
    return employees.find((e) => e.id === numericId) ?? null;
  }

  return employees.find((e) => e.employeeId === id) ?? null;
}

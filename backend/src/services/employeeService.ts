import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeRow } from '../models/employee';

function toEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    employeeId: row.employeeId,
    name: row.name,
    email: row.email,
    country: row.country,
    department: row.department,
    designation: row.designation,
    employmentType: row.employmentType,
    joiningDate: row.joiningDate.toISOString().split('T')[0] as string,
    status: row.status,
  };
}

export async function getEmployees(): Promise<Employee[]> {
  const rows = await prisma.employee.findMany({
    orderBy: { id: 'asc' },
  });

  return rows.map(toEmployee);
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  if (id === '') {
    return null;
  }

  const numericId = Number(id);
  const isNumericId = !isNaN(numericId) && Number.isInteger(numericId);

  const row = isNumericId
    ? await prisma.employee.findUnique({ where: { id: numericId } })
    : await prisma.employee.findUnique({ where: { employeeId: id } });

  return row ? toEmployee(row) : null;
}

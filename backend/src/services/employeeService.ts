import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeFilters, EmployeeQuery, EmployeeRow } from '../models/employee';
import type { PaginatedResult } from '../models/pagination';

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

// Translates domain filters into a Prisma `where` clause.
function buildWhere(filters: EmployeeFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { employeeId: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.country) where.country = filters.country;
  if (filters.department) where.department = filters.department;
  if (filters.designation) where.designation = filters.designation;
  if (filters.employmentType) where.employmentType = filters.employmentType;
  if (filters.status) where.status = filters.status;

  if (filters.joiningDateFrom || filters.joiningDateTo) {
    const range: { gte?: Date; lte?: Date } = {};
    if (filters.joiningDateFrom) range.gte = filters.joiningDateFrom;
    if (filters.joiningDateTo) range.lte = filters.joiningDateTo;
    where.joiningDate = range;
  }

  return where;
}

export async function getEmployees(query: EmployeeQuery): Promise<PaginatedResult<Employee>> {
  const { page, pageSize, sortBy, sortOrder, filters } = query;
  const where = buildWhere(filters);

  const [rows, totalItems] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.employee.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data: rows.map(toEmployee),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalItems > 0,
    },
  };
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

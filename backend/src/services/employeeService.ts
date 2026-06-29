import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeFilters, EmployeeQuery, EmployeeRow } from '../models/employee';
import type { PaginatedResult } from '../models/pagination';

function toEmployee(row: EmployeeRow): Employee {
  const date = row.joiningDate instanceof Date ? row.joiningDate : new Date();
  const joiningDateStr: string = date.toISOString().split('T')[0] as string;

  // Extract department name from related object (fallback to ID if null)
  const departmentName = row.department?.name || row.departmentId || '';

  // Extract designation title from related object (fallback to empty string if null)
  const designationTitle = row.designation?.title || '';

  const employee: Employee = {
    employeeId: row.employeeId,
    fullName: row.name,
    email: row.email,
    department: departmentName,
    designation: designationTitle,
    employmentType: row.employmentType,
    joiningDate: joiningDateStr,
    status: row.status,
    basicSalary: row.basicSalary,
    currency: row.currency,
    country: row.country,
  };

  if (row.avatarUrl) {
    employee.avatarUrl = row.avatarUrl;
  }

  return employee;
}

// Translates domain filters into a Prisma `where` clause.
// Phase 1: Updated to use department relationship instead of enum.
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
  if (filters.department) {
    where.department = {
      name: filters.department,
    };
  }
  if (filters.designation) {
    where.designation = {
      title: filters.designation,
    };
  }
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
      // @ts-expect-error Prisma generated include typing is narrower than selected relation shape here.
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        designation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.employee.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data: rows.map((row) => toEmployee(row as unknown as EmployeeRow)),
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

  // @ts-expect-error Prisma generated include typing is narrower than selected relation shape here.
  const row = isNumericId
    ? await prisma.employee.findUnique({
        where: { id: numericId },
        // @ts-expect-error Prisma generated include typing is narrower than selected relation shape here.
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          designation: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })
    : await prisma.employee.findUnique({
        where: { employeeId: id },
        // @ts-expect-error Prisma generated include typing is narrower than selected relation shape here.
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          designation: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

  return row ? toEmployee(row as unknown as EmployeeRow) : null;
}

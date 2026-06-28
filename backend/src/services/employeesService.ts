/**
 * Service for employees endpoint.
 * Implements list query with filtering, pagination, and salary conversion.
 */

import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeRow } from '../models/employee';
import type { EmployeeQuery, EmployeeListResponse } from '../models/employee/types';
import { convertSalary, getConversionRate } from '../utils/currencyConversion';

/**
 * Maps a database employee row to the API contract shape.
 * Performs salary conversion based on target currency.
 * Extracts department name and designation title from related objects.
 */
function toEmployee(
  row: EmployeeRow,
  targetCurrency: string,
): {
  employee: Employee;
  convertedSalary: number;
} {
  const salaryConversion = convertSalary(row.basicSalary, targetCurrency);
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
    basicSalary: salaryConversion.convertedAmount,
    currency: targetCurrency,
    status: row.status,
    joiningDate: joiningDateStr,
    employmentType: row.employmentType,
    country: row.country,
  };

  if (row.avatarUrl) {
    employee.avatarUrl = row.avatarUrl;
  }

  return {
    employee,
    convertedSalary: salaryConversion.convertedAmount,
  };
}

/**
 * Builds a Prisma where clause from query filters.
 * Uses new Phase 1 schema relationships (departmentId FK, status enum).
 */
function buildWhere(query: EmployeeQuery) {
  const where: Record<string, any> = {};

  // Search filter - matches name, email, or employeeId
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { employeeId: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  // Department filter - now filters by department name (via relationship lookup)
  if (query.department) {
    where.department = {
      name: query.department,
    };
  }

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  return where;
}

/**
 * Fetches a paginated list of employees with filtering, conversion, and metadata.
 * Phase 1: Includes related Department and Designation objects.
 *
 * @param query Validated query parameters
 * @returns API response with data, meta, and filters
 * @throws Error on database failure
 */
export async function getEmployees(query: EmployeeQuery): Promise<EmployeeListResponse> {
  const { page, pageLimit, targetCurrencyCode } = query;
  const where = buildWhere(query);

  // Get conversion details for metadata
  const conversionDetails = getConversionRate(targetCurrencyCode);

  // Execute parallel queries: data and total count
  const [rows, totalRecords] = await Promise.all([
    prisma.employee.findMany({
      where,
      // @ts-ignore
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
      orderBy: { id: 'asc' },
      skip: (page - 1) * pageLimit,
      take: pageLimit,
    }),
    prisma.employee.count({ where }),
  ]);

  // Convert employees to API contract shape
  const employees = rows.map((row) => {
    const { employee } = toEmployee(row as unknown as EmployeeRow, targetCurrencyCode);
    return employee;
  });

  const totalPages = Math.max(0, Math.ceil(totalRecords / pageLimit));
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1 && totalRecords > 0;

  return {
    data: employees,
    meta: {
      page,
      pageLimit,
      totalRecords,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      currency: targetCurrencyCode,
      targetCurrency: targetCurrencyCode,
      conversion: {
        rate: conversionDetails.rate,
        convertedAt: conversionDetails.convertedAt,
      },
    },
    filters: {
      applied: {
        search: query.search,
        department: query.department,
        status: query.status,
      },
    },
  };
}

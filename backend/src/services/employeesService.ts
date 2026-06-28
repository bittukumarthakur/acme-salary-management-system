/**
 * Service for employees endpoint.
 * Implements list query with filtering, pagination, and salary conversion.
 */

import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeRow } from '../models/employee';
import type {
  CreateEmployeePayload,
  EmployeeListResponse,
  EmployeeQuery,
} from '../models/employee/types';
import { convertSalary, getConversionRate } from '../utils/currencyConversion';

export const DUPLICATE_EMPLOYEE_ID_ERROR = 'EMPLOYEE_ID_ALREADY_EXISTS';

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
  const where: Record<string, unknown> = {};

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
      // @ts-expect-error Prisma generated include typing differs from local row type usage.
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

/**
 * Creates a new employee record from a validated create payload.
 * Throws `DUPLICATE_EMPLOYEE_ID_ERROR` when employeeId already exists.
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const { employee, salaryStructure, bankAccounts } = payload;

  const existingEmployee = await prisma.employee.findUnique({
    where: { employeeId: employee.employeeId },
    select: { id: true },
  });

  if (existingEmployee) {
    throw new Error(DUPLICATE_EMPLOYEE_ID_ERROR);
  }

  let row: unknown;

  try {
    row = await prisma.$transaction(async (tx) => {
      const department = await tx.department.findUnique({
        where: { name: employee.department },
        select: { id: true, name: true },
      });

      if (!department) {
        throw new Error('INVALID_DEPARTMENT');
      }

      const designation = await tx.designation.upsert({
        where: { title: employee.designation },
        update: {},
        create: {
          title: employee.designation,
        },
        select: { id: true, title: true },
      });

      // @ts-expect-error Prisma generated enums are compatible with validated string values.
      const createdEmployee = await tx.employee.create({
        data: {
          employeeId: employee.employeeId,
          name: employee.fullName,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          dateOfBirth: new Date(employee.dateOfBirth),
          gender: employee.gender,
          country: employee.country ?? 'India',
          departmentId: department.id,
          designationId: designation.id,
          employmentType: employee.employmentType,
          joiningDate: new Date(employee.joiningDate),
          basicSalary: salaryStructure.basicSalary,
          currency: salaryStructure.currency ?? 'INR',
          status: employee.status ?? 'ACTIVE',
          avatarUrl: employee.avatarUrl,
        },
        // @ts-expect-error Prisma generated include typing differs from local row type usage.
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

      await tx.employeeSalaryStructure.create({
        data: {
          employeeId: createdEmployee.id,
          basicSalary: salaryStructure.basicSalary,
          effectiveDate: new Date(salaryStructure.effectiveDate ?? employee.joiningDate),
          endDate: salaryStructure.endDate ? new Date(salaryStructure.endDate) : null,
          currency: salaryStructure.currency ?? 'INR',
        },
      });

      if (bankAccounts && bankAccounts.length > 0) {
        for (const bankAccount of bankAccounts) {
          // @ts-expect-error Prisma enum typing for accountType differs from validated payload string.
          await tx.bankAccount.create({
            data: {
              employeeId: createdEmployee.id,
              bankName: bankAccount.bankName,
              accountNumber: bankAccount.accountNumber,
              ifscCode: bankAccount.ifscCode,
              accountHolderName: bankAccount.accountHolderName,
              accountType: bankAccount.accountType ?? 'SAVINGS',
              isPrimary: bankAccount.isPrimary ?? true,
              isActive: bankAccount.isActive ?? true,
            },
          });
        }
      }

      return createdEmployee;
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new Error(DUPLICATE_EMPLOYEE_ID_ERROR, { cause: error });
    }

    throw error;
  }

  const { employee: apiEmployee } = toEmployee(row as unknown as EmployeeRow, 'INR');
  return apiEmployee;
}

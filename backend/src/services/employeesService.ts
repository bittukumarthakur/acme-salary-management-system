/**
 * Service for employees endpoint.
 * Implements list query with filtering, pagination, and salary conversion.
 */

import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeRow } from '../models/employee';
import type {
  AccountType,
  EmployeeStatus,
  EmploymentType,
  Gender,
} from '../../generated/prisma/enums';
import type {
  CreateEmployeePayload,
  EmployeeListResponse,
  EmployeeQuery,
} from '../models/employee/types';
import { getConversionRate } from '../utils/currencyConversion';
import {
  buildEmployeesWhere,
  formatGeneratedEmployeeId,
  isUniqueConstraintError,
  mapEmployeeRowToApi,
} from '../utils/employeesService';

export const DUPLICATE_EMPLOYEE_ID_ERROR = 'EMPLOYEE_ID_ALREADY_EXISTS';

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
  const where = buildEmployeesWhere(query);

  // Get conversion details for metadata
  const conversionDetails = getConversionRate(targetCurrencyCode);

  // Execute parallel queries: data and total count
  const [rows, totalRecords] = await Promise.all([
    prisma.employee.findMany({
      where,
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
    const { employee } = mapEmployeeRowToApi(row as unknown as EmployeeRow, targetCurrencyCode);
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
 * Employee ID is generated automatically from the inserted numeric ID.
 * Throws `DUPLICATE_EMPLOYEE_ID_ERROR` when a unique-constraint conflict occurs.
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const { employee, salaryStructure, bankAccounts } = payload;

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

      const createdEmployee = await tx.employee.create({
        data: {
          employeeId: `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: employee.fullName,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          dateOfBirth: new Date(employee.dateOfBirth),
          gender: employee.gender as Gender,
          country: employee.country ?? 'India',
          departmentId: department.id,
          designationId: designation.id,
          employmentType: employee.employmentType as EmploymentType,
          joiningDate: new Date(employee.joiningDate),
          basicSalary: salaryStructure.basicSalary,
          currency: salaryStructure.currency ?? 'INR',
          status: (employee.status ?? 'ACTIVE') as EmployeeStatus,
          avatarUrl: employee.avatarUrl ?? null,
        },
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

      const generatedEmployeeId = formatGeneratedEmployeeId(createdEmployee.id);

      const updatedEmployee = await tx.employee.update({
        where: { id: createdEmployee.id },
        data: {
          employeeId: generatedEmployeeId,
        },
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
          await tx.bankAccount.create({
            data: {
              employeeId: createdEmployee.id,
              bankName: bankAccount.bankName,
              accountNumber: bankAccount.accountNumber,
              ifscCode: bankAccount.ifscCode,
              accountHolderName: bankAccount.accountHolderName,
              accountType: (bankAccount.accountType ?? 'SAVINGS') as AccountType,
              isPrimary: bankAccount.isPrimary ?? true,
              isActive: bankAccount.isActive ?? true,
            },
          });
        }
      }

      return updatedEmployee;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error(DUPLICATE_EMPLOYEE_ID_ERROR, { cause: error });
    }

    throw error;
  }

  const { employee: apiEmployee } = mapEmployeeRowToApi(row as unknown as EmployeeRow, 'INR');
  return apiEmployee;
}

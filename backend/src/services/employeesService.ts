/**
 * Service for employees endpoint.
 * Implements list query with filtering, pagination, and salary conversion.
 */

import { prisma } from '../../lib/prisma';
import type { Employee, EmployeeDetailsResponse, EmployeeRow } from '../models/employee';
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
} from '../utils/employeeDbHelpers';
import { isValidEmployeeCodeId, normalizeEmployeeCodeId } from '../utils/employeeId';
import { ESI_RATE, PF_RATE } from '../utils/salaryCalculation';

export const DUPLICATE_EMPLOYEE_ID_ERROR = 'EMPLOYEE_ID_ALREADY_EXISTS';

function toDisplayDate(value: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
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
    return mapEmployeeRowToApi(row as unknown as EmployeeRow, targetCurrencyCode);
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
 * Fetches one employee by id.
 * Supports numeric DB id as well as external employeeId values.
 * Includes salary history ordered newest-first.
 */
export async function getEmployeeById(id: string): Promise<EmployeeDetailsResponse | null> {
  const trimmedId = id.trim();
  if (!trimmedId || !isValidEmployeeCodeId(trimmedId)) {
    return null;
  }

  const row = await prisma.employee.findUnique({
    where: { employeeId: normalizeEmployeeCodeId(trimmedId) },
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
      bankAccounts: {
        where: { isActive: true },
        orderBy: { isPrimary: 'desc' },
        take: 1,
        select: {
          accountNumber: true,
        },
      },
      salaryStructures: {
        orderBy: { effectiveDate: 'desc' },
        select: {
          id: true,
          basicSalary: true,
          currency: true,
          effectiveDate: true,
        },
      },
      salaryComponents: {
        where: { endDate: null },
        select: {
          amount: true,
          component: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  const departmentName = row.department?.name || row.departmentId || '';
  const designationTitle = row.designation?.title || '';
  const joinedOn = toDisplayDate(row.joiningDate);
  const primaryBankAccount = row.bankAccounts?.[0]?.accountNumber ?? null;

  // Get the latest salary structure for current salary display
  const latestSalaryStructure = row.salaryStructures?.[0];
  const salaryCurrency = latestSalaryStructure?.currency ?? row.currency;
  const baseSalaryMonthly = latestSalaryStructure?.basicSalary ?? row.basicSalary;
  const effectiveFrom = latestSalaryStructure
    ? toDisplayDate(latestSalaryStructure.effectiveDate)
    : null;

  const salaryComponents = row.salaryComponents ?? [];

  // Basic Salary is stored on the salary structure, not as a component row, so it
  // is always the first earning line. Any EARNING components (e.g. Allowances) are
  // appended; a stray "Basic Salary" earning component is skipped to avoid double
  // counting.
  const earningsLineItems = [
    { component: 'Basic Salary', amount: baseSalaryMonthly },
    ...salaryComponents
      .filter((item) => item.component.type === 'EARNING')
      .filter((item) => !item.component.name.toLowerCase().includes('basic salary'))
      .map((item) => ({ component: item.component.name, amount: item.amount })),
  ];
  const deductionsLineItems = salaryComponents
    .filter((item) => item.component.type === 'DEDUCTION')
    .map((item) => ({ component: item.component.name, amount: item.amount }));

  const totalEarnings = earningsLineItems.reduce((total, item) => total + item.amount, 0);
  const totalDeductions = deductionsLineItems.reduce((total, item) => total + item.amount, 0);
  const netPayMonthly = totalEarnings - totalDeductions;

  const response: EmployeeDetailsResponse = {
    summary: {
      fullName: row.name,
      status: row.status,
      employeeId: row.employeeId,
      email: row.email,
      phone: row.phoneNumber ?? null,
      joinedOn,
      department: departmentName,
      designation: designationTitle,
      employmentType: row.employmentType,
      country: row.country,
      currency: salaryCurrency,
      bankAccount: primaryBankAccount,
    },
    overview: {
      personalInformation: {
        fullName: row.name,
        employeeId: row.employeeId,
        email: row.email,
        phone: row.phoneNumber ?? null,
        dateOfBirth: row.dateOfBirth ? toDisplayDate(row.dateOfBirth) : null,
        gender: row.gender ?? null,
        joiningDate: joinedOn,
        country: row.country,
        employmentType: row.employmentType,
        status: row.status,
        avatarUrl: row.avatarUrl ?? null,
      },
      jobInformation: {
        department: departmentName,
        designation: designationTitle,
        workLocation: row.country || null,
      },
    },
    salaryStructure: {
      currency: salaryCurrency,
      earnings: earningsLineItems,
      deductions: deductionsLineItems,
      totalEarnings,
      totalDeductions,
      netPayMonthly,
      ctcAnnual: totalEarnings * 12,
      baseSalaryMonthly,
      effectiveFrom,
    },
  };

  return response;
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

      // Persist salary components: the entered Allowances earning and any
      // enabled statutory deductions (PF/ESI).
      const componentEffectiveDate = new Date(
        salaryStructure.effectiveDate ?? employee.joiningDate,
      );
      const allowancesAmount = salaryStructure.allowances ?? 0;
      const salaryComponentRows = [
        {
          include: allowancesAmount > 0,
          name: 'Allowances',
          amount: Math.round(allowancesAmount * 100) / 100,
        },
        {
          include: salaryStructure.pfApplicable ?? false,
          name: 'PF',
          amount: Math.round(salaryStructure.basicSalary * PF_RATE * 100) / 100,
        },
        {
          include: salaryStructure.esiApplicable ?? false,
          name: 'ESI',
          amount: Math.round(salaryStructure.basicSalary * ESI_RATE * 100) / 100,
        },
      ];

      for (const { include, name, amount } of salaryComponentRows) {
        if (!include) {
          continue;
        }

        const component = await tx.salaryComponent.findUnique({
          where: { name },
          select: { id: true },
        });

        if (!component) {
          continue;
        }

        await tx.employeeSalaryComponent.create({
          data: {
            employeeId: createdEmployee.id,
            salaryComponentId: component.id,
            amount,
            effectiveDate: componentEffectiveDate,
          },
        });
      }

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

  return mapEmployeeRowToApi(row as unknown as EmployeeRow, 'INR');
}

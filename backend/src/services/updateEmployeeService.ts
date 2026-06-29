/**
 * Service for updating employee information.
 * Handles PUT /api/v1/employees/:id operations.
 */

import { prisma } from '../../lib/prisma';
import type { EmploymentType, EmployeeStatus } from '../../generated/prisma/client';
import type { EmployeeWithSalary, UpdateEmployeePayload } from '../models/employee/types';
import { calculateSalaryComponents } from './salaryCalculation';
import { toEmployeeWithSalary } from './employeeMapper';

async function syncEditableEarnings(
  employeeId: number,
  effectiveFromDate: Date,
  earnings: Array<{ component: string; amount: number }>,
): Promise<void> {
  const normalized = new Map<string, number>();

  earnings.forEach((item) => {
    const component = item.component.trim();
    if (!component) {
      return;
    }
    normalized.set(component, item.amount);
  });

  if (normalized.size === 0) {
    return;
  }

  const components = await prisma.salaryComponent.findMany({
    where: {
      type: 'EARNING',
      isActive: true,
      name: {
        in: Array.from(normalized.keys()),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const componentByName = new Map(components.map((component) => [component.name, component]));
  const missing = Array.from(normalized.keys()).filter((name) => !componentByName.has(name));

  if (missing.length > 0) {
    throw new Error(`Earning component(s) not found: ${missing.join(', ')}`);
  }

  const selectedComponentIds = components.map((component) => component.id);

  await prisma.employeeSalaryComponent.updateMany({
    where: {
      employeeId,
      endDate: null,
      effectiveDate: {
        lt: effectiveFromDate,
      },
      component: {
        type: 'EARNING',
      },
    },
    data: {
      endDate: effectiveFromDate,
    },
  });

  await prisma.employeeSalaryComponent.deleteMany({
    where: {
      employeeId,
      effectiveDate: effectiveFromDate,
      component: {
        type: 'EARNING',
      },
      salaryComponentId: {
        notIn: selectedComponentIds,
      },
    },
  });

  await Promise.all(
    Array.from(normalized.entries()).map(async ([componentName, amount]) => {
      const component = componentByName.get(componentName);
      if (!component) {
        return;
      }

      const existing = await prisma.employeeSalaryComponent.findFirst({
        where: {
          employeeId,
          salaryComponentId: component.id,
          effectiveDate: effectiveFromDate,
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        await prisma.employeeSalaryComponent.update({
          where: { id: existing.id },
          data: {
            amount,
            endDate: null,
          },
        });
        return;
      }

      await prisma.employeeSalaryComponent.create({
        data: {
          employeeId,
          salaryComponentId: component.id,
          amount,
          effectiveDate: effectiveFromDate,
          endDate: null,
        },
      });
    }),
  );
}

/**
 * Error thrown when employee is not found.
 */
export class EmployeeNotFoundError extends Error {
  constructor(id: string | number) {
    super(`Employee ${id} not found`);
    this.name = 'EmployeeNotFoundError';
  }
}

/**
 * Error thrown when email is already in use by another employee.
 */
export class EmailAlreadyInUseError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already in use by another employee`);
    this.name = 'EmailAlreadyInUseError';
  }
}

/**
 * Error thrown when a salary record with the same effectiveFrom already exists.
 */
export class DuplicateSalaryDateError extends Error {
  constructor(effectiveFrom: string) {
    super(`A salary record with effectiveFrom ${effectiveFrom} already exists`);
    this.name = 'DuplicateSalaryDateError';
  }
}

/**
 * Updates an employee's basic information and salary structure.
 *
 * @param employeeId - Numeric ID or employeeId (EMP0001)
 * @param payload - Update payload with all required fields
 * @returns Updated employee with salary details
 * @throws EmployeeNotFoundError if employee doesn't exist
 * @throws EmailAlreadyInUseError if email is used by another employee
 * @throws DuplicateSalaryDateError if salary effective date already exists
 */
export async function updateEmployee(
  employeeId: string | number,
  payload: UpdateEmployeePayload,
): Promise<EmployeeWithSalary> {
  // Resolve employee ID (could be numeric or string like EMP0001)
  const numericId = typeof employeeId === 'string' ? Number(employeeId) : employeeId;
  const isNumericId = !isNaN(numericId) && Number.isInteger(numericId);

  // Find the employee
  const employee = isNumericId
    ? await prisma.employee.findUnique({ where: { id: numericId } })
    : await prisma.employee.findUnique({ where: { employeeId: String(employeeId) } });

  if (!employee) {
    throw new EmployeeNotFoundError(employeeId);
  }

  // Check if email is already in use by another employee
  if (payload.email !== employee.email) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: payload.email },
    });
    if (existingEmployee) {
      throw new EmailAlreadyInUseError(payload.email);
    }
  }

  // Resolve department and designation by name
  const department = await prisma.department.findFirst({
    where: { name: payload.department },
  });
  if (!department) {
    throw new Error(`Department ${payload.department} not found`);
  }

  const designation = await prisma.designation.findFirst({
    where: { title: payload.designation },
  });
  if (!designation) {
    throw new Error(`Designation ${payload.designation} not found`);
  }

  // Update employee basic information
  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      name: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phone,
      departmentId: department.id,
      designationId: designation.id,
      employmentType: payload.employmentType as EmploymentType,
      status: payload.status as EmployeeStatus,
      joiningDate: new Date(payload.joiningDate),
      country: payload.country,
      currency: payload.currency,
      basicSalary: payload.salary.baseMonthlySalary,
    },
  });

  // Re-fetch the updated employee with relationships
  const updatedEmployee = await prisma.employee.findUniqueOrThrow({
    where: { id: employee.id },
    include: {
      department: {
        select: { id: true, name: true },
      },
      designation: {
        select: { id: true, title: true },
      },
    },
  });

  // Check if we need to create a new salary history entry
  const effectiveFromDate = new Date(payload.salary.effectiveFrom);

  // Check if a salary entry with this effectiveDate already exists
  const existingSalaryEntry = await prisma.employeeSalaryStructure.findFirst({
    where: {
      employeeId: employee.id,
      effectiveDate: effectiveFromDate,
    },
  });

  // Only create a new salary history entry if:
  // 1. The salary amount changed, OR
  // 2. The effective date is new
  const previousSalaryEntry = await prisma.employeeSalaryStructure.findFirst({
    where: { employeeId: employee.id },
    orderBy: { effectiveDate: 'desc' },
  });

  const salaryChanged =
    !previousSalaryEntry || previousSalaryEntry.basicSalary !== payload.salary.baseMonthlySalary;

  if (salaryChanged && !existingSalaryEntry) {
    // Create new salary history entry
    await prisma.employeeSalaryStructure.create({
      data: {
        employeeId: employee.id,
        basicSalary: payload.salary.baseMonthlySalary,
        effectiveDate: effectiveFromDate,
        currency: payload.currency,
      },
    });
  } else if (salaryChanged && existingSalaryEntry) {
    // Update existing salary entry
    await prisma.employeeSalaryStructure.update({
      where: { id: existingSalaryEntry.id },
      data: {
        basicSalary: payload.salary.baseMonthlySalary,
        currency: payload.currency,
      },
    });
  }

  if (payload.salary.earnings && payload.salary.earnings.length > 0) {
    await syncEditableEarnings(employee.id, effectiveFromDate, payload.salary.earnings);
  }

  // Get the latest salary entry for response
  const latestSalaryEntry = await prisma.employeeSalaryStructure.findFirst({
    where: { employeeId: employee.id },
    orderBy: { effectiveDate: 'desc' },
  });

  // Calculate salary components
  const salaryComponents = calculateSalaryComponents(payload.salary.baseMonthlySalary);

  // Map to domain model with salary details
  return toEmployeeWithSalary(
    updatedEmployee,
    latestSalaryEntry || {
      basicSalary: payload.salary.baseMonthlySalary,
      effectiveDate: effectiveFromDate,
    },
    salaryComponents,
  );
}

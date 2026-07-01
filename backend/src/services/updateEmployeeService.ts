/**
 * Service for updating employee information.
 * Handles PUT /api/v1/employees/:id operations.
 */

import { prisma } from '../../lib/prisma';
import type { EmploymentType, EmployeeStatus } from '../../generated/prisma/client';
import type { EmployeeWithSalary, UpdateEmployeePayload } from '../models/employee/types';
import { calculateSalaryComponents } from '../utils/salaryCalculation';
import { toEmployeeWithSalary } from './employeeMapper';
import { syncEditableEarnings } from './salaryComponentsSync';
import { EmployeeNotFoundError, EmailAlreadyInUseError } from './errors';

/**
 * Records a salary change as a revision on the employee's salary structure.
 *
 * - No change in the base amount → does nothing.
 * - Same effective date as the current revision → corrects it in place.
 * - New effective date → appends a new revision and closes the previous one.
 */
async function recordSalaryRevision(
  employeeId: number,
  effectiveFromDate: Date,
  baseMonthlySalary: number,
  currency: string,
): Promise<void> {
  // The current (latest) revision drives the change detection.
  const currentSalaryEntry = await prisma.employeeSalaryStructure.findFirst({
    where: { employeeId },
    orderBy: { effectiveDate: 'desc' },
  });

  const salaryChanged = !currentSalaryEntry || currentSalaryEntry.basicSalary !== baseMonthlySalary;

  if (!salaryChanged) {
    return;
  }

  const isSameEffectiveDate =
    currentSalaryEntry !== null &&
    currentSalaryEntry.effectiveDate.getTime() === effectiveFromDate.getTime();

  if (currentSalaryEntry && isSameEffectiveDate) {
    // Same effective date as the current revision → correct it in place.
    await prisma.employeeSalaryStructure.update({
      where: { id: currentSalaryEntry.id },
      data: { basicSalary: baseMonthlySalary, currency },
    });
    return;
  }

  // New effective date → append a revision and close the previous one.
  if (currentSalaryEntry && currentSalaryEntry.endDate === null) {
    await prisma.employeeSalaryStructure.update({
      where: { id: currentSalaryEntry.id },
      data: { endDate: effectiveFromDate },
    });
  }
  await prisma.employeeSalaryStructure.create({
    data: {
      employeeId,
      basicSalary: baseMonthlySalary,
      effectiveDate: effectiveFromDate,
      currency,
    },
  });
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

  // Record the salary as a revision if the amount changed.
  const effectiveFromDate = new Date(payload.salary.effectiveFrom);
  await recordSalaryRevision(
    employee.id,
    effectiveFromDate,
    payload.salary.baseMonthlySalary,
    payload.currency,
  );

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

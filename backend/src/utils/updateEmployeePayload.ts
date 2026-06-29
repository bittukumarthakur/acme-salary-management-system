/**
 * Validation parser for PUT /api/v1/employees/:id update payload.
 */

import type { UpdateEmployeePayload } from '../models/employee/types';
import type { ValidationErrors } from './createEmployeePayload/shared';
import { asRecord, isValidDate, readRequiredString } from './createEmployeePayload/shared';
import {
  VALID_EMPLOYMENT_TYPES,
  VALID_STATUSES,
  VALID_DEPARTMENTS,
} from './createEmployeePayload/constants';

export type ParseUpdateResult =
  | { ok: true; value: UpdateEmployeePayload }
  | { ok: false; error: 'Validation failed'; details: Record<string, string> };

function normalizeEmploymentType(value: string): string {
  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case 'FULL_TIME':
      return 'PERMANENT';
    case 'PART_TIME':
      return 'TEMPORARY';
    default:
      return normalized;
  }
}

/**
 * Parses and validates PUT /api/v1/employees/:id request body.
 * Enforces required fields and enum constraints.
 */
export function parseUpdateEmployeePayload(raw: unknown): ParseUpdateResult {
  const source = asRecord(raw);
  if (!source) {
    return {
      ok: false,
      error: 'Validation failed',
      details: { payload: 'Request body must be a JSON object' },
    };
  }

  const errors: ValidationErrors = {};

  // Reject employeeId if present
  if ('employeeId' in source) {
    errors.employeeId = 'employeeId is read-only and cannot be updated';
  }

  // Parse basic information fields
  const fullName = readRequiredString(source, 'fullName', 'fullName', errors);
  const email = readRequiredString(source, 'email', 'email', errors);
  const phone = readRequiredString(source, 'phone', 'phone', errors);
  const department = readRequiredString(source, 'department', 'department', errors).toUpperCase();
  const designation = readRequiredString(source, 'designation', 'designation', errors);
  const employmentType = normalizeEmploymentType(
    readRequiredString(source, 'employmentType', 'employmentType', errors),
  );
  const status = readRequiredString(source, 'status', 'status', errors).toUpperCase();
  const joiningDate = readRequiredString(source, 'joiningDate', 'joiningDate', errors);
  const country = readRequiredString(source, 'country', 'country', errors);
  const currency = readRequiredString(source, 'currency', 'currency', errors);
  const bankAccount = readRequiredString(source, 'bankAccount', 'bankAccount', errors);

  // Parse salary structure
  const salarySource = asRecord(source.salary);
  let baseMonthlySalary = 0;
  let effectiveFrom = '';
  let earnings: Array<{ component: string; amount: number }> | undefined;

  if (!salarySource) {
    errors.salary = 'salary is required and must be an object';
  } else {
    const baseSalaryRaw = salarySource.baseMonthlySalary;
    if (typeof baseSalaryRaw !== 'number' || baseSalaryRaw <= 0) {
      errors['salary.baseMonthlySalary'] =
        'salary.baseMonthlySalary is required and must be a positive number';
    } else {
      baseMonthlySalary = baseSalaryRaw;
    }

    const effectiveFromRaw = salarySource.effectiveFrom;
    if (typeof effectiveFromRaw !== 'string') {
      errors['salary.effectiveFrom'] = 'salary.effectiveFrom is required and must be a string';
    } else {
      effectiveFrom = effectiveFromRaw;
    }

    if ('earnings' in salarySource) {
      const earningsRaw = salarySource.earnings;
      if (!Array.isArray(earningsRaw)) {
        errors['salary.earnings'] = 'salary.earnings must be an array';
      } else {
        const parsedEarnings: Array<{ component: string; amount: number }> = [];

        earningsRaw.forEach((item, index) => {
          const itemSource = asRecord(item);
          if (!itemSource) {
            errors[`salary.earnings.${index}`] =
              'Each earnings item must be an object with component and amount';
            return;
          }

          const component = readRequiredString(
            itemSource,
            'component',
            `salary.earnings.${index}.component`,
            errors,
          );

          const amountRaw = itemSource.amount;
          if (typeof amountRaw !== 'number' || Number.isNaN(amountRaw) || amountRaw < 0) {
            errors[`salary.earnings.${index}.amount`] =
              'salary.earnings amount must be a non-negative number';
            return;
          }

          parsedEarnings.push({ component, amount: amountRaw });
        });

        if (parsedEarnings.length > 0) {
          earnings = parsedEarnings;
        }
      }
    }
  }

  // Validate email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'email must be a valid email address';
  }

  // Validate phone format (allow spaces, dashes, parentheses; at least 10 digits)
  if (phone) {
    const digitsOnly = phone.replace(/[\D]/g, '');
    if (digitsOnly.length < 10) {
      errors.phone = 'phone must contain at least 10 digits';
    }
  }

  // Validate department enum
  if (department && !VALID_DEPARTMENTS.includes(department)) {
    errors.department = `department must be one of ${VALID_DEPARTMENTS.join(', ')}`;
  }

  // Validate employmentType enum
  if (employmentType && !VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
    errors.employmentType = `employmentType must be one of ${VALID_EMPLOYMENT_TYPES.join(', ')}`;
  }

  // Validate status enum
  if (status && !VALID_STATUSES.includes(status)) {
    errors.status = `status must be one of ${VALID_STATUSES.join(', ')}`;
  }

  // Validate date formats
  if (joiningDate && !isValidDate(joiningDate)) {
    errors.joiningDate = 'joiningDate must be a valid ISO date (YYYY-MM-DD)';
  }

  if (effectiveFrom && !isValidDate(effectiveFrom)) {
    errors['salary.effectiveFrom'] = 'salary.effectiveFrom must be a valid ISO date (YYYY-MM-DD)';
  }

  // Validate effectiveFrom >= joiningDate
  if (joiningDate && effectiveFrom && !errors.joiningDate && !errors['salary.effectiveFrom']) {
    const joiningDateValue = new Date(joiningDate);
    const effectiveFromValue = new Date(effectiveFrom);
    if (effectiveFromValue < joiningDateValue) {
      errors['salary.effectiveFrom'] = 'salary.effectiveFrom cannot be earlier than joiningDate';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: 'Validation failed', details: errors };
  }

  const value: UpdateEmployeePayload = {
    fullName,
    email,
    phone,
    department,
    designation,
    employmentType,
    status,
    joiningDate,
    country,
    currency,
    bankAccount,
    salary: {
      baseMonthlySalary,
      effectiveFrom,
      ...(earnings ? { earnings } : {}),
    },
  };

  return { ok: true, value };
}

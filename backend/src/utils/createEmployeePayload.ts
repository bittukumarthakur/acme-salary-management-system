import type {
  CreateEmployeeInput,
  CreateEmployeePayload,
  CreateSalaryStructureInput,
} from '../models/employee/types';
import { parseBankAccounts } from './createEmployeePayload/bankAccounts';
import { parseEmployee } from './createEmployeePayload/employee';
import { parseSalaryStructure } from './createEmployeePayload/salaryStructure';
import { asRecord, type ValidationErrors } from './createEmployeePayload/shared';

type ValidationResult =
  | { ok: true; value: CreateEmployeePayload }
  | { ok: false; error: 'Validation failed'; details: Record<string, string> };

export function parseCreateEmployeePayload(raw: unknown): ValidationResult {
  const source = asRecord(raw);
  if (!source) {
    return {
      ok: false,
      error: 'Validation failed',
      details: { payload: 'Request body must be a JSON object' },
    };
  }

  const errors: ValidationErrors = {};

  const employeeSource = asRecord(source.employee);
  if (!employeeSource) {
    errors.employee = 'employee is required and must be an object';
  }

  const salarySource = asRecord(source.salaryStructure);
  if (!salarySource) {
    errors.salaryStructure = 'salaryStructure is required and must be an object';
  }

  const employee = employeeSource
    ? parseEmployee(employeeSource, errors)
    : ({} as unknown as CreateEmployeeInput);

  const salaryStructure = salarySource
    ? parseSalaryStructure(salarySource, errors)
    : ({ basicSalary: 0 } as CreateSalaryStructureInput);

  const bankAccounts = parseBankAccounts(source.bankAccounts, errors);

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: 'Validation failed', details: errors };
  }

  const value: CreateEmployeePayload = {
    employee,
    salaryStructure,
    ...(bankAccounts !== undefined ? { bankAccounts } : {}),
  };

  return { ok: true, value };
}

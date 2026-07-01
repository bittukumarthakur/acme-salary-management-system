import type { CreateSalaryStructureInput } from '../../models/employee/types';
import { isValidDate, fieldReader, type ValidationErrors } from './shared';

export function parseSalaryStructure(
  source: Record<string, unknown>,
  errors: ValidationErrors,
): CreateSalaryStructureInput {
  const f = fieldReader(source, 'salaryStructure', errors);

  const basicSalary = f.requiredNumber('basicSalary');

  const currency = f.optionalString('currency');
  const effectiveDate = f.optionalString('effectiveDate');

  const endDateRaw = source.endDate;
  let endDate: string | null | undefined;
  if (endDateRaw === null || endDateRaw === undefined) {
    endDate = endDateRaw as null | undefined;
  } else if (typeof endDateRaw === 'string' && endDateRaw.trim() !== '') {
    endDate = endDateRaw.trim();
  } else {
    errors['salaryStructure.endDate'] = 'salaryStructure.endDate must be a date string or null';
    endDate = undefined;
  }

  const pfApplicable = f.optionalBoolean('pfApplicable');
  const esiApplicable = f.optionalBoolean('esiApplicable');
  const allowances = f.optionalNumber('allowances');

  if (basicSalary < 0) {
    errors['salaryStructure.basicSalary'] = 'salaryStructure.basicSalary must be zero or higher';
  }

  if (allowances !== undefined && allowances < 0) {
    errors['salaryStructure.allowances'] = 'salaryStructure.allowances must be zero or higher';
  }

  if (effectiveDate && !isValidDate(effectiveDate)) {
    errors['salaryStructure.effectiveDate'] = 'salaryStructure.effectiveDate must be a valid date';
  }

  if (typeof endDate === 'string' && !isValidDate(endDate)) {
    errors['salaryStructure.endDate'] = 'salaryStructure.endDate must be a valid date';
  }

  if (
    effectiveDate &&
    typeof endDate === 'string' &&
    !errors['salaryStructure.effectiveDate'] &&
    !errors['salaryStructure.endDate'] &&
    new Date(endDate) < new Date(effectiveDate)
  ) {
    errors['salaryStructure.endDate'] =
      'salaryStructure.endDate must be on or after salaryStructure.effectiveDate';
  }

  return {
    basicSalary,
    ...(currency ? { currency: currency.toUpperCase() } : {}),
    ...(effectiveDate !== undefined ? { effectiveDate } : {}),
    ...(endDate !== undefined ? { endDate } : {}),
    ...(pfApplicable !== undefined ? { pfApplicable } : {}),
    ...(esiApplicable !== undefined ? { esiApplicable } : {}),
    ...(allowances !== undefined ? { allowances } : {}),
  };
}

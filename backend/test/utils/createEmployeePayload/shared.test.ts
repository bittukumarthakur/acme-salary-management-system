import {
  fieldReader,
  type ValidationErrors,
} from '../../../src/utils/createEmployeePayload/shared';

describe('fieldReader', () => {
  it('derives the error path as `${prefix}.${key}`', () => {
    const errors: ValidationErrors = {};
    const f = fieldReader({}, 'employee', errors);

    f.requiredString('fullName');

    expect(f.path('fullName')).toBe('employee.fullName');
    expect(errors['employee.fullName']).toBeDefined();
  });

  it('uses the bare key as the path when the prefix is empty', () => {
    const errors: ValidationErrors = {};
    const f = fieldReader({}, '', errors);

    f.requiredString('email');

    expect(f.path('email')).toBe('email');
    expect(errors.email).toBeDefined();
  });

  it('reads a required string and trims it', () => {
    const errors: ValidationErrors = {};
    const f = fieldReader({ bankName: '  HDFC  ' }, 'bankAccounts.0', errors);

    expect(f.requiredString('bankName')).toBe('HDFC');
    expect(errors).toEqual({});
  });

  it('returns undefined for an absent optional string without recording an error', () => {
    const errors: ValidationErrors = {};
    const f = fieldReader({}, 'employee', errors);

    expect(f.optionalString('country')).toBeUndefined();
    expect(errors).toEqual({});
  });

  it('reads a required number and records a prefixed error when invalid', () => {
    const errors: ValidationErrors = {};
    const f = fieldReader({ basicSalary: 'abc' }, 'salaryStructure', errors);

    expect(f.requiredNumber('basicSalary')).toBe(0);
    expect(errors['salaryStructure.basicSalary']).toBeDefined();
  });

  it('reads an optional boolean and records a prefixed error when the wrong type', () => {
    const errors: ValidationErrors = {};
    const f = fieldReader({ isPrimary: 'yes' }, 'bankAccounts.1', errors);

    expect(f.optionalBoolean('isPrimary')).toBeUndefined();
    expect(errors['bankAccounts.1.isPrimary']).toBeDefined();
  });
});

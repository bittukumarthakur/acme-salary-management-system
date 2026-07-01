import {
  extractEmployeeCodeId,
  INVALID_EMPLOYEE_ID_ERROR,
  isValidEmployeeCodeId,
  normalizeEmployeeCodeId,
} from '../../src/utils/employeeId';

describe('isValidEmployeeCodeId', () => {
  it('accepts EMP followed by 4+ digits (case-insensitive)', () => {
    expect(isValidEmployeeCodeId('EMP0001')).toBe(true);
    expect(isValidEmployeeCodeId('emp1234')).toBe(true);
  });

  it('rejects non-matching values', () => {
    expect(isValidEmployeeCodeId('123')).toBe(false);
    expect(isValidEmployeeCodeId('EMP12')).toBe(false);
    expect(isValidEmployeeCodeId('ABC0001')).toBe(false);
  });
});

describe('normalizeEmployeeCodeId', () => {
  it('trims and uppercases', () => {
    expect(normalizeEmployeeCodeId('  emp0001 ')).toBe('EMP0001');
  });
});

describe('extractEmployeeCodeId', () => {
  it('extracts, validates, and normalizes a valid id', () => {
    expect(extractEmployeeCodeId('emp0001')).toEqual({ ok: true, value: 'EMP0001' });
  });

  it('trims surrounding whitespace before validating', () => {
    expect(extractEmployeeCodeId('  EMP0042 ')).toEqual({ ok: true, value: 'EMP0042' });
  });

  it('uses the first value when given an array param', () => {
    expect(extractEmployeeCodeId(['EMP0007', 'EMP0008'])).toEqual({
      ok: true,
      value: 'EMP0007',
    });
  });

  it('returns an error for a missing/undefined param', () => {
    expect(extractEmployeeCodeId(undefined)).toEqual({
      ok: false,
      error: INVALID_EMPLOYEE_ID_ERROR,
    });
  });

  it('returns an error for a blank param', () => {
    expect(extractEmployeeCodeId('   ')).toEqual({
      ok: false,
      error: INVALID_EMPLOYEE_ID_ERROR,
    });
  });

  it('returns an error for a malformed id', () => {
    const result = extractEmployeeCodeId('123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(INVALID_EMPLOYEE_ID_ERROR);
    }
  });
});

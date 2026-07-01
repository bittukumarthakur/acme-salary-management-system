import { firstString } from './queryParams';

const EMPLOYEE_ID_PATTERN = /^EMP\d{4,}$/i;

export const INVALID_EMPLOYEE_ID_ERROR = 'Invalid employee id format. Use EMP followed by digits.';

export function isValidEmployeeCodeId(value: string): boolean {
  return EMPLOYEE_ID_PATTERN.test(value.trim());
}

export function normalizeEmployeeCodeId(value: string): string {
  return value.trim().toUpperCase();
}

export type ExtractEmployeeCodeIdResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Extracts an employee code id from a raw route param, validates the `EMP<digits>`
 * format, and returns the normalized (trimmed, uppercased) id. Returns
 * `{ ok: false, error }` for missing/blank/malformed input so the caller can
 * respond 400.
 */
export function extractEmployeeCodeId(raw: unknown): ExtractEmployeeCodeIdResult {
  const value = firstString(raw);
  if (value === undefined || value.trim() === '' || !isValidEmployeeCodeId(value)) {
    return { ok: false, error: INVALID_EMPLOYEE_ID_ERROR };
  }
  return { ok: true, value: normalizeEmployeeCodeId(value) };
}

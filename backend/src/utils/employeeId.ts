const EMPLOYEE_ID_PATTERN = /^EMP\d{4,}$/i;

export function isValidEmployeeCodeId(value: string): boolean {
  return EMPLOYEE_ID_PATTERN.test(value.trim());
}

export function normalizeEmployeeCodeId(value: string): string {
  return value.trim().toUpperCase();
}

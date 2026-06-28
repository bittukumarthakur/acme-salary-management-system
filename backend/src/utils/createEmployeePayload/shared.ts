export type ValidationErrors = Record<string, string>;

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

export function readRequiredString(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationErrors,
): string {
  const value = source[key];
  if (typeof value !== 'string' || value.trim() === '') {
    errors[path] = `${path} is required`;
    return '';
  }
  return value.trim();
}

export function readOptionalString(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationErrors,
): string | undefined {
  const value = source[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    errors[path] = `${path} must be a non-empty string`;
    return undefined;
  }
  return value.trim();
}

export function readRequiredNumber(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationErrors,
): number {
  const value = source[key];
  if (typeof value !== 'number' || Number.isNaN(value)) {
    errors[path] = `${path} must be a number`;
    return 0;
  }
  return value;
}

export function readOptionalBoolean(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationErrors,
): boolean | undefined {
  const value = source[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'boolean') {
    errors[path] = `${path} must be a boolean`;
    return undefined;
  }
  return value;
}

export function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

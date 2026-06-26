/**
 * Generic helpers for parsing raw HTTP query parameters (which may arrive as
 * `string`, `string[]`, or `undefined`) into typed, validated values.
 *
 * These are intentionally domain-agnostic so they can be reused by any
 * resource's query parser (e.g. employees, payroll, etc.).
 */

export type ParseResult<T> = { ok: true; value: T } | { ok: false };

/**
 * Returns the first string value from a query param, handling the case where
 * Express may provide an array of values for a repeated key.
 */
export function firstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return firstString(value[0]);
  }
  return typeof value === 'string' ? value : undefined;
}

/**
 * Parses a query param into an integer, falling back to `fallback` when the
 * value is absent/blank. Returns `{ ok: false }` for non-integer input.
 */
export function parseIntegerParam(value: unknown, fallback: number): ParseResult<number> {
  const raw = firstString(value);
  if (raw === undefined || raw.trim() === '') {
    return { ok: true, value: fallback };
  }

  // Only accept plain integers (no decimals, no extra characters).
  if (!/^-?\d+$/.test(raw.trim())) {
    return { ok: false };
  }

  return { ok: true, value: Number(raw.trim()) };
}

/**
 * Normalizes a string filter param: returns the trimmed value, or `undefined`
 * when the param is absent or blank.
 */
export function cleanFilter(value: unknown): string | undefined {
  const raw = firstString(value);
  if (raw === undefined) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Parses a query param into a `Date`. An absent/blank value yields
 * `{ ok: true, value: undefined }`; an unparseable value yields `{ ok: false }`.
 */
export function parseDateParam(value: unknown): ParseResult<Date | undefined> {
  const raw = cleanFilter(value);
  if (raw === undefined) {
    return { ok: true, value: undefined };
  }
  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    return { ok: false };
  }
  return { ok: true, value: date };
}

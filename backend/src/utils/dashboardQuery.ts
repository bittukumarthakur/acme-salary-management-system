/**
 * Query parameter parser for the dashboard endpoint.
 * Validates and parses GET /api/v1/dashboard query params.
 */

import { cleanFilter, parseIntegerParam } from './queryParams';
import {
  SUPPORTED_COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../services/dashboardService';
import type { DashboardQuery } from '../models/dashboard';

export type ParseDashboardQueryResult =
  | { ok: true; value: DashboardQuery }
  | { ok: false; error: string };

/**
 * Parses and validates raw HTTP query parameters into a typed `DashboardQuery`.
 * Returns `{ ok: false, error }` for invalid input so the caller can respond 400.
 */
export function parseDashboardQuery(raw: Record<string, unknown>): ParseDashboardQueryResult {
  // Filter - countryCode (optional, default to IN, validate against supported set)
  const countryCode = cleanFilter(raw.countryCode)?.toUpperCase() ?? DEFAULT_COUNTRY;
  if (!SUPPORTED_COUNTRIES.has(countryCode)) {
    return {
      ok: false,
      error: `Invalid "countryCode": must be one of ${[...SUPPORTED_COUNTRIES].sort().join(', ')}`,
    };
  }

  // Pagination - limit (optional, default to DEFAULT_LIMIT, 1..MAX_LIMIT)
  const limitResult = parseIntegerParam(raw.limit, DEFAULT_LIMIT);
  if (!limitResult.ok || limitResult.value < 1 || limitResult.value > MAX_LIMIT) {
    return {
      ok: false,
      error: `Invalid "limit": must be an integer between 1 and ${MAX_LIMIT}`,
    };
  }

  return {
    ok: true,
    value: {
      countryCode,
      limit: limitResult.value,
    },
  };
}

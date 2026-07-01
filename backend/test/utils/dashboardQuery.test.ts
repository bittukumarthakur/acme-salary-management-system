import { parseDashboardQuery } from '../../src/utils/dashboardQuery';
import { MAX_LIMIT } from '../../src/services/dashboardService';

describe('parseDashboardQuery', () => {
  it('defaults countryCode to IN and limit to 10 when params are absent', () => {
    expect(parseDashboardQuery({})).toEqual({
      ok: true,
      value: { countryCode: 'IN', limit: 10 },
    });
  });

  it('uppercases and accepts a valid countryCode', () => {
    expect(parseDashboardQuery({ countryCode: 'us' })).toEqual({
      ok: true,
      value: { countryCode: 'US', limit: 10 },
    });
  });

  it('parses a valid limit', () => {
    expect(parseDashboardQuery({ limit: '5' })).toEqual({
      ok: true,
      value: { countryCode: 'IN', limit: 5 },
    });
  });

  it('rejects an unknown countryCode', () => {
    const result = parseDashboardQuery({ countryCode: 'XX' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/countryCode/);
    }
  });

  it('rejects a limit below 1', () => {
    const result = parseDashboardQuery({ limit: '0' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/limit/);
    }
  });

  it(`rejects a limit above ${MAX_LIMIT}`, () => {
    expect(parseDashboardQuery({ limit: String(MAX_LIMIT + 1) }).ok).toBe(false);
  });

  it('rejects a non-integer limit', () => {
    expect(parseDashboardQuery({ limit: 'abc' }).ok).toBe(false);
  });
});

import {
  parseEmployeeQuery,
  DEFAULT_PAGE_V1,
  DEFAULT_PAGE_LIMIT_V1,
  MAX_PAGE_LIMIT_V1,
} from '../../src/utils/employeesQuery';

describe('parseEmployeeQuery (v1)', () => {
  it('applies defaults when no params are provided', () => {
    expect(parseEmployeeQuery({})).toEqual({
      ok: true,
      value: {
        page: DEFAULT_PAGE_V1,
        pageLimit: DEFAULT_PAGE_LIMIT_V1,
        search: '',
        department: '',
        status: '',
        targetCurrencyCode: 'INR',
      },
    });
  });

  it('parses valid page and pageLimit', () => {
    const result = parseEmployeeQuery({ page: '3', pageLimit: '25' });
    expect(result).toEqual({
      ok: true,
      value: {
        page: 3,
        pageLimit: 25,
        search: '',
        department: '',
        status: '',
        targetCurrencyCode: 'INR',
      },
    });
  });

  it('trims the search filter', () => {
    const result = parseEmployeeQuery({ search: '  alice  ' });
    expect(result.ok && result.value.search).toBe('alice');
  });

  it('accepts a valid department and status', () => {
    const result = parseEmployeeQuery({ department: 'ENGINEERING', status: 'ACTIVE' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.department).toBe('ENGINEERING');
      expect(result.value.status).toBe('ACTIVE');
    }
  });

  it('uppercases a valid targetCurrencyCode', () => {
    const result = parseEmployeeQuery({ targetCurrencyCode: 'usd' });
    expect(result.ok && result.value.targetCurrencyCode).toBe('USD');
  });

  it('rejects page < 1', () => {
    expect(parseEmployeeQuery({ page: '0' }).ok).toBe(false);
  });

  it('rejects a non-integer page', () => {
    expect(parseEmployeeQuery({ page: 'abc' }).ok).toBe(false);
  });

  it('rejects pageLimit below 1', () => {
    expect(parseEmployeeQuery({ pageLimit: '0' }).ok).toBe(false);
  });

  it(`rejects pageLimit above ${MAX_PAGE_LIMIT_V1}`, () => {
    expect(parseEmployeeQuery({ pageLimit: String(MAX_PAGE_LIMIT_V1 + 1) }).ok).toBe(false);
  });

  it('rejects an invalid department', () => {
    const result = parseEmployeeQuery({ department: 'INVALID' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/department/);
    }
  });

  it('rejects an invalid status', () => {
    const result = parseEmployeeQuery({ status: 'INVALID' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/status/);
    }
  });

  it('rejects an unsupported targetCurrencyCode', () => {
    const result = parseEmployeeQuery({ targetCurrencyCode: 'XXX' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/targetCurrencyCode/);
    }
  });
});

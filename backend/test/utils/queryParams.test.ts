import {
  firstString,
  parseIntegerParam,
  cleanFilter,
  parseDateParam,
} from '../../src/utils/queryParams';

describe('firstString', () => {
  it('returns the string for a plain string value', () => {
    expect(firstString('hello')).toBe('hello');
  });

  it('returns the first element for an array value', () => {
    expect(firstString(['a', 'b'])).toBe('a');
  });

  it('returns undefined for non-string values', () => {
    expect(firstString(undefined)).toBeUndefined();
    expect(firstString(42)).toBeUndefined();
    expect(firstString({})).toBeUndefined();
  });

  it('returns undefined for an empty array', () => {
    expect(firstString([])).toBeUndefined();
  });
});

describe('parseIntegerParam', () => {
  it('parses a valid integer string', () => {
    expect(parseIntegerParam('5', 1)).toEqual({ ok: true, value: 5 });
  });

  it('parses negative integers', () => {
    expect(parseIntegerParam('-3', 1)).toEqual({ ok: true, value: -3 });
  });

  it('falls back when the value is absent or blank', () => {
    expect(parseIntegerParam(undefined, 20)).toEqual({ ok: true, value: 20 });
    expect(parseIntegerParam('   ', 20)).toEqual({ ok: true, value: 20 });
  });

  it('rejects non-integer input', () => {
    expect(parseIntegerParam('abc', 1)).toEqual({ ok: false });
    expect(parseIntegerParam('1.5', 1)).toEqual({ ok: false });
    expect(parseIntegerParam('1px', 1)).toEqual({ ok: false });
  });
});

describe('cleanFilter', () => {
  it('trims and returns a non-empty value', () => {
    expect(cleanFilter('  hi  ')).toBe('hi');
  });

  it('returns undefined for blank or absent values', () => {
    expect(cleanFilter('   ')).toBeUndefined();
    expect(cleanFilter('')).toBeUndefined();
    expect(cleanFilter(undefined)).toBeUndefined();
  });
});

describe('parseDateParam', () => {
  it('parses a valid date string', () => {
    expect(parseDateParam('2020-01-01')).toEqual({
      ok: true,
      value: new Date('2020-01-01'),
    });
  });

  it('returns undefined value when absent or blank', () => {
    expect(parseDateParam(undefined)).toEqual({ ok: true, value: undefined });
    expect(parseDateParam('   ')).toEqual({ ok: true, value: undefined });
  });

  it('rejects an unparseable date', () => {
    expect(parseDateParam('not-a-date')).toEqual({ ok: false });
  });
});


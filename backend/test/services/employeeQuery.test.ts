import {
  parseEmployeeQuery,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../../src/services/employeeQuery';

describe('parseEmployeeQuery', () => {
  describe('defaults', () => {
    it('applies defaults when no params are provided', () => {
      const result = parseEmployeeQuery({});

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.page).toBe(DEFAULT_PAGE);
      expect(result.value.pageSize).toBe(DEFAULT_PAGE_SIZE);
      expect(result.value.sortBy).toBe('id');
      expect(result.value.sortOrder).toBe('asc');
      expect(result.value.filters).toEqual({});
    });
  });

  describe('pagination', () => {
    it('parses valid page and pageSize', () => {
      const result = parseEmployeeQuery({ page: '3', pageSize: '50' });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.page).toBe(3);
      expect(result.value.pageSize).toBe(50);
    });

    it('rejects a non-numeric page', () => {
      const result = parseEmployeeQuery({ page: 'abc' });
      expect(result.ok).toBe(false);
    });

    it('rejects page less than 1', () => {
      const result = parseEmployeeQuery({ page: '0' });
      expect(result.ok).toBe(false);
    });

    it('rejects pageSize less than 1', () => {
      const result = parseEmployeeQuery({ pageSize: '0' });
      expect(result.ok).toBe(false);
    });

    it(`rejects pageSize greater than ${MAX_PAGE_SIZE}`, () => {
      const result = parseEmployeeQuery({ pageSize: String(MAX_PAGE_SIZE + 1) });
      expect(result.ok).toBe(false);
    });

    it('accepts pageSize equal to the maximum', () => {
      const result = parseEmployeeQuery({ pageSize: String(MAX_PAGE_SIZE) });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.pageSize).toBe(MAX_PAGE_SIZE);
    });
  });

  describe('sorting', () => {
    it('parses a whitelisted sortBy and sortOrder', () => {
      const result = parseEmployeeQuery({ sortBy: 'name', sortOrder: 'desc' });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.sortBy).toBe('name');
      expect(result.value.sortOrder).toBe('desc');
    });

    it('rejects a sortBy that is not on the allow-list', () => {
      const result = parseEmployeeQuery({ sortBy: 'salary' });
      expect(result.ok).toBe(false);
    });

    it('rejects an invalid sortOrder', () => {
      const result = parseEmployeeQuery({ sortOrder: 'sideways' });
      expect(result.ok).toBe(false);
    });
  });

  describe('filters', () => {
    it('collects exact-match filters', () => {
      const result = parseEmployeeQuery({
        country: 'USA',
        department: 'Engineering',
        designation: 'Software Engineer',
        employmentType: 'Full-Time',
        status: 'Active',
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.filters).toMatchObject({
        country: 'USA',
        department: 'Engineering',
        designation: 'Software Engineer',
        employmentType: 'Full-Time',
        status: 'Active',
      });
    });

    it('captures the search term', () => {
      const result = parseEmployeeQuery({ search: 'alice' });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.filters.search).toBe('alice');
    });

    it('ignores empty/whitespace-only filter values', () => {
      const result = parseEmployeeQuery({ country: '   ', search: '' });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.filters.country).toBeUndefined();
      expect(result.value.filters.search).toBeUndefined();
    });

    it('parses joiningDateFrom and joiningDateTo into Date objects', () => {
      const result = parseEmployeeQuery({
        joiningDateFrom: '2020-01-01',
        joiningDateTo: '2022-12-31',
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.filters.joiningDateFrom).toEqual(new Date('2020-01-01'));
      expect(result.value.filters.joiningDateTo).toEqual(new Date('2022-12-31'));
    });

    it('rejects an invalid joiningDateFrom', () => {
      const result = parseEmployeeQuery({ joiningDateFrom: 'not-a-date' });
      expect(result.ok).toBe(false);
    });
  });
});


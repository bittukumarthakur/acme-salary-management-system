import { toSalaryHistoryEntry } from '../../src/services/employeeMapper';
import type { SalaryComponentsBreakdown } from '../../src/models/employee/types';

describe('toSalaryHistoryEntry', () => {
  const structure = {
    id: 42,
    basicSalary: 10000,
    effectiveDate: new Date('2026-07-02T00:00:00.000Z'),
  };

  it('includes the structure base salary in CTC and net pay', () => {
    const components: SalaryComponentsBreakdown = {
      earnings: [{ name: 'Allowance', amount: 1000 }],
      deductions: [{ name: 'PF', amount: 1200 }],
    };

    const entry = toSalaryHistoryEntry(structure, components, true);

    expect(entry.baseSalaryMonthly).toBe(10000);
    // CTC must annualize base salary + allowances: (10000 + 1000) * 12
    expect(entry.ctcAnnual).toBe(132000);
    // Net pay = (base + allowances) - deductions: (10000 + 1000) - 1200
    expect(entry.netPayMonthly).toBe(9800);
  });

  it('does not double count a stray "Basic Salary" earning component', () => {
    const components: SalaryComponentsBreakdown = {
      earnings: [
        { name: 'Basic Salary', amount: 10000 },
        { name: 'Allowance', amount: 1000 },
      ],
      deductions: [],
    };

    const entry = toSalaryHistoryEntry(structure, components, false);

    // Base salary must come from the structure, not be added twice
    expect(entry.ctcAnnual).toBe(132000);
    expect(entry.netPayMonthly).toBe(11000);
  });

  it('computes CTC from base salary alone when there are no components', () => {
    const components: SalaryComponentsBreakdown = { earnings: [], deductions: [] };

    const entry = toSalaryHistoryEntry(structure, components, true);

    expect(entry.baseSalaryMonthly).toBe(10000);
    expect(entry.ctcAnnual).toBe(120000);
    expect(entry.netPayMonthly).toBe(10000);
  });
});

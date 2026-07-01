import {
  calculateSalaryComponents,
  calculateNetPayAndCTC,
} from '../../src/utils/salaryCalculation';

describe('calculateSalaryComponents', () => {
  it('returns the lean breakdown: Basic earning plus PF and ESI deductions', () => {
    const result = calculateSalaryComponents(100000);

    expect(result.earnings).toEqual([{ name: 'Basic Salary', amount: 100000 }]);
    expect(result.deductions).toEqual([
      { name: 'PF', amount: 12000 },
      { name: 'ESI', amount: 750 },
    ]);
  });

  it('includes any additional earning line items (e.g. Allowances)', () => {
    const result = calculateSalaryComponents(100000, [
      { name: 'Allowances', amount: 5000 },
    ]);

    expect(result.earnings).toEqual([
      { name: 'Basic Salary', amount: 100000 },
      { name: 'Allowances', amount: 5000 },
    ]);
  });
});

describe('calculateNetPayAndCTC', () => {
  it('computes net pay and annual CTC from the lean breakdown', () => {
    const components = calculateSalaryComponents(100000, [
      { name: 'Allowances', amount: 5000 },
    ]);

    const { netPayMonthly, ctcAnnual } = calculateNetPayAndCTC(100000, components);

    // Earnings 105000 - deductions (12000 + 750) = 92250
    expect(netPayMonthly).toBe(92250);
    // Total earnings 105000 * 12
    expect(ctcAnnual).toBe(1260000);
  });
});

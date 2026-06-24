import { getEmployees, getEmployeeById } from '../../src/services/employeeService';

describe('getEmployees', () => {
  it('returns all 5 employees', () => {
    const employees = getEmployees();
    expect(employees).toHaveLength(5);
  });

  it('returns employees with correct structure', () => {
    const employees = getEmployees();
    const first = employees[0];

    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('employeeId');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('email');
    expect(first).toHaveProperty('country');
    expect(first).toHaveProperty('department');
    expect(first).toHaveProperty('designation');
    expect(first).toHaveProperty('employmentType');
    expect(first).toHaveProperty('joiningDate');
    expect(first).toHaveProperty('status');
  });
});

describe('getEmployeeById', () => {
  it('finds employee by numeric id string', () => {
    const employee = getEmployeeById('1');
    expect(employee).not.toBeNull();
    expect(employee!.name).toBe('Alice Johnson');
  });

  it('finds employee by employeeId string', () => {
    const employee = getEmployeeById('EMP00003');
    expect(employee).not.toBeNull();
    expect(employee!.name).toBe('Priya Patel');
  });

  it('returns null for non-existent numeric id', () => {
    const employee = getEmployeeById('99');
    expect(employee).toBeNull();
  });

  it('returns null for non-existent employeeId', () => {
    const employee = getEmployeeById('EMP99999');
    expect(employee).toBeNull();
  });

  it('returns null for empty string', () => {
    const employee = getEmployeeById('');
    expect(employee).toBeNull();
  });
});

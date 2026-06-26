import { getEmployees, getEmployeeById } from '../../src/services/employeeService';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  employee: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
};

const aliceRecord = {
  id: 1,
  employeeId: 'EMP00001',
  name: 'Alice Johnson',
  email: 'alice.johnson@acme.com',
  country: 'USA',
  department: 'Engineering',
  designation: 'Software Engineer',
  employmentType: 'Full-Time',
  joiningDate: new Date('2021-03-15T00:00:00.000Z'),
  status: 'Active',
};

const priyaRecord = {
  id: 3,
  employeeId: 'EMP00003',
  name: 'Priya Patel',
  email: 'priya.patel@acme.com',
  country: 'India',
  department: 'Engineering',
  designation: 'Senior Software Engineer',
  employmentType: 'Full-Time',
  joiningDate: new Date('2019-11-20T00:00:00.000Z'),
  status: 'Active',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getEmployees', () => {
  it('returns employees from the database', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([aliceRecord, priyaRecord]);

    const employees = await getEmployees();

    expect(mockedPrisma.employee.findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
    expect(employees).toHaveLength(2);
  });

  it('maps DB records to the expected structure with formatted joiningDate', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([aliceRecord]);

    const employees = await getEmployees();
    const first = employees[0]!;

    expect(first).toMatchObject({
      id: 1,
      employeeId: 'EMP00001',
      name: 'Alice Johnson',
      email: 'alice.johnson@acme.com',
      country: 'USA',
      department: 'Engineering',
      designation: 'Software Engineer',
      employmentType: 'Full-Time',
      joiningDate: '2021-03-15',
      status: 'Active',
    });
  });

  it('returns an empty array when there are no employees', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);

    const employees = await getEmployees();

    expect(employees).toEqual([]);
  });
});

describe('getEmployeeById', () => {
  it('finds employee by numeric id string', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(aliceRecord);

    const employee = await getEmployeeById('1');

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(employee).not.toBeNull();
    expect(employee!.name).toBe('Alice Johnson');
  });

  it('finds employee by employeeId string', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(priyaRecord);

    const employee = await getEmployeeById('EMP00003');

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith({
      where: { employeeId: 'EMP00003' },
    });
    expect(employee).not.toBeNull();
    expect(employee!.name).toBe('Priya Patel');
  });

  it('returns null for non-existent numeric id', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(null);

    const employee = await getEmployeeById('99');

    expect(employee).toBeNull();
  });

  it('returns null for non-existent employeeId', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(null);

    const employee = await getEmployeeById('EMP99999');

    expect(employee).toBeNull();
  });

  it('returns null for empty string without querying the database', async () => {
    const employee = await getEmployeeById('');

    expect(employee).toBeNull();
    expect(mockedPrisma.employee.findUnique).not.toHaveBeenCalled();
  });
});

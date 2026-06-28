import { getEmployees, getEmployeeById } from '../../src/services/employeeService';
import { prisma } from '../../lib/prisma';
import type { EmployeeQuery } from '../../src/models/employee';
import { aliceRow as aliceRecord, priyaRow as priyaRecord } from '../data/employeeRows';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  employee: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    count: jest.Mock;
  };
};

function buildQuery(overrides: Partial<EmployeeQuery> = {}): EmployeeQuery {
  return {
    page: 1,
    pageSize: 20,
    sortBy: 'id',
    sortOrder: 'asc',
    filters: {},
    ...overrides,
  };
}


beforeEach(() => {
  jest.clearAllMocks();
});

describe('getEmployees', () => {
  it('returns a page of employees with pagination metadata', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([aliceRecord, priyaRecord]);
    mockedPrisma.employee.count.mockResolvedValue(42);

    const result = await getEmployees(buildQuery({ page: 2, pageSize: 20 }));

    expect(result.data).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 20,
      totalItems: 42,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it('applies skip/take and orderBy from the query', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);
    mockedPrisma.employee.count.mockResolvedValue(0);

    await getEmployees(buildQuery({ page: 3, pageSize: 10, sortBy: 'name', sortOrder: 'desc' }));

    expect(mockedPrisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
        orderBy: { name: 'desc' },
      }),
    );
  });

  it('maps DB records to the API structure with formatted joiningDate', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([aliceRecord]);
    mockedPrisma.employee.count.mockResolvedValue(1);

    const result = await getEmployees(buildQuery());

    expect(result.data[0]).toMatchObject({
      employeeId: 'EMP00001',
      joiningDate: '2021-03-15',
      status: 'ACTIVE',
      fullName: 'Alice Johnson',
      email: 'alice.johnson@acme.com',
    });
  });

  it('builds a case-insensitive OR where clause for search', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);
    mockedPrisma.employee.count.mockResolvedValue(0);

    await getEmployees(buildQuery({ filters: { search: 'ali' } }));

    const args = mockedPrisma.employee.findMany.mock.calls[0][0];
    expect(args.where.OR).toEqual([
      { name: { contains: 'ali', mode: 'insensitive' } },
      { email: { contains: 'ali', mode: 'insensitive' } },
      { employeeId: { contains: 'ali', mode: 'insensitive' } },
    ]);
  });

  it('builds exact-match where clauses for field filters', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);
    mockedPrisma.employee.count.mockResolvedValue(0);

    await getEmployees(
      buildQuery({
        filters: {
          country: 'USA',
          department: 'Engineering',
          designation: 'Software Engineer',
          employmentType: 'Full-Time',
          status: 'Active',
        },
      }),
    );

    const args = mockedPrisma.employee.findMany.mock.calls[0][0];
    expect(args.where).toMatchObject({
      country: 'USA',
      department: { name: 'Engineering' },
      designation: { title: 'Software Engineer' },
      employmentType: 'Full-Time',
      status: 'Active',
    });
  });

  it('builds a gte/lte range for joiningDate filters', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);
    mockedPrisma.employee.count.mockResolvedValue(0);

    const from = new Date('2020-01-01');
    const to = new Date('2022-12-31');
    await getEmployees(buildQuery({ filters: { joiningDateFrom: from, joiningDateTo: to } }));

    const args = mockedPrisma.employee.findMany.mock.calls[0][0];
    expect(args.where.joiningDate).toEqual({ gte: from, lte: to });
  });

  it('passes the same where clause to count', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);
    mockedPrisma.employee.count.mockResolvedValue(0);

    await getEmployees(buildQuery({ filters: { country: 'USA' } }));

    const findArgs = mockedPrisma.employee.findMany.mock.calls[0][0];
    expect(mockedPrisma.employee.count).toHaveBeenCalledWith({ where: findArgs.where });
  });

  it('returns an empty page when there are no matches', async () => {
    mockedPrisma.employee.findMany.mockResolvedValue([]);
    mockedPrisma.employee.count.mockResolvedValue(0);

    const result = await getEmployees(buildQuery());

    expect(result.data).toEqual([]);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });
});

describe('getEmployeeById', () => {
  it('finds employee by numeric id string', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(aliceRecord);

    const employee = await getEmployeeById('1');

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        department: {
          select: { id: true, name: true },
        },
        designation: {
          select: { id: true, title: true },
        },
      },
    });
    expect(employee).not.toBeNull();
    expect(employee!.fullName).toBe('Alice Johnson');
  });

  it('finds employee by employeeId string', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(priyaRecord);

    const employee = await getEmployeeById('EMP00003');

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith({
      where: { employeeId: 'EMP00003' },
      include: {
        department: {
          select: { id: true, name: true },
        },
        designation: {
          select: { id: true, title: true },
        },
      },
    });
    expect(employee).not.toBeNull();
    expect(employee!.fullName).toBe('Priya Patel');
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

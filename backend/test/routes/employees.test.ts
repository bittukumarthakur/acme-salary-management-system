import request from 'supertest';
import { createApp } from '../../src/app';
import { getEmployees, getEmployeeById } from '../../src/services/employeeService';
import { alice, bob } from '../data/employees';

jest.mock('../../src/services/employeeService', () => ({
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
}));

const mockedGetEmployees = getEmployees as jest.MockedFunction<typeof getEmployees>;
const mockedGetEmployeeById = getEmployeeById as jest.MockedFunction<typeof getEmployeeById>;

const app = createApp();

function paginated(data: (typeof alice)[], overrides = {}) {
  return {
    data,
    pagination: {
      page: 1,
      pageSize: 20,
      totalItems: data.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      ...overrides,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/employees', () => {
  it('returns 200 with a page of employees and pagination metadata', async () => {
    mockedGetEmployees.mockResolvedValue(paginated([alice, bob], { totalItems: 2 }));

    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      pageSize: 20,
      totalItems: 2,
    });
  });

  it('returns employees with expected fields', async () => {
    mockedGetEmployees.mockResolvedValue(paginated([alice]));

    const res = await request(app).get('/api/employees');
    const employee = res.body.data[0];

    expect(employee).toHaveProperty('id');
    expect(employee).toHaveProperty('employeeId');
    expect(employee).toHaveProperty('name');
    expect(employee).toHaveProperty('email');
  });

  it('passes parsed pagination, sorting and filters to the service', async () => {
    mockedGetEmployees.mockResolvedValue(paginated([alice]));

    await request(app)
      .get('/api/employees')
      .query({
        page: '2',
        pageSize: '5',
        sortBy: 'name',
        sortOrder: 'desc',
        country: 'USA',
        search: 'ali',
      });

    expect(mockedGetEmployees).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 5,
        sortBy: 'name',
        sortOrder: 'desc',
        filters: expect.objectContaining({ country: 'USA', search: 'ali' }),
      }),
    );
  });

  it('returns 400 for an invalid query parameter without calling the service', async () => {
    const res = await request(app).get('/api/employees').query({ pageSize: '0' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedGetEmployees).not.toHaveBeenCalled();
  });

  it('returns 500 when the service throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetEmployees.mockRejectedValue(new Error('db down'));

    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch employees');
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

describe('GET /api/employees/:id', () => {
  it('returns 200 with employee for valid id', async () => {
    mockedGetEmployeeById.mockResolvedValue(alice);

    const res = await request(app).get('/api/employees/1');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice Johnson');
  });

  it('returns 200 with employee for valid employeeId', async () => {
    mockedGetEmployeeById.mockResolvedValue(bob);

    const res = await request(app).get('/api/employees/EMP00002');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Bob Smith');
  });

  it('returns 404 for non-existent id', async () => {
    mockedGetEmployeeById.mockResolvedValue(null);

    const res = await request(app).get('/api/employees/99');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Employee not found');
  });

  it('returns 500 when the service throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetEmployeeById.mockRejectedValue(new Error('db down'));

    const res = await request(app).get('/api/employees/1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch employee');
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

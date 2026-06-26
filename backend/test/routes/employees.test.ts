import request from 'supertest';
import { createApp } from '../../src/app';
import { getEmployees, getEmployeeById } from '../../src/services/employeeService';

jest.mock('../../src/services/employeeService', () => ({
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
}));

const mockedGetEmployees = getEmployees as jest.MockedFunction<typeof getEmployees>;
const mockedGetEmployeeById = getEmployeeById as jest.MockedFunction<typeof getEmployeeById>;

const app = createApp();

const alice = {
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
};

const bob = {
  ...alice,
  id: 2,
  employeeId: 'EMP00002',
  name: 'Bob Smith',
  email: 'bob.smith@acme.com',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/employees', () => {
  it('returns 200 with all employees', async () => {
    mockedGetEmployees.mockResolvedValue([alice, bob]);

    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns employees with expected fields', async () => {
    mockedGetEmployees.mockResolvedValue([alice]);

    const res = await request(app).get('/api/employees');
    const employee = res.body.data[0];

    expect(employee).toHaveProperty('id');
    expect(employee).toHaveProperty('employeeId');
    expect(employee).toHaveProperty('name');
    expect(employee).toHaveProperty('email');
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

import request from 'supertest';
import { app } from '../../src/app';

describe('GET /api/employees', () => {
  it('returns 200 with all employees', async () => {
    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });

  it('returns employees with expected fields', async () => {
    const res = await request(app).get('/api/employees');
    const employee = res.body.data[0];

    expect(employee).toHaveProperty('id');
    expect(employee).toHaveProperty('employeeId');
    expect(employee).toHaveProperty('name');
    expect(employee).toHaveProperty('email');
  });
});

describe('GET /api/employees/:id', () => {
  it('returns 200 with employee for valid id', async () => {
    const res = await request(app).get('/api/employees/1');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice Johnson');
  });

  it('returns 200 with employee for valid employeeId', async () => {
    const res = await request(app).get('/api/employees/EMP00002');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Bob Smith');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).get('/api/employees/99');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Employee not found');
  });
});

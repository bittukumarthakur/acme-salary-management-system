import type { Request, Response } from 'express';
import { mapDomainError, asyncRoute } from '../../src/utils/routeErrorHandler';
import {
  EmployeeNotFoundError,
  EmailAlreadyInUseError,
  DuplicateSalaryDateError,
} from '../../src/services/errors';
import { DUPLICATE_EMPLOYEE_ID_ERROR } from '../../src/services/employeesService';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('mapDomainError', () => {
  it('maps EmployeeNotFoundError to 404 with its message', () => {
    const error = new EmployeeNotFoundError(1);
    expect(mapDomainError(error)).toEqual({
      status: 404,
      body: { error: error.message },
    });
  });

  it('maps EmailAlreadyInUseError to 409 with details', () => {
    expect(mapDomainError(new EmailAlreadyInUseError('a@b.com'))).toEqual({
      status: 409,
      body: {
        error: 'Email already in use by another employee',
        details: { email: 'This email is already associated with another employee' },
      },
    });
  });

  it('maps DuplicateSalaryDateError to 409 with its message', () => {
    const error = new DuplicateSalaryDateError('2024-01-01');
    expect(mapDomainError(error)).toEqual({
      status: 409,
      body: { error: error.message },
    });
  });

  it('maps the duplicate employee id error to 409 with code and details', () => {
    expect(mapDomainError(new Error(DUPLICATE_EMPLOYEE_ID_ERROR))).toEqual({
      status: 409,
      body: {
        error: 'Employee ID already exists',
        code: 'DUPLICATE_EMPLOYEE_ID',
        details: { employeeId: 'generated employee ID conflict' },
      },
    });
  });

  it('returns null for an unrecognized error', () => {
    expect(mapDomainError(new Error('Database error'))).toBeNull();
  });
});

describe('asyncRoute', () => {
  const req = {} as Request;

  it('invokes the handler and does not touch the response on success', async () => {
    const handler = jest.fn(async (_req: Request, res: Response) => {
      res.json({ ok: true });
    });
    const res = mockRes();

    await asyncRoute({ logTag: 'x', fallbackMessage: 'x' }, handler)(req, res, jest.fn());

    expect(handler).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(res.status).not.toHaveBeenCalledWith(500);
  });

  it('maps a thrown domain error via mapDomainError', async () => {
    const res = mockRes();
    const handler = async () => {
      throw new EmployeeNotFoundError(42);
    };

    await asyncRoute({ logTag: 'x', fallbackMessage: 'x' }, handler)(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Employee 42 not found' });
  });

  it('logs with the route logTag and returns 500 with the fallback message for unknown errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const res = mockRes();
    const thrown = new Error('Database error');
    const handler = async () => {
      throw thrown;
    };

    await asyncRoute(
      { logTag: 'Failed to fetch employees', fallbackMessage: 'Failed to fetch employees' },
      handler,
    )(req, res, jest.fn());

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch employees'),
      thrown,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch employees' });

    consoleErrorSpy.mockRestore();
  });

  it('supports a function fallbackMessage derived from the error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const res = mockRes();
    const handler = async () => {
      throw new Error('boom');
    };

    await asyncRoute(
      {
        logTag: 'Failed to update employee',
        fallbackMessage: (error) => (error instanceof Error ? error.message : 'fallback'),
      },
      handler,
    )(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' });

    consoleErrorSpy.mockRestore();
  });
});

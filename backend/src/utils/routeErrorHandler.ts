/**
 * Centralized route error handling for the API.
 *
 * `mapDomainError` maps known domain errors (thrown by services) to their HTTP
 * status + response body. `asyncRoute` wraps an async handler: on throw it maps
 * domain errors centrally, otherwise it logs with the route's `logTag` and
 * responds 500 with the route's `fallbackMessage`.
 */

import type { Request, RequestHandler, Response } from 'express';
import {
  EmployeeNotFoundError,
  EmailAlreadyInUseError,
  DuplicateSalaryDateError,
} from '../services/updateEmployeeService';
import { DUPLICATE_EMPLOYEE_ID_ERROR } from '../services/employeesService';

export interface MappedError {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Maps a known domain error to its HTTP status + response body.
 * Returns `null` for unrecognized errors so the caller can emit a generic 500.
 */
export function mapDomainError(error: unknown): MappedError | null {
  if (error instanceof EmployeeNotFoundError) {
    return { status: 404, body: { error: error.message } };
  }

  if (error instanceof EmailAlreadyInUseError) {
    return {
      status: 409,
      body: {
        error: 'Email already in use by another employee',
        details: { email: 'This email is already associated with another employee' },
      },
    };
  }

  if (error instanceof DuplicateSalaryDateError) {
    return { status: 409, body: { error: error.message } };
  }

  if (
    error instanceof Error &&
    (error.message === DUPLICATE_EMPLOYEE_ID_ERROR ||
      error.message === 'EMPLOYEE_ID_ALREADY_EXISTS')
  ) {
    return {
      status: 409,
      body: {
        error: 'Employee ID already exists',
        code: 'DUPLICATE_EMPLOYEE_ID',
        details: { employeeId: 'generated employee ID conflict' },
      },
    };
  }

  return null;
}

export interface RouteErrorContext {
  /** Prefix used when logging an unexpected error (e.g. 'Failed to fetch employees'). */
  logTag: string;
  /** Body message (or deriver) for the generic 500 response. */
  fallbackMessage: string | ((error: unknown) => string);
}

/**
 * Wraps an async route handler with centralized error handling.
 * Domain errors are mapped via `mapDomainError`; anything else is logged with
 * `context.logTag` and returned as a 500 using `context.fallbackMessage`.
 */
export function asyncRoute(
  context: RouteErrorContext,
  handler: (req: Request, res: Response) => Promise<void>,
): RequestHandler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const mapped = mapDomainError(error);
      if (mapped) {
        res.status(mapped.status).json(mapped.body);
        return;
      }

      console.error(`${context.logTag}:`, error);
      const message =
        typeof context.fallbackMessage === 'function'
          ? context.fallbackMessage(error)
          : context.fallbackMessage;
      res.status(500).json({ error: message });
    }
  };
}

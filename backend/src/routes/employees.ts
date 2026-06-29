/**
 * API routes for employees endpoint.
 * GET /api/v1/employees - List employees with filtering, pagination, and currency conversion.
 */

import { Router, Request, Response } from 'express';
import {
  createEmployee,
  DUPLICATE_EMPLOYEE_ID_ERROR,
  getEmployeeById,
  getEmployees,
} from '../services/employeesService';
import { parseEmployeeQuery } from '../utils/employeesQuery';
import { parseCreateEmployeePayload } from '../utils/createEmployeePayload';
import { isValidEmployeeCodeId, normalizeEmployeeCodeId } from '../utils/employeeId';
import type { ErrorResponse, ValidationErrorResponse } from '../models/employee/types';

const router = Router();

/**
 * GET /api/v1/employees
 * Lists employees with optional filtering, pagination, and salary currency conversion.
 *
 * Query params:
 * - search: string (optional) - Search by name, email, or employeeId
 * - department: string (optional) - Department enum filter
 * - status: string (optional) - Employment status enum filter
 * - targetCurrencyCode: string (optional, default: 'INR') - Currency for salary conversion
 * - page: number (optional, default: 1) - Page number (1-based)
 * - pageLimit: number (optional, default: 10) - Results per page (1-100)
 *
 * Success response: 200 with { data, meta, filters }
 * Error response: 400 for invalid params, 500 for server errors
 */
router.get('/', async (req: Request, res: Response<unknown | ErrorResponse>) => {
  try {
    // Parse and validate query parameters
    const parseResult = parseEmployeeQuery(req.query as Record<string, unknown>);
    if (!parseResult.ok) {
      res.status(400).json({ error: parseResult.error });
      return;
    }

    // Fetch data from service
    const result = await getEmployees(parseResult.value);
    res.json(result);
  } catch (error) {
    // Log error and return 500
    console.error('Failed to fetch employees:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch employees',
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * POST /api/v1/employees
 * Creates a new employee from Add Employee form payload.
 */
router.post('/', async (req: Request, res: Response<unknown | ValidationErrorResponse>) => {
  const parseResult = parseCreateEmployeePayload(req.body);
  if (!parseResult.ok) {
    res.status(400).json({
      error: parseResult.error,
      details: parseResult.details,
    });
    return;
  }

  try {
    const createdEmployee = await createEmployee(parseResult.value);
    res.status(201).json(createdEmployee);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === DUPLICATE_EMPLOYEE_ID_ERROR ||
        error.message === 'EMPLOYEE_ID_ALREADY_EXISTS')
    ) {
      res.status(409).json({
        error: 'Employee ID already exists',
        code: 'DUPLICATE_EMPLOYEE_ID',
        details: {
          employeeId: 'generated employee ID conflict',
        },
      });
      return;
    }

    console.error('Failed to create employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

/**
 * GET /api/v1/employees/:id
 * Fetches one employee by employee code id (EMP followed by digits).
 */
router.get('/:id', async (req: Request, res: Response<unknown | ErrorResponse>) => {
  try {
    let id: string | undefined;
    if (Array.isArray(req.params.id)) {
      id = req.params.id[0];
    } else {
      id = req.params.id;
    }
    if (!id) {
      res.status(400).json({ error: 'Invalid employee id format. Use EMP followed by digits.' });
      return;
    }
    const rawEmployeeId = id.trim();
    if (!isValidEmployeeCodeId(rawEmployeeId)) {
      res.status(400).json({ error: 'Invalid employee id format. Use EMP followed by digits.' });
      return;
    }

    const employee = await getEmployeeById(normalizeEmployeeCodeId(rawEmployeeId));

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json(employee);
  } catch (error) {
    console.error('Failed to fetch employee by id:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

export default router;

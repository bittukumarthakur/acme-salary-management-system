/**
 * API routes for employees endpoint.
 * GET /api/v1/employees - List employees with filtering, pagination, and currency conversion.
 * POST /api/v1/employees - Create a new employee.
 * GET /api/v1/employees/:id - Get employee by ID.
 * GET /api/v1/employees/:id/salary-history - Get employee salary history.
 * PUT /api/v1/employees/:id - Update employee details and salary.
 */

import { Router, Request, Response } from 'express';
import {
  createEmployee,
  DUPLICATE_EMPLOYEE_ID_ERROR,
  getEmployeeById,
  getEmployees,
} from '../services/employeesService';
import { getSalaryHistory } from '../services/salaryHistoryService';
import {
  updateEmployee,
  EmployeeNotFoundError,
  EmailAlreadyInUseError,
  DuplicateSalaryDateError,
} from '../services/updateEmployeeService';
import { parseEmployeeQuery } from '../utils/employeesQuery';
import { parseCreateEmployeePayload } from '../utils/createEmployeePayload';
import { parseUpdateEmployeePayload } from '../utils/updateEmployeePayload';
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

/**
 * GET /api/v1/employees/:id/salary-history
 * Fetches salary history for an employee.
 * Returns all historical salary revisions ordered newest-first.
 */
router.get('/:id/salary-history', async (req: Request, res: Response<unknown | ErrorResponse>) => {
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

    const salaryHistory = await getSalaryHistory(normalizeEmployeeCodeId(rawEmployeeId));

    if (!salaryHistory) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json(salaryHistory);
  } catch (error) {
    console.error('Failed to fetch salary history:', error);
    res.status(500).json({ error: 'Failed to fetch salary history' });
  }
});

/**
 * PUT /api/v1/employees/:id
 * Updates an employee's basic information and salary structure.
 *
 * Request body:
 * - fullName: string (required)
 * - email: string (required, must be unique)
 * - phone: string (required)
 * - department: string (required, must be valid enum)
 * - designation: string (required)
 * - employmentType: string (required, must be valid enum)
 * - status: string (required, must be valid enum)
 * - joiningDate: string (required, ISO date)
 * - country: string (required)
 * - currency: string (required, ISO 4217 code)
 * - bankAccount: string (required, FK reference)
 * - salary: object (required)
 *   - baseMonthlySalary: number (required, positive)
 *   - effectiveFrom: string (required, ISO date, >= joiningDate)
 *
 * Success response: 200 with updated employee and salary details
 * Error responses:
 * - 400: Validation error or employeeId in body
 * - 404: Employee not found
 * - 409: Email conflict or duplicate salary date
 * - 500: Server error
 */
router.put('/:id', async (req: Request, res: Response<unknown | ValidationErrorResponse>) => {
  try {
    // Parse and validate request body
    const parseResult = parseUpdateEmployeePayload(req.body);
    if (!parseResult.ok) {
      // Check for specific errors to return as main error message
      if ('employeeId' in parseResult.details) {
        res.status(400).json({
          error: parseResult.details.employeeId,
          details: parseResult.details,
        });
      } else if ('salary.effectiveFrom' in parseResult.details) {
        res.status(400).json({
          error: parseResult.details['salary.effectiveFrom'],
          details: parseResult.details,
        });
      } else {
        res.status(400).json({
          error: parseResult.error,
          details: parseResult.details,
        });
      }
      return;
    }

    // Extract and validate ID parameter
    let id: string | undefined;
    if (Array.isArray(req.params.id)) {
      id = req.params.id[0];
    } else {
      id = req.params.id;
    }

    if (!id) {
      res.status(400).json({ error: 'Invalid employee id parameter' });
      return;
    }

    // Try to update the employee
    const updatedEmployee = await updateEmployee(id.trim(), parseResult.value);
    res.status(200).json(updatedEmployee);
  } catch (error) {
    if (error instanceof EmployeeNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error instanceof EmailAlreadyInUseError) {
      res.status(409).json({
        error: 'Email already in use by another employee',
        details: {
          email: 'This email is already associated with another employee',
        },
      });
      return;
    }

    if (error instanceof DuplicateSalaryDateError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error('Failed to update employee:', error);
    const errorMsg = error instanceof Error ? error.message : 'Failed to update employee';
    res.status(500).json({ error: errorMsg });
  }
});

export default router;

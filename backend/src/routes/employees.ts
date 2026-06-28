/**
 * API routes for employees endpoint.
 * GET /api/v1/employees - List employees with filtering, pagination, and currency conversion.
 */

import { Router, Request, Response } from 'express';
import { getEmployees } from '../services/employeesService';
import { parseEmployeeQuery } from '../utils/employeesQuery';
import type { ErrorResponse } from '../models/employee/types';

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
router.get('/', async (req: Request, res: Response<any | ErrorResponse>) => {
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

export default router;

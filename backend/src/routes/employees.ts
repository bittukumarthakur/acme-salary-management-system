/**
 * API routes for the employees resource. This file wires paths/methods to the
 * handlers in `../controllers/employeesController`.
 *
 * GET  /api/v1/employees                     - List employees (filter/paginate/convert).
 * POST /api/v1/employees                     - Create a new employee.
 * GET  /api/v1/employees/:id                 - Get employee by employee code id.
 * GET  /api/v1/employees/:id/salary-history  - Get employee salary history.
 * PUT  /api/v1/employees/:id                 - Update employee details and salary.
 */

import { Router } from 'express';
import {
  listEmployees,
  createEmployeeHandler,
  getEmployee,
  getEmployeeSalaryHistory,
  updateEmployeeHandler,
} from '../controllers/employeesController';

const router = Router();

router.get('/', listEmployees);
router.post('/', createEmployeeHandler);
router.get('/:id', getEmployee);
router.get('/:id/salary-history', getEmployeeSalaryHistory);
router.put('/:id', updateEmployeeHandler);

export default router;

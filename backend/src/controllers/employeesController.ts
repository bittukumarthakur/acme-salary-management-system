/**
 * Request handlers for the employees resource.
 * Each handler is wrapped with `asyncRoute` for centralized error handling; the
 * router file wires these to paths/methods.
 */

import type { Request, Response } from 'express';
import { createEmployee, getEmployeeById, getEmployees } from '../services/employeesService';
import { getSalaryHistory } from '../services/salaryHistoryService';
import { updateEmployee } from '../services/updateEmployeeService';
import { parseEmployeeQuery } from '../utils/employeesQuery';
import { parseCreateEmployeePayload } from '../utils/createEmployeePayload';
import { parseUpdateEmployeePayload } from '../utils/updateEmployeePayload';
import { extractEmployeeCodeId } from '../utils/employeeId';
import { firstString } from '../utils/queryParams';
import { asyncRoute } from '../utils/routeErrorHandler';

/**
 * GET /api/v1/employees
 * Lists employees with optional filtering, pagination, and salary currency conversion.
 */
export const listEmployees = asyncRoute(
  { logTag: 'Failed to fetch employees', fallbackMessage: 'Failed to fetch employees' },
  async (req: Request, res: Response) => {
    const parseResult = parseEmployeeQuery(req.query as Record<string, unknown>);
    if (!parseResult.ok) {
      res.status(400).json({ error: parseResult.error });
      return;
    }

    const result = await getEmployees(parseResult.value);
    res.json(result);
  },
);

/**
 * POST /api/v1/employees
 * Creates a new employee from Add Employee form payload.
 */
export const createEmployeeHandler = asyncRoute(
  { logTag: 'Failed to create employee', fallbackMessage: 'Failed to create employee' },
  async (req: Request, res: Response) => {
    const parseResult = parseCreateEmployeePayload(req.body);
    if (!parseResult.ok) {
      res.status(400).json({
        error: parseResult.error,
        details: parseResult.details,
      });
      return;
    }

    const createdEmployee = await createEmployee(parseResult.value);
    res.status(201).json(createdEmployee);
  },
);

/**
 * GET /api/v1/employees/:id
 * Fetches one employee by employee code id (EMP followed by digits).
 */
export const getEmployee = asyncRoute(
  { logTag: 'Failed to fetch employee by id', fallbackMessage: 'Failed to fetch employee' },
  async (req: Request, res: Response) => {
    const idResult = extractEmployeeCodeId(req.params.id);
    if (!idResult.ok) {
      res.status(400).json({ error: idResult.error });
      return;
    }

    const employee = await getEmployeeById(idResult.value);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json(employee);
  },
);

/**
 * GET /api/v1/employees/:id/salary-history
 * Fetches salary history for an employee (newest-first).
 */
export const getEmployeeSalaryHistory = asyncRoute(
  { logTag: 'Failed to fetch salary history', fallbackMessage: 'Failed to fetch salary history' },
  async (req: Request, res: Response) => {
    const idResult = extractEmployeeCodeId(req.params.id);
    if (!idResult.ok) {
      res.status(400).json({ error: idResult.error });
      return;
    }

    const salaryHistory = await getSalaryHistory(idResult.value);
    if (!salaryHistory) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json(salaryHistory);
  },
);

/**
 * PUT /api/v1/employees/:id
 * Updates an employee's basic information and salary structure.
 * The `:id` param is the numeric database id (resolved by the service).
 */
export const updateEmployeeHandler = asyncRoute(
  {
    logTag: 'Failed to update employee',
    fallbackMessage: (error) =>
      error instanceof Error ? error.message : 'Failed to update employee',
  },
  async (req: Request, res: Response) => {
    const parseResult = parseUpdateEmployeePayload(req.body);
    if (!parseResult.ok) {
      // Surface specific field errors as the main message where present.
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

    const id = firstString(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid employee id parameter' });
      return;
    }

    const updatedEmployee = await updateEmployee(id.trim(), parseResult.value);
    res.status(200).json(updatedEmployee);
  },
);

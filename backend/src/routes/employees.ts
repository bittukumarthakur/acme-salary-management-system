import { Router, Request, Response } from 'express';
import { getEmployees, getEmployeeById } from '../services/employeeService.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const employees = getEmployees();
  res.json({ data: employees });
});

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const employee = getEmployeeById(req.params.id);

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  res.json({ data: employee });
});

export default router;

import { Router, Request, Response } from 'express';
import { getEmployeeById, getEmployees } from '../services/employeeService';
import { parseEmployeeQuery } from '../services/employeeQuery';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const parsed = parseEmployeeQuery(req.query as Record<string, unknown>);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const result = await getEmployees(parsed.value);
    res.json(result);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const employee = await getEmployeeById(req.params.id);

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json({ data: employee });
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

export default router;

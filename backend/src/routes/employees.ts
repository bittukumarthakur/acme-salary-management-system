import { Router, Request, Response } from 'express';
import { getEmployeeById, getEmployees } from '../services/employeeService';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const employees = await getEmployees();
    res.json({ data: employees });
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

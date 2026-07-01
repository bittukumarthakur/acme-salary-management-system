import { Router, Request, Response } from 'express';
import { getDashboard } from '../services/dashboardService';
import { parseDashboardQuery } from '../utils/dashboardQuery';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const parseResult = parseDashboardQuery(req.query as Record<string, unknown>);
  if (!parseResult.ok) {
    res.status(400).json({ error: parseResult.error });
    return;
  }

  try {
    const data = await getDashboard(parseResult.value);
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import {
  getDashboard,
  SUPPORTED_COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../services/dashboardService';
import { cleanFilter, parseIntegerParam } from '../utils/queryParams';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const raw = req.query as Record<string, unknown>;

  // Validate countryCode
  const countryCodeRaw = cleanFilter(raw.countryCode)?.toUpperCase() ?? DEFAULT_COUNTRY;
  if (!SUPPORTED_COUNTRIES.has(countryCodeRaw)) {
    res.status(400).json({
      error: `Invalid "countryCode": must be one of ${[...SUPPORTED_COUNTRIES].sort().join(', ')}`,
    });
    return;
  }

  // Validate limit
  const limitResult = parseIntegerParam(raw.limit, DEFAULT_LIMIT);
  if (!limitResult.ok || limitResult.value < 1 || limitResult.value > MAX_LIMIT) {
    res.status(400).json({
      error: `Invalid "limit": must be an integer between 1 and ${MAX_LIMIT}`,
    });
    return;
  }

  try {
    const data = await getDashboard({ countryCode: countryCodeRaw, limit: limitResult.value });
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;

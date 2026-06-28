import express from 'express';
import cors from 'cors';
import employeesRouter from './routes/employees';
import dashboardRouter from './routes/dashboard';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/employees', employeesRouter);
  app.use('/api/v1/dashboard', dashboardRouter);

  return app;
};

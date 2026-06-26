import express from 'express';
import router from './routes/employees';

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/employees', router);

  return app;
};

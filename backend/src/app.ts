import express from 'express';
import employeesRouter from './routes/employees.js';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/employees', employeesRouter);

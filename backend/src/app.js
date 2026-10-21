import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim());

app.use(cors({ origin: origins, exposedHeaders: ['Content-Disposition'] }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'Employee & Task Management API is running',
    hint: 'Try /api/dashboard',
  })
);

app.use(notFound);
app.use(errorHandler);

export default app;

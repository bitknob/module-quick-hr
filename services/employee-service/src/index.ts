import './config/env';
import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter } from '@hrm/common';
import { connectDatabase } from './config/database';
import employeeRoutes from './routes/employee.routes';
import './middleware/auth';

const app = express();
const PORT = process.env.PORT || process.env.EMPLOYEE_SERVICE_PORT || 9402;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/employees', employeeRoutes);

app.get('/health', (req, res) => {
  ResponseFormatter.success(
    res,
    { status: 'ok', service: 'employee-service' },
    'Employee Service is healthy'
  );
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      logger.info(`Employee Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


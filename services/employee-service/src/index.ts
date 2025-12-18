import './config/env';
import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter, setRequestLogger, requestLogger, initializeFirebase } from '@hrm/common';
import { connectDatabase } from './config/database';
import { RequestLogModel } from './models/RequestLog.model';
import './middleware/auth'; 
import employeeRoutes from './routes/employee.routes';
import approvalRoutes from './routes/approval.routes';
import companyRoutes from './routes/company.routes';
import departmentRoutes from './routes/department.routes';
import searchRoutes from './routes/search.routes';

const app = express();
const PORT = process.env.PORT || process.env.EMPLOYEE_SERVICE_PORT || 9402;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await connectDatabase();
    
    // Initialize Firebase
    try {
      initializeFirebase();
      logger.info('Firebase initialized successfully');
    } catch (error) {
      logger.warn('Firebase initialization failed:', error);
      // Continue server startup even if Firebase fails
    }
    
    setRequestLogger(async (log: any) => {
      try {
        await RequestLogModel.create(log);
      } catch (error) {
        logger.error('Failed to save request log:', error);
      }
    }, 'employee-service');
    
    app.use(requestLogger);
    
    app.use('/api/employees', employeeRoutes);
    app.use('/api/approvals', approvalRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/departments', departmentRoutes);
    app.use('/api/search', searchRoutes);

app.get('/health', (req, res) => {
  ResponseFormatter.success(
    res,
    { status: 'ok', service: 'employee-service' },
    'Employee Service is healthy'
  );
});

    app.use(errorHandler);
    
    app.listen(PORT, () => {
      logger.info(`Employee Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


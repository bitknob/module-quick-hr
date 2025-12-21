import './config/env';
import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter, setRequestLogger, requestLogger, initializeFirebase } from '@hrm/common';
import { connectDatabase } from './config/database';
import { RequestLogModel } from './models/RequestLog.model';
import './middleware/auth';
import salaryStructureRoutes from './routes/salaryStructure.routes';
import payrollRoutes from './routes/payroll.routes';
import taxConfigurationRoutes from './routes/taxConfiguration.routes';
import variablePayRoutes from './routes/variablePay.routes';
import arrearsRoutes from './routes/arrears.routes';
import loanRoutes from './routes/loan.routes';
import reimbursementRoutes from './routes/reimbursement.routes';
import taxDeclarationRoutes from './routes/taxDeclaration.routes';
import payslipTemplateRoutes from './routes/payslipTemplate.routes';
import payslipScheduleRoutes from './routes/payslipSchedule.routes';
import './models';

const app = express();
const PORT = process.env.PORT || process.env.PAYROLL_SERVICE_PORT || 9403;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await connectDatabase();
    
    try {
      initializeFirebase();
      logger.info('Firebase initialized successfully');
    } catch (error) {
      logger.warn('Firebase initialization failed:', error);
    }
    
    setRequestLogger(async (log: any) => {
      try {
        await RequestLogModel.create(log);
      } catch (error) {
        logger.error('Failed to save request log:', error);
      }
    }, 'payroll-service');
    
    app.use(requestLogger);
    
    app.use('/api/payroll/salary-structures', salaryStructureRoutes);
    app.use('/api/payroll', payrollRoutes);
    app.use('/api/payroll/tax-configurations', taxConfigurationRoutes);
    app.use('/api/payroll/variable-pay', variablePayRoutes);
    app.use('/api/payroll/arrears', arrearsRoutes);
    app.use('/api/payroll/loans', loanRoutes);
    app.use('/api/payroll/reimbursements', reimbursementRoutes);
    app.use('/api/payroll/tax-declarations', taxDeclarationRoutes);
    app.use('/api/payroll/payslip-templates', payslipTemplateRoutes);
    app.use('/api/payroll/payslip-schedules', payslipScheduleRoutes);

    app.get('/health', (req, res) => {
      ResponseFormatter.success(
        res,
        { status: 'ok', service: 'payroll-service' },
        'Payroll Service is healthy'
      );
    });

    app.use(errorHandler);
    
    app.listen(PORT, () => {
      logger.info(`Payroll Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


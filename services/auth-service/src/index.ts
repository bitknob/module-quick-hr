import './config/env';
import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter, setRequestLogger, requestLogger } from '@hrm/common';
import { connectDatabase } from './config/database';
import { initializeEmailService } from './config/email';
import { RequestLogModel } from './models/RequestLog.model';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/device.routes';

const app = express();
const PORT = process.env.PORT || process.env.AUTH_SERVICE_PORT || 9401;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await connectDatabase();
    
    setRequestLogger(async (log: any) => {
      try {
        await RequestLogModel.create(log);
      } catch (error) {
        logger.error('Failed to save request log:', error);
      }
    }, 'auth-service');
    
    app.use(requestLogger);
    
    initializeEmailService();
    
    app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

app.get('/health', (req, res) => {
  ResponseFormatter.success(
    res,
    { status: 'ok', service: 'auth-service' },
    'Auth Service is healthy'
  );
});

    app.use(errorHandler);
    
    app.listen(PORT, () => {
      logger.info(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


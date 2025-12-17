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

// Body parsing with error handling for aborted requests
app.use((req, res, next) => {
  express.json({ limit: '10mb' })(req, res, (err: any) => {
    if (err && (err.message?.includes('aborted') || err.message?.includes('socket hang up') || err.code === 'ECONNRESET')) {
      logger.warn('Request aborted during JSON body parsing', { 
        method: req.method, 
        url: req.url,
        error: err.message 
      });
      
      if (!res.headersSent) {
        return res.status(400).json({
          success: false,
          error: 'Request was aborted',
        });
      }
      return;
    }
    next(err);
  });
});

app.use((req, res, next) => {
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, (err: any) => {
    if (err && (err.message?.includes('aborted') || err.message?.includes('socket hang up') || err.code === 'ECONNRESET')) {
      logger.warn('Request aborted during URL-encoded body parsing', { 
        method: req.method, 
        url: req.url,
        error: err.message 
      });
      
      if (!res.headersSent) {
        return res.status(400).json({
          success: false,
          error: 'Request was aborted',
        });
      }
      return;
    }
    next(err);
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    
    setRequestLogger(async (log: any) => {
      // Don't await - make logging non-blocking
      RequestLogModel.create(log).catch((error) => {
        logger.error('Failed to save request log:', error);
      });
    }, 'auth-service');
    
    app.use(requestLogger);
    
    // Initialize email service, but don't block server startup if it fails
    try {
      initializeEmailService();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.warn('Email service initialization failed - emails will not be sent:', error);
      // Continue server startup even if email service fails
    }
    
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


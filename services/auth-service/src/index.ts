import './config/env';
import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter, setRequestLogger, requestLogger } from '@hrm/common';
import { connectDatabase } from './config/database';
import { initializeEmailService } from './config/email';
import { RequestLogModel } from './models/RequestLog.model';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/device.routes';
import roleRoutes from './routes/role.routes';
import userModuleRoutes from './routes/userModule.routes';

const app = express();
const PORT = process.env.PORT || process.env.AUTH_SERVICE_PORT || 9401;

app.use(cors());

// Body parsing with error handling for aborted requests
app.use((req, res, next) => {
  express.json({ limit: '10mb' })(req, res, (err: any) => {
    if (err) {
      if (err.message?.includes('aborted') || err.message?.includes('socket hang up') || err.code === 'ECONNRESET') {
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
      // For other errors, pass to error handler
      return next(err);
    }
    // No error, continue
    next();
  });
});

app.use((req, res, next) => {
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, (err: any) => {
    if (err) {
      if (err.message?.includes('aborted') || err.message?.includes('socket hang up') || err.code === 'ECONNRESET') {
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
      // For other errors, pass to error handler
      return next(err);
    }
    // No error, continue
    next();
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    
    // Setup menu model associations after database connection
    // Import models first to ensure they're initialized
    await import('./models/Menu.model');
    await import('./models/MenuRole.model');
    const { setupMenuAssociations } = await import('./models/menu-associations');
    setupMenuAssociations();
    
    setRequestLogger(async (log: any) => {
      try {
        await RequestLogModel.create(log);
      } catch (error: any) {
        // If foreign key constraint error on userId, retry with null userId
        const isForeignKeyError = error?.name === 'SequelizeForeignKeyConstraintError' || 
                                error?.code === '23503' ||
                                (error?.original?.code === '23503') ||
                                (error?.message?.includes('foreign key constraint') && 
                                 error?.message?.includes('userId'));
        
        if (isForeignKeyError) {
          try {
            await RequestLogModel.create({ ...log, userId: null });
          } catch (retryError) {
            logger.error('Failed to save request log after retry:', retryError);
          }
        } else {
          logger.error('Failed to save request log:', error);
        }
      }
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
    
    // Initialize system roles, but don't block server startup if it fails
    try {
      const { RoleService } = await import('./services/role.service');
      await RoleService.initializeSystemRoles();
      logger.info('System roles initialized successfully');
    } catch (error: any) {
      // Check if error is due to missing Roles table
      if (error?.original?.code === '42P01' || error?.code === '42P01') {
        logger.warn('Roles table does not exist. Please run database migrations: npm run db:migrate');
      } else {
        logger.warn('System roles initialization failed:', error);
      }
      // Continue server startup even if role initialization fails
    }
    
    app.use('/api/auth', authRoutes);
    app.use('/api/devices', deviceRoutes);
    app.use('/api/roles', roleRoutes);
    app.use('/api/user-modules', userModuleRoutes);

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


import './config/env';
import express from 'express';
import cors from 'cors';
import {
  logger,
  errorHandler,
  ResponseFormatter,
  setRequestLogger,
  requestLogger,
} from '@hrm/common';
import { connectDatabase, syncDatabase } from './config/database';
import { RequestLogModel } from './models/RequestLog.model';
import './models';
import './middleware/auth';

const app = express();
const PORT = process.env.PORT || process.env.PAYMENT_SERVICE_PORT || 9404;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await connectDatabase();
    await syncDatabase(); // Ensure tables are created

    setRequestLogger(async (log: any) => {
      try {
        await RequestLogModel.create(log);
      } catch (error: any) {
        // If foreign key constraint error on userId, retry with null userId
        if (error?.name === 'SequelizeForeignKeyConstraintError' && error?.fields?.includes('userId')) {
          try {
            await RequestLogModel.create({ ...log, userId: null });
          } catch (retryError) {
            logger.error('Failed to save request log after retry:', retryError);
          }
        } else {
          logger.error('Failed to save request log:', error);
        }
      }
    }, 'payment-service');

    app.use(requestLogger);

    // Import routes after auth middleware is initialized
    const paymentRoutes = (await import('./routes/payment.routes')).default;
    const pricingPlanRoutes = (await import('./routes/pricingPlan.routes')).default;
    const subscriptionRoutes = (await import('./routes/subscription.routes')).default;
    const subscriptionHistoryRoutes = (await import('./routes/subscriptionHistory.routes')).default;

    app.use('/api/payments', paymentRoutes);
    app.use('/api/pricing-plans', pricingPlanRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/subscription-history', subscriptionHistoryRoutes);

    app.get('/health', (req, res) => {
      ResponseFormatter.success(
        res,
        { status: 'ok', service: 'payment-service' },
        'Payment Service is healthy'
      );
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
      logger.info(`Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

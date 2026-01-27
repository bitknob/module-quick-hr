import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter } from '@hrm/common';
import { connectDatabase, syncDatabase } from './config/database';
import paymentRoutes from './routes/payment.routes';
import './models';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.PAYMENT_SERVICE_PORT || 9404;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await connectDatabase();
    await syncDatabase(); // Ensure tables are created

    app.use('/api/payments', paymentRoutes);

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

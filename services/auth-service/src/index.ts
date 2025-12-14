import './config/env';
import express from 'express';
import cors from 'cors';
import { logger, errorHandler, ResponseFormatter } from '@hrm/common';
import { connectDatabase } from './config/database';
import { initializeEmailService } from './config/email';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || process.env.AUTH_SERVICE_PORT || 9401;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  ResponseFormatter.success(
    res,
    { status: 'ok', service: 'auth-service' },
    'Auth Service is healthy'
  );
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    initializeEmailService();
    app.listen(PORT, () => {
      logger.info(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


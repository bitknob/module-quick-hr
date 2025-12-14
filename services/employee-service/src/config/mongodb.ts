import mongoose from 'mongoose';
import { logger } from '@hrm/common';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_db';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};


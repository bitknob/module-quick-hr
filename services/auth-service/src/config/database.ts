import { Sequelize } from 'sequelize';
import { logger } from '@hrm/common';

const dbName = process.env.DB_NAME || 'quick_hr';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 10000, // 10 seconds connection timeout
  },
  retry: {
    max: 3,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully (Auth Service)');
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL:', error);
    throw error;
  }
};


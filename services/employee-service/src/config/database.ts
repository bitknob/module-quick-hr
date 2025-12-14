import { Sequelize } from 'sequelize';
import { logger } from '@hrm/common';

const dbName = process.env.DB_NAME || 'hrm_db';
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
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL:', error);
    throw error;
  }
};

export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};


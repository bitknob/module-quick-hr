import dotenv from 'dotenv';
import path from 'path';

const rootEnvPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: rootEnvPath });

export const getServiceName = (): string => {
  return process.env.SERVICE_NAME || process.env.SERVICE_NAME_AUTH || 'auth-service';
};

process.env.SERVICE_NAME = getServiceName();


import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const getEnvPath = (): string => {
  const filePath = path.resolve(__dirname, '../../../../.env');
  const cwdPath = path.resolve(process.cwd(), '.env');
  const cwdParentPath = path.resolve(process.cwd(), '../../.env');
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }
  if (fs.existsSync(cwdParentPath)) {
    return cwdParentPath;
  }
  
  return filePath;
};

const rootEnvPath = getEnvPath();
const result = dotenv.config({ path: rootEnvPath });

if (result.error && !fs.existsSync(rootEnvPath)) {
  console.warn(`Warning: .env file not found at ${rootEnvPath}. Using default values or system environment variables.`);
}

export const getServiceName = (): string => {
  return process.env.SERVICE_NAME || process.env.SERVICE_NAME_PAYROLL || 'payroll-service';
};

process.env.SERVICE_NAME = getServiceName();


import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try multiple paths to find .env file
const getEnvPath = (): string => {
  // Path 1: Relative to this file's location (services/employee-service/src/config -> root)
  const filePath = path.resolve(__dirname, '../../../../.env');
  
  // Path 2: Relative to current working directory
  const cwdPath = path.resolve(process.cwd(), '.env');
  
  // Path 3: If cwd is a service directory, go up to root
  const cwdParentPath = path.resolve(process.cwd(), '../../.env');
  
  // Check which path exists
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }
  if (fs.existsSync(cwdParentPath)) {
    return cwdParentPath;
  }
  
  // Default to filePath (most reliable)
  return filePath;
};

const rootEnvPath = getEnvPath();
const result = dotenv.config({ path: rootEnvPath });

if (result.error && !fs.existsSync(rootEnvPath)) {
  console.warn(`Warning: .env file not found at ${rootEnvPath}. Using default values or system environment variables.`);
}

export const getServiceName = (): string => {
  return process.env.SERVICE_NAME || process.env.SERVICE_NAME_EMPLOYEE || 'employee-service';
};

process.env.SERVICE_NAME = getServiceName();


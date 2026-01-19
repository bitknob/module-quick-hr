import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try multiple paths to find .env file
const getEnvPath = (): string => {
  // Path 1: Relative to this file's location (services/auth-service/src/config -> root)
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
console.log(`[EnvConfig] Attempting to load .env from: ${rootEnvPath}`);
const result = dotenv.config({ path: rootEnvPath });

if (result.error) {
  console.warn(`[EnvConfig] Warning: Failed to load .env file from ${rootEnvPath}`, result.error);
} else {
  console.log(`[EnvConfig] Successfully loaded .env file`);
}

console.log(`[EnvConfig] EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
console.log(`[EnvConfig] BREVO_API_KEY present: ${!!process.env.BREVO_API_KEY}`);
if (process.env.BREVO_API_KEY) {
  console.log(`[EnvConfig] BREVO_API_KEY length: ${process.env.BREVO_API_KEY.length}`);
}

if (result.error && !fs.existsSync(rootEnvPath)) {
  console.warn(
    `Warning: .env file not found at ${rootEnvPath}. Using default values or system environment variables.`
  );
}

export const getServiceName = (): string => {
  return process.env.SERVICE_NAME || process.env.SERVICE_NAME_AUTH || 'auth-service';
};

process.env.SERVICE_NAME = getServiceName();

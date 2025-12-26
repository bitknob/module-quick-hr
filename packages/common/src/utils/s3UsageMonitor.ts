import { logger } from './logger';

// AWS S3 Free Tier Limits (per month)
export const FREE_TIER_LIMITS = {
  STORAGE_GB: 5,
  PUT_REQUESTS: 2000,
  GET_REQUESTS: 20000,
  DATA_TRANSFER_OUT_GB: 15,
};

// Usage tracking (in-memory, reset monthly)
// In production, consider storing this in a database
let monthlyUsage = {
  storageBytes: 0,
  putRequests: 0,
  getRequests: 0,
  dataTransferOutBytes: 0,
  lastResetDate: new Date(),
};

/**
 * Reset monthly usage tracking
 */
const resetMonthlyUsage = (): void => {
  const now = new Date();
  if (now.getMonth() !== monthlyUsage.lastResetDate.getMonth() ||
      now.getFullYear() !== monthlyUsage.lastResetDate.getFullYear()) {
    monthlyUsage = {
      storageBytes: 0,
      putRequests: 0,
      getRequests: 0,
      dataTransferOutBytes: 0,
      lastResetDate: now,
    };
    logger.info('Monthly S3 usage tracking reset');
  }
};

/**
 * Track file upload (PUT request)
 * @param fileSizeBytes - Size of uploaded file in bytes
 */
export const trackUpload = (fileSizeBytes: number): void => {
  resetMonthlyUsage();
  monthlyUsage.putRequests++;
  monthlyUsage.storageBytes += fileSizeBytes;

  const storageGB = monthlyUsage.storageBytes / (1024 * 1024 * 1024);
  const putUsagePercent = (monthlyUsage.putRequests / FREE_TIER_LIMITS.PUT_REQUESTS) * 100;
  const storageUsagePercent = (storageGB / FREE_TIER_LIMITS.STORAGE_GB) * 100;

  if (putUsagePercent > 80 || storageUsagePercent > 80) {
    logger.warn(
      `S3 Free Tier Usage Warning - PUT Requests: ${monthlyUsage.putRequests}/${FREE_TIER_LIMITS.PUT_REQUESTS} (${putUsagePercent.toFixed(1)}%), ` +
      `Storage: ${storageGB.toFixed(2)}GB/${FREE_TIER_LIMITS.STORAGE_GB}GB (${storageUsagePercent.toFixed(1)}%)`
    );
  } else {
    logger.info(
      `S3 Usage - PUT Requests: ${monthlyUsage.putRequests}/${FREE_TIER_LIMITS.PUT_REQUESTS}, ` +
      `Storage: ${storageGB.toFixed(2)}GB/${FREE_TIER_LIMITS.STORAGE_GB}GB`
    );
  }
};

/**
 * Track file deletion
 * @param fileSizeBytes - Size of deleted file in bytes
 */
export const trackDeletion = (fileSizeBytes: number): void => {
  resetMonthlyUsage();
  monthlyUsage.storageBytes = Math.max(0, monthlyUsage.storageBytes - fileSizeBytes);
  logger.info(`S3 file deleted, storage updated: ${(monthlyUsage.storageBytes / (1024 * 1024 * 1024)).toFixed(2)}GB`);
};

/**
 * Track file download/access (GET request)
 * @param fileSizeBytes - Size of downloaded file in bytes
 */
export const trackDownload = (fileSizeBytes: number): void => {
  resetMonthlyUsage();
  monthlyUsage.getRequests++;
  monthlyUsage.dataTransferOutBytes += fileSizeBytes;

  const dataTransferGB = monthlyUsage.dataTransferOutBytes / (1024 * 1024 * 1024);
  const getUsagePercent = (monthlyUsage.getRequests / FREE_TIER_LIMITS.GET_REQUESTS) * 100;
  const transferUsagePercent = (dataTransferGB / FREE_TIER_LIMITS.DATA_TRANSFER_OUT_GB) * 100;

  if (getUsagePercent > 80 || transferUsagePercent > 80) {
    logger.warn(
      `S3 Free Tier Usage Warning - GET Requests: ${monthlyUsage.getRequests}/${FREE_TIER_LIMITS.GET_REQUESTS} (${getUsagePercent.toFixed(1)}%), ` +
      `Data Transfer: ${dataTransferGB.toFixed(2)}GB/${FREE_TIER_LIMITS.DATA_TRANSFER_OUT_GB}GB (${transferUsagePercent.toFixed(1)}%)`
    );
  }
};

/**
 * Get current monthly usage statistics
 */
export const getUsageStats = () => {
  resetMonthlyUsage();
  return {
    storage: {
      used: monthlyUsage.storageBytes / (1024 * 1024 * 1024),
      limit: FREE_TIER_LIMITS.STORAGE_GB,
      unit: 'GB',
      percentUsed: ((monthlyUsage.storageBytes / (1024 * 1024 * 1024)) / FREE_TIER_LIMITS.STORAGE_GB) * 100,
    },
    putRequests: {
      used: monthlyUsage.putRequests,
      limit: FREE_TIER_LIMITS.PUT_REQUESTS,
      percentUsed: (monthlyUsage.putRequests / FREE_TIER_LIMITS.PUT_REQUESTS) * 100,
    },
    getRequests: {
      used: monthlyUsage.getRequests,
      limit: FREE_TIER_LIMITS.GET_REQUESTS,
      percentUsed: (monthlyUsage.getRequests / FREE_TIER_LIMITS.GET_REQUESTS) * 100,
    },
    dataTransfer: {
      used: monthlyUsage.dataTransferOutBytes / (1024 * 1024 * 1024),
      limit: FREE_TIER_LIMITS.DATA_TRANSFER_OUT_GB,
      unit: 'GB',
      percentUsed: ((monthlyUsage.dataTransferOutBytes / (1024 * 1024 * 1024)) / FREE_TIER_LIMITS.DATA_TRANSFER_OUT_GB) * 100,
    },
    lastResetDate: monthlyUsage.lastResetDate,
  };
};


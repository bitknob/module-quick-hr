import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from './logger';
import { trackUpload, trackDeletion } from './s3UsageMonitor';
import { compressFile } from './compression';

// S3 Configuration
// All configuration must be provided via environment variables
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_REGION = process.env.S3_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BASE_URL = process.env.S3_BASE_URL || (S3_BUCKET_NAME && S3_REGION ? `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com` : undefined);

// AWS S3 Free Tier Limits (per month)
// - 5 GB of standard storage
// - 20,000 GET requests
// - 2,000 PUT requests
// - 15 GB of data transfer out
// Available for 12 months from account creation
const FREE_TIER_STORAGE_LIMIT_GB = 5;
const FREE_TIER_PUT_REQUESTS_LIMIT = 2000;
const FREE_TIER_GET_REQUESTS_LIMIT = 20000;
const FREE_TIER_DATA_TRANSFER_LIMIT_GB = 15;

// Maximum file size: 2MB before compression (client-side limit)
// After compression, files will be smaller, allowing more files within free tier
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// Initialize S3 Client function
// Credentials are loaded from environment variables or AWS SDK default credential chain
// If credentials are provided via env vars, use them; otherwise, AWS SDK will use default credential chain
// Note: S3_REGION is validated at runtime in the functions
const getS3Client = (): S3Client => {
  if (!S3_REGION) {
    throw new Error('S3_REGION environment variable is required');
  }
  return new S3Client({
    region: S3_REGION,
    ...(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  });
};

/**
 * Upload file to S3
 * @param fileBuffer - Buffer containing file data
 * @param originalName - Original filename
 * @param folder - Folder path in S3 (e.g., 'documents' or 'images')
 * @param mimeType - File MIME type
 * @param isPublic - Whether to make the file publicly accessible (default: true)
 * @returns Upload result with URL, compressed size, original size, and compression ratio
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: 'documents' | 'images',
  mimeType: string,
  isPublic: boolean = true
): Promise<{ url: string; compressedSize: number; originalSize: number; compressionRatio: number }> => {
  try {
    // Validate required configuration
    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
    if (!S3_REGION) {
      throw new Error('S3_REGION environment variable is required');
    }
    
    const s3Client = getS3Client();

    // Check if credentials are configured via environment variables
    // If not, AWS SDK will attempt to use default credential chain (IAM roles, etc.)
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      logger.warn('AWS credentials not found in environment variables. Attempting to use AWS SDK default credential chain.');
    }

    // Compress file before upload to reduce storage usage
    const originalSize = fileBuffer.length;
    const compressedBuffer = await compressFile(fileBuffer, mimeType, {
      maxImageWidth: 1920,
      maxImageHeight: 1920,
      imageQuality: 85,
    });
    const finalBuffer = compressedBuffer;
    const compressedSize = finalBuffer.length;
    const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

    if (compressionRatio > 0) {
      logger.info(
        `File compressed before upload: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ` +
        `${(compressedSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio.toFixed(1)}% reduction)`
      );
    }

    // Check file size after compression
    const fileSizeMB = finalBuffer.length / (1024 * 1024);
    if (finalBuffer.length > MAX_FILE_SIZE_BYTES) {
      logger.warn(`File size after compression (${fileSizeMB.toFixed(2)}MB) exceeds limit (2MB)`);
      // This shouldn't happen if compression works correctly, but log warning if it does
    }

    // Generate unique filename
    const extension = path.extname(originalName);
    const uniqueFilename = `${uuidv4()}${extension}`;
    const key = `${folder}/${uniqueFilename}`;

    // Upload file to S3
    // Using Standard storage class (default) which is covered by free tier
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: finalBuffer,
      ContentType: mimeType,
      ACL: isPublic ? 'public-read' : 'private',
      StorageClass: 'STANDARD', // Free tier covers STANDARD storage
      Metadata: {
        originalName: originalName,
        uploadedAt: new Date().toISOString(),
        originalSize: originalSize.toString(),
        compressedSize: compressedSize.toString(),
        compressionRatio: compressionRatio.toFixed(1),
      },
    });

    await s3Client.send(command);

    // Track usage for free tier monitoring (use compressed size)
    trackUpload(finalBuffer.length);

    // Get public URL
    if (!S3_BASE_URL) {
      throw new Error('S3_BASE_URL is not configured. Please set S3_BASE_URL or ensure S3_BUCKET_NAME and S3_REGION are set.');
    }
    const publicUrl = `${S3_BASE_URL}/${key}`;

    logger.info(`File uploaded successfully to S3: ${key} (${fileSizeMB.toFixed(2)}MB)`);

    return {
      url: publicUrl,
      compressedSize: finalBuffer.length,
      originalSize: originalSize,
      compressionRatio: compressionRatio,
    };
  } catch (error) {
    logger.error('Failed to upload file to S3:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 * @param fileUrl - Public URL of the file to delete
 */
export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    // Validate required configuration
    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
    if (!S3_REGION) {
      throw new Error('S3_REGION environment variable is required');
    }
    
    const s3Client = getS3Client();

    // Check if credentials are configured via environment variables
    // If not, AWS SDK will attempt to use default credential chain (IAM roles, etc.)
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      logger.warn('AWS credentials not found in environment variables. Attempting to use AWS SDK default credential chain.');
    }

    // Extract key from URL
    let key: string;
    if (S3_BASE_URL && fileUrl.includes(S3_BASE_URL)) {
      key = fileUrl.replace(`${S3_BASE_URL}/`, '');
    } else if (fileUrl.includes('s3://') && S3_BUCKET_NAME) {
      key = fileUrl.replace(`s3://${S3_BUCKET_NAME}/`, '');
    } else {
      logger.warn('File URL does not match S3 bucket structure, skipping deletion');
      return;
    }

    if (!key.startsWith('documents/') && !key.startsWith('images/')) {
      logger.warn('File URL does not match S3 bucket structure, skipping deletion');
      return;
    }

    // Delete file from S3
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    // Note: We track deletion but don't know the file size
    // In production, you might want to store file sizes in the database
    trackDeletion(0); // Size unknown, but we still track the deletion operation

    logger.info(`File deleted successfully from S3: ${key}`);
  } catch (error) {
    logger.error('Failed to delete file from S3:', error);
    throw error;
  }
};

/**
 * Upload document to S3 documents folder
 * @param fileBuffer - Buffer containing file data
 * @param originalName - Original filename
 * @param mimeType - File MIME type
 * @returns Upload result with URL and size information
 */
export const uploadDocumentToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; compressedSize: number; originalSize: number; compressionRatio: number }> => {
  return uploadToS3(fileBuffer, originalName, 'documents', mimeType, true);
};

/**
 * Upload image to S3 images folder
 * @param fileBuffer - Buffer containing file data
 * @param originalName - Original filename
 * @param mimeType - File MIME type
 * @returns Upload result with URL and size information
 */
export const uploadImageToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; compressedSize: number; originalSize: number; compressionRatio: number }> => {
  return uploadToS3(fileBuffer, originalName, 'images', mimeType, true);
};


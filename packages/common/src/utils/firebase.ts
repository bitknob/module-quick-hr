import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from './logger';

// Firebase Storage configuration
const FIREBASE_STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET || 'lambrk-messenger-5161a.appspot.com';

// Resolve service account path - try multiple locations
const getServiceAccountPath = (): string | undefined => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  }
  
  const fs = require('fs');
  
  // Try from workspace root (process.cwd() when running from project root)
  const workspaceRoot = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(workspaceRoot)) {
    return workspaceRoot;
  }
  
  // Try root directory (from common package dist: packages/common/dist/utils -> root)
  // This works when the package is built and running from node_modules
  const rootPathFromDist = path.resolve(__dirname, '../../../../serviceAccountKey.json');
  if (fs.existsSync(rootPathFromDist)) {
    return rootPathFromDist;
  }
  
  // Try from common package source (when running in dev mode)
  // packages/common/src/utils -> root
  const rootPathFromSrc = path.resolve(__dirname, '../../../serviceAccountKey.json');
  if (fs.existsSync(rootPathFromSrc)) {
    return rootPathFromSrc;
  }
  
  // Try going up from node_modules if installed as dependency
  // node_modules/@hrm/common/dist/utils -> root
  const rootPathFromNodeModules = path.resolve(__dirname, '../../../../../serviceAccountKey.json');
  if (fs.existsSync(rootPathFromNodeModules)) {
    return rootPathFromNodeModules;
  }
  
  return undefined;
};

const FIREBASE_SERVICE_ACCOUNT_PATH = getServiceAccountPath();

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0]!;
      return firebaseApp;
    }

    if (FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Check if file exists
      const fs = require('fs');
      if (fs.existsSync(FIREBASE_SERVICE_ACCOUNT_PATH)) {
        // Initialize with service account file
        const serviceAccount = require(FIREBASE_SERVICE_ACCOUNT_PATH);
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: FIREBASE_STORAGE_BUCKET,
        });
      } else {
        // Initialize with default credentials (for Cloud environments)
        firebaseApp = admin.initializeApp({
          storageBucket: FIREBASE_STORAGE_BUCKET,
        });
      }
    } else {
      // Initialize with default credentials (for Cloud environments)
      firebaseApp = admin.initializeApp({
        storageBucket: FIREBASE_STORAGE_BUCKET,
      });
    }

    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

/**
 * Get Firebase Storage bucket
 */
export const getStorageBucket = () => {
  const app = initializeFirebase();
  return app.storage().bucket();
};

/**
 * Upload file to Firebase Storage
 * @param fileBuffer - Buffer containing file data
 * @param originalName - Original filename
 * @param folder - Folder path in storage (e.g., 'users/123')
 * @param mimeType - File MIME type
 * @returns Public URL of the uploaded file
 */
export const uploadToFirebaseStorage = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string,
  mimeType: string
): Promise<string> => {
  try {
    const bucket = getStorageBucket();

    // Generate unique filename
    const extension = path.extname(originalName);
    const uniqueFilename = `${uuidv4()}${extension}`;
    const filePath = `quick_hr/${folder}/${uniqueFilename}`;

    const file = bucket.file(filePath);

    // Upload file
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    logger.info(`File uploaded successfully to Firebase Storage: ${filePath}`);

    return publicUrl;
  } catch (error) {
    logger.error('Failed to upload file to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param fileUrl - Public URL of the file to delete
 */
export const deleteFromFirebaseStorage = async (fileUrl: string): Promise<void> => {
  try {
    const bucket = getStorageBucket();

    // Extract file path from URL
    const bucketName = bucket.name;
    const baseUrl = `https://storage.googleapis.com/${bucketName}/`;

    if (!fileUrl.startsWith(baseUrl)) {
      logger.warn('File URL does not match storage bucket, skipping deletion');
      return;
    }

    const filePath = fileUrl.replace(baseUrl, '');
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      logger.warn(`File not found in storage: ${filePath}`);
      return;
    }

    // Delete file
    await file.delete();

    logger.info(`File deleted successfully from Firebase Storage: ${filePath}`);
  } catch (error) {
    logger.error('Failed to delete file from Firebase Storage:', error);
    throw error;
  }
};

/**
 * Validate image file
 * @param mimeType - File MIME type
 * @param maxSizeBytes - Maximum file size in bytes
 * @param actualSizeBytes - Actual file size in bytes
 */
export const validateImageFile = (
  mimeType: string,
  maxSizeBytes: number,
  actualSizeBytes: number
): { valid: boolean; error?: string } => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
    };
  }

  if (actualSizeBytes > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

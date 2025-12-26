import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware for handling profile image uploads
 * Expects a single file field named 'image'
 */
export const profileImageUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const singleUpload = upload.single('image');
  
  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError('File size exceeds maximum allowed size of 5MB'));
        }
        return next(new ValidationError(`File upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

// File filter for documents (PDF, images, Word documents)
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Invalid file type. Allowed types: PDF, Images (JPEG, PNG, GIF, WebP), Word Documents`));
  }
};

// Configure multer for documents
const documentUpload = multer({
  storage: storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for documents
  },
});

/**
 * Middleware for handling document uploads
 * Expects a single file field named 'document'
 */
export const documentUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const singleUpload = documentUpload.single('document');
  
  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError('File size exceeds maximum allowed size of 2MB'));
        }
        return next(new ValidationError(`File upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};


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


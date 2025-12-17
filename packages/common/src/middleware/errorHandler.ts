import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ResponseFormatter } from '../utils/response';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle request aborted/connection reset errors gracefully
  if ((err as any).message?.includes('aborted') || 
      (err as any).message?.includes('socket hang up') || 
      (err as any).code === 'ECONNRESET') {
    logger.warn({
      message: 'Request aborted or connection reset',
      error: err.message,
      path: req.path,
      method: req.method,
    });

    if (!res.headersSent) {
      return ResponseFormatter.error(
        res,
        'Request was aborted',
        'Request was aborted',
        400
      );
    }
    return;
  }

  if (err instanceof AppError) {
    logger.error({
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    return ResponseFormatter.error(
      res,
      err.message,
      err.message,
      err.statusCode
    );
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return ResponseFormatter.error(
    res,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.message : '',
    500
  );
};


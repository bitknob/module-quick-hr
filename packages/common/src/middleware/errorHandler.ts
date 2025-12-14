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


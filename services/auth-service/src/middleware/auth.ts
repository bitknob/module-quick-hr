import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { UnauthorizedError } from '@hrm/common';
import { AuthRequest } from '@hrm/common';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = verifyAccessToken(token);

    req.user = {
      uid: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
      ...decodedToken,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role || '')) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }

    next();
  };
};

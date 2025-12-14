import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
}

export interface AuthMiddleware {
  authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
  authorize: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
}

let authMiddleware: AuthMiddleware | null = null;

export const setAuthMiddleware = (middleware: AuthMiddleware): void => {
  authMiddleware = middleware;
};

export const getAuthMiddleware = (): AuthMiddleware => {
  if (!authMiddleware) {
    throw new Error('Auth middleware not initialized. Call setAuthMiddleware() first.');
  }
  return authMiddleware;
};

export const createAuthMiddleware = (
  verifyTokenFn: (token: string) => Promise<any>
): AuthMiddleware => {
  const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyTokenFn(idToken);

      req.user = {
        uid: decodedToken.userId || decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
        userId: decodedToken.userId || decodedToken.uid,
        ...decodedToken,
      };

      next();
    } catch (error) {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  };

  const authorize = (...allowedRoles: string[]) => {
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

  return { authenticate, authorize };
};


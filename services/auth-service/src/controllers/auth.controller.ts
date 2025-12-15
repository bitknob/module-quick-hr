import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { DeviceService } from '../services/device.service';
import { UserRole, ValidationError, ResponseFormatter, DeviceType } from '@hrm/common';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from '../config/jwt';
import { User } from '../models/User.model';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
  deviceType: z.nativeEnum(DeviceType).optional(),
  deviceName: z.string().optional(),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  fcmToken: z.string().optional(),
  apnsToken: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const result = await AuthService.signup(validatedData);

    ResponseFormatter.success(
      res,
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          emailVerified: result.user.emailVerified,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Account created successfully. Please check your email for verification.',
      '',
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData.email, validatedData.password);

    let device = null;
    if (validatedData.deviceId && validatedData.deviceType) {
      try {
        const ipAddress = req.ip || req.socket.remoteAddress || undefined;
        const userAgent = req.headers['user-agent'] || undefined;
        device = await DeviceService.registerDevice({
          userId: result.user.id,
          deviceId: validatedData.deviceId,
          deviceType: validatedData.deviceType,
          deviceName: validatedData.deviceName,
          deviceModel: validatedData.deviceModel,
          osVersion: validatedData.osVersion,
          appVersion: validatedData.appVersion,
          fcmToken: validatedData.fcmToken,
          apnsToken: validatedData.apnsToken,
          isPrimary: validatedData.isPrimary,
          ipAddress,
          userAgent,
        });
      } catch (deviceError) {
        console.error('Device registration error:', deviceError);
      }
    }

    ResponseFormatter.success(
      res,
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          emailVerified: result.user.emailVerified,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        device: device ? {
          id: device.id,
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          isPrimary: device.isPrimary,
        } : undefined,
      },
      'Login successful'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return next(new ValidationError('Verification token is required'));
    }

    const user = await AuthService.verifyEmail(token);

    ResponseFormatter.success(
      res,
      {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      'Email verified successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError('Email is required'));
    }

    await AuthService.resendVerificationEmail(email);

    ResponseFormatter.success(res, null, 'Verification email sent successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError('Email is required'));
    }

    await AuthService.forgotPassword(email);

    ResponseFormatter.success(
      res,
      null,
      'If an account exists with this email, a password reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const user = await AuthService.resetPassword(validatedData.token, validatedData.newPassword);

    ResponseFormatter.success(
      res,
      {
        id: user.id,
        email: user.email,
      },
      'Password reset successfully'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const validatedData = changePasswordSchema.parse(req.body);
    await AuthService.changePassword(userId, validatedData.currentPassword, validatedData.newPassword);

    ResponseFormatter.success(res, null, 'Password changed successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ValidationError('Refresh token is required'));
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await AuthService.getUserById(payload.userId);

    if (!user.isActive) {
      return next(new ValidationError('Account is deactivated'));
    }

    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    ResponseFormatter.success(
      res,
      {
        accessToken,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const user = await AuthService.getUserById(userId);

    ResponseFormatter.success(
      res,
      {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin,
      },
      'User retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

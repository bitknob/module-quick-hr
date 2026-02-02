import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { DeviceService } from '../services/device.service';
import { UserRole, ValidationError, ResponseFormatter, DeviceType, logger } from '@hrm/common';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JWTPayload,
} from '../config/jwt';
import { User } from '../models/User.model';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid personal email address'),
  companyEmail: z.string().email('Invalid company email address').optional(),
  companyName: z.string().min(1, 'Company name is required').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.string().optional(), // ISO date string
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
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
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = signupSchema.parse(req.body);

    // Restrict public signup to non-privileged roles only
    // Privileged roles (super_admin, provider_admin, provider_hr_staff) must be created by existing admins
    if (
      validatedData.role &&
      [UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF].includes(
        validatedData.role
      )
    ) {
      return next(new ValidationError('Privileged roles cannot be assigned during public signup'));
    }

    // Default to employee role if not specified
    const signupData = {
      ...validatedData,
      role: validatedData.role || UserRole.EMPLOYEE,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'] || undefined,
      requestBody: req.body,
    };

    const result = await AuthService.signup(signupData);

    ResponseFormatter.success(
      res,
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          emailVerified: result.user.emailVerified,
        },
        employee: result.employee
          ? {
              id: result.employee.id,
              companyId: result.employee.companyId,
              firstName: result.employee.firstName,
              lastName: result.employee.lastName,
              jobTitle: result.employee.jobTitle,
              department: result.employee.department,
            }
          : undefined,
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

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
          mustChangePassword: result.user.mustChangePassword,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        device: device
          ? {
              id: device.id,
              deviceId: device.deviceId,
              deviceType: device.deviceType,
              isPrimary: device.isPrimary,
            }
          : undefined,
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

    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    const user = await AuthService.verifyEmail(token, ipAddress, userAgent);

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

    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    await AuthService.resendVerificationEmail(email, ipAddress, userAgent);

    ResponseFormatter.success(res, null, 'Verification email sent successfully');
  } catch (error) {
    next(error);
  }
};

export const serveVerificationPage = (req: Request, res: Response): void => {
  const path = require('path');
  res.sendFile(path.join(__dirname, '../views/verify-email.html'));
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
    await AuthService.changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

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
    const plainUser = user.get({ plain: true });

    ResponseFormatter.success(
      res,
      {
        id: plainUser.id,
        email: plainUser.email,
        phoneNumber: plainUser.phoneNumber,
        role: plainUser.role,
        emailVerified: plainUser.emailVerified,
        phoneVerified: plainUser.phoneVerified,
        lastLogin: plainUser.lastLogin,
      },
      'User retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Invalid role specified' }) }),
});

/**
 * Assign a role to a user/employee
 * Only super_admin and provider_admin can assign roles
 */
export const assignUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = (req as any).user?.userId;
    const currentUserRole = (req as any).user?.role;

    if (!currentUserId) {
      return next(new ValidationError('User not authenticated'));
    }

    // Only super_admin and provider_admin can assign roles
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(currentUserRole)) {
      return next(new ValidationError('Insufficient permissions to assign roles'));
    }

    const validatedData = assignRoleSchema.parse(req.body);

    // Prevent non-super-admins from assigning super_admin role
    if (validatedData.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      return next(new ValidationError('Only super admins can assign super admin role'));
    }

    const user = await AuthService.assignUserRole(
      validatedData.userId,
      validatedData.role,
      currentUserId
    );
    // Check if user is a Sequelize model instance or already a plain object
    const plainUser = typeof user.get === 'function' ? user.get({ plain: true }) : user;

    ResponseFormatter.success(
      res,
      {
        id: plainUser.id,
        email: plainUser.email,
        phoneNumber: plainUser.phoneNumber,
        role: plainUser.role,
        emailVerified: plainUser.emailVerified,
        phoneVerified: plainUser.phoneVerified,
        updatedAt: plainUser.updatedAt,
      },
      'Role assigned successfully',
      `User role updated to ${validatedData.role}`
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

/**
 * Get user by ID with role information
 * Accessible by admins and the user themselves
 */
export const getUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = (req as any).user?.userId;
    const currentUserRole = (req as any).user?.role;
    const { userId } = req.params;

    if (!currentUserId) {
      return next(new ValidationError('User not authenticated'));
    }

    // Validate that userId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return next(
        new ValidationError(
          'Invalid user ID format. Must be a valid UUID. Use /api/auth/users/email/:email/role to search by email.'
        )
      );
    }

    // Users can view their own role, admins can view any role
    const canViewRole =
      userId === currentUserId ||
      [UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF].includes(
        currentUserRole
      );

    if (!canViewRole) {
      return next(new ValidationError('Insufficient permissions to view this user role'));
    }

    try {
      const user = await AuthService.getUserWithRole(userId);
      const plainUser = user.get({ plain: true });

      ResponseFormatter.success(
        res,
        {
          id: plainUser.id,
          email: plainUser.email,
          phoneNumber: plainUser.phoneNumber,
          role: plainUser.role,
          emailVerified: plainUser.emailVerified,
          phoneVerified: plainUser.phoneVerified,
          isActive: plainUser.isActive,
          createdAt: plainUser.createdAt,
          updatedAt: plainUser.updatedAt,
        },
        'User role retrieved successfully'
      );
    } catch (error: any) {
      // Handle NotFoundError - return HTTP 200 with responseCode 404
      if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
        ResponseFormatter.success(
          res,
          null,
          'User not found',
          `No user found with ID: ${userId}`,
          200, // HTTP status
          404 // responseCode in body
        );
        return;
      }
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by email with role information
 * Accessible by admins only
 */
export const getUserRoleByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserRole = (req as any).user?.role;
    const { email } = req.params;

    // Only admins can search users by email
    if (
      ![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF].includes(
        currentUserRole
      )
    ) {
      return next(new ValidationError('Insufficient permissions to search users by email'));
    }

    try {
      const user = await AuthService.getUserByEmailWithRole(email);
      // Check if user is a Sequelize model instance or already a plain object
      const plainUser = typeof user.get === 'function' ? user.get({ plain: true }) : user;

      ResponseFormatter.success(
        res,
        {
          id: plainUser.id,
          email: plainUser.email,
          phoneNumber: plainUser.phoneNumber,
          role: plainUser.role,
          emailVerified: plainUser.emailVerified,
          phoneVerified: plainUser.phoneVerified,
          isActive: plainUser.isActive,
          createdAt: plainUser.createdAt,
          updatedAt: plainUser.updatedAt,
        },
        'User role retrieved successfully'
      );
    } catch (error: any) {
      // Handle NotFoundError - return HTTP 200 with responseCode 404
      if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
        ResponseFormatter.success(
          res,
          null,
          'User not found',
          `No user found with email: ${email}`,
          200, // HTTP status
          404 // responseCode in body
        );
        return;
      }
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const createUserForEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(UserRole).optional(),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
});

/**
 * Create a user account for an employee with a temporary password
 * Only admins can create user accounts for employees
 */
export const createUserForEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserRole = (req as any).user?.role;

    // Only admins can create user accounts for employees
    if (
      ![
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.COMPANY_ADMIN,
      ].includes(currentUserRole)
    ) {
      return next(new ValidationError('Insufficient permissions to create user accounts'));
    }

    const validatedData = createUserForEmployeeSchema.parse(req.body);

    // Prevent non-super-admins from creating privileged roles
    if (
      validatedData.role &&
      [UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(validatedData.role) &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      return next(
        new ValidationError('Only super admins can create super admin or provider admin accounts')
      );
    }

    const result = await AuthService.createUserForEmployee(validatedData);

    ResponseFormatter.success(
      res,
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          emailVerified: result.user.emailVerified,
          mustChangePassword: result.user.mustChangePassword,
        },
        temporaryPassword: result.temporaryPassword,
      },
      'User account created successfully',
      'Employee must change password on first login',
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

const resendCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Resend user credentials (reset password and email)
 * Only admins can perform this action
 */
export const resendCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserRole = (req as any).user?.role;

    // Only admins can resend credentials
    if (
      ![
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.COMPANY_ADMIN,
      ].includes(currentUserRole)
    ) {
      return next(new ValidationError('Insufficient permissions to resend credentials'));
    }

    const validatedData = resendCredentialsSchema.parse(req.body);

    const result = await AuthService.resendUserCredentials(validatedData.email);

    ResponseFormatter.success(
      res,
      {
        temporaryPassword: result.temporaryPassword,
        mustChangePassword: true,
      },
      'User credentials reset and resent successfully',
      'Employee must change password on login',
      200
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};


/**
 * Public role assignment for onboarding - assigns admin role to first user of a company
 */
export const assignAdminRoleOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, companyId } = req.body;

    if (!userId || !companyId) {
      return next(new ValidationError("User ID and Company ID are required"));
    }

    // For onboarding, assign company admin role (first subscriber gets full admin rights)
    const user = await AuthService.assignUserRole(userId, UserRole.COMPANY_ADMIN, userId);

    // Check if user is a Sequelize model instance or already a plain object
    const plainUser = typeof user.get === "function" ? user.get({ plain: true }) : user;

    ResponseFormatter.success(
      res,
      {
        id: plainUser.id,
        email: plainUser.email,
        role: plainUser.role,
        companyId: companyId,
      },
      "Admin role assigned successfully for onboarding"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

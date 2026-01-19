import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { Verification, VerificationType } from '../models/Verification.model';
import {
  UserRole,
  ConflictError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  logger,
} from '@hrm/common';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../config/jwt';
import { sendEmail } from '../config/email';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;

// Check if email sending is enabled via environment variable
const isEmailSendingEnabled = (): boolean => {
  const sendEmails = process.env.SEND_VERIFICATION_EMAIL;
  // Default to true if not set (backward compatibility)
  if (sendEmails === undefined || sendEmails === '') {
    return true;
  }
  // Accept 'true', '1', 'yes' (case-insensitive) as enabled
  return ['true', '1', 'yes'].includes(sendEmails.toLowerCase());
};

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async signup(data: {
    email: string;
    password: string;
    phoneNumber?: string;
    role?: UserRole;
    ipAddress?: string;
    userAgent?: string;
    requestBody?: any;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    logger.info(`Starting signup for email: ${data.email}`);

    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    if (data.phoneNumber) {
      const existingPhone = await User.findOne({ where: { phoneNumber: data.phoneNumber } });
      if (existingPhone) {
        throw new ConflictError('Phone number already registered');
      }
    }

    logger.info(`Email and phone checks passed for: ${data.email}`);

    logger.info(`Hashing password for: ${data.email}`);
    const hashedPassword = await this.hashPassword(data.password);
    logger.info(`Password hashed for: ${data.email}`);

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(
      verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS
    );

    logger.info(`Creating user in database for: ${data.email}`);
    const user = await User.create({
      id: uuidv4(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      role: data.role || UserRole.EMPLOYEE,
      emailVerified: false,
      phoneVerified: false,
      verificationToken,
      verificationTokenExpiry,
      isActive: true,
      mustChangePassword: false,
    });

    // Remove sensitive data from request body before storing
    const safeRequestBody = { ...data };
    if (safeRequestBody.password) delete (safeRequestBody as any).password;

    // Send verification email asynchronously (non-blocking) if enabled
    if (isEmailSendingEnabled()) {
      // Create verification record
      const verification = await Verification.create({
        userId: user.id,
        type: VerificationType.EMAIL,
        token: verificationToken,
        expiresAt: verificationTokenExpiry,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        requestBody: safeRequestBody,
        status: 'pending',
        attempts: 0,
      });

      this.sendVerificationEmail(user.email, verificationToken)
        .then(async () => {
          await verification.update({ status: 'sent', attempts: 1 });
        })
        .catch(async (error) => {
          logger.error('Failed to send verification email:', error);
          await verification.update({
            status: 'failed',
            errorMessage: error.message,
            attempts: 1,
          });
        });
    } else {
      logger.info('Email sending is disabled - skipping verification email');
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    logger.info(`Generating tokens for user: ${user.id}`);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info(`Signup completed successfully for: ${data.email}`);

    // Convert Sequelize model to plain object
    const userPlain = user.get({ plain: true });

    return { user: userPlain as User, accessToken, refreshToken };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Use raw SQL query to avoid Sequelize issues
    const [users] = (await sequelize.query(
      'SELECT id, email, password, "isActive", role, "emailVerified", "phoneVerified", "phoneNumber", "mustChangePassword" FROM "Users" WHERE LOWER(email) = LOWER(:email) LIMIT 1',
      {
        replacements: { email: email.trim() },
        type: QueryTypes.SELECT,
      }
    )) as any[];

    if (!users) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userData = users as any;

    if (!userData.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (userData.isActive === false) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await this.comparePassword(password, userData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update lastLogin (fire and forget)
    sequelize
      .query('UPDATE "Users" SET "lastLogin" = NOW() WHERE id = :id', {
        replacements: { id: userData.id },
        type: QueryTypes.UPDATE,
      })
      .catch(() => {});

    const payload: JWTPayload = {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      emailVerified: userData.emailVerified,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: userData.id });

    return {
      user: {
        id: userData.id,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        emailVerified: userData.emailVerified,
        phoneVerified: userData.phoneVerified,
        isActive: userData.isActive,
        mustChangePassword: userData.mustChangePassword || false,
        password: '',
      } as User,
      accessToken,
      refreshToken,
    };
  }

  static async verifyEmail(token: string, ipAddress?: string, userAgent?: string): Promise<User> {
    const user = await User.findOne({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      // Fallback: Check Verification table if not found in User
      throw new NotFoundError('Invalid verification token');
    }

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      throw new ValidationError('Verification token has expired');
    }

    user.emailVerified = true;
    user.verificationToken = null as any; // Clear token
    user.verificationTokenExpiry = null as any;
    await user.save();

    // Mark audit record as verified
    await Verification.update(
      {
        verifiedAt: new Date(),
        status: 'verified',
        ipAddress: ipAddress, // Capture who clicked the link
        userAgent: userAgent,
      },
      { where: { token: token, type: VerificationType.EMAIL } }
    );

    return user;
  }

  static async resendVerificationEmail(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(
      verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS
    );

    // Update User model (Legacy support + single source of truth for "current" valid token)
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    const userId = user.getDataValue('id') as string;
    if (!userId) {
      throw new Error('User ID is missing');
    }

    if (isEmailSendingEnabled()) {
      logger.info(`Creating verification record for user: ${userId}`);

      // Create verification audit record
      const verification = await Verification.create({
        userId: userId,
        type: VerificationType.EMAIL,
        token: verificationToken,
        expiresAt: verificationTokenExpiry,
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: 'pending',
        attempts: 0,
      });

      this.sendVerificationEmail(user.email, verificationToken)
        .then(async () => {
          await verification.update({ status: 'sent', attempts: 1 });
        })
        .catch(async (error) => {
          logger.error('Failed to send verification email:', error);
          await verification.update({
            status: 'failed',
            errorMessage: error.message,
            attempts: 1,
          });
        });
    } else {
      logger.info('Email sending is disabled - skipping verification email resend');
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return;
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetTokenExpiry;
    await user.save();

    if (isEmailSendingEnabled()) {
      await this.sendPasswordResetEmail(user.email, resetToken);
    } else {
      logger.info('Email sending is disabled - skipping password reset email');
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      throw new NotFoundError('Invalid reset token');
    }

    if (!user.resetPasswordTokenExpiry || user.resetPasswordTokenExpiry < new Date()) {
      throw new ValidationError('Reset token has expired');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    return user;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Use raw query to get user data
    const [userData] = (await sequelize.query(
      'SELECT id, email, password FROM "Users" WHERE id = :userId LIMIT 1',
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    )) as any[];

    if (!userData) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await this.comparePassword(currentPassword, userData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and clear mustChangePassword flag
    await sequelize.query(
      'UPDATE "Users" SET password = :password, "mustChangePassword" = false, "updatedAt" = NOW() WHERE id = :userId',
      {
        replacements: { password: hashedPassword, userId },
        type: QueryTypes.UPDATE,
      }
    );

    logger.info(`Password changed successfully for user ${userId}`);
  }

  static async getUserById(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private static async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!isEmailSendingEnabled()) {
      logger.info('Email sending is disabled - skipping verification email');
      return;
    }

    const verificationUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:9400/api/auth/verify-email-page'
    }?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Email Verification Required</h2>
            <p>Thank you for registering with HRM System. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3498db;">${verificationUrl}</p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">This link will expire in ${VERIFICATION_TOKEN_EXPIRY_HOURS} hours.</p>
            <p style="color: #7f8c8d; font-size: 12px;">If you did not create an account, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `Please verify your email address by visiting: ${verificationUrl}`,
    });
  }

  private static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    if (!isEmailSendingEnabled()) {
      logger.info('Email sending is disabled - skipping password reset email');
      return;
    }

    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:9420'
    }/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3498db;">${resetUrl}</p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">This link will expire in ${RESET_TOKEN_EXPIRY_HOURS} hour(s).</p>
            <p style="color: #7f8c8d; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  }

  /**
   * Assign a role to a user
   * @param userId - User ID to assign role to
   * @param role - Role to assign
   * @param assignedBy - User ID of the person assigning the role
   * @returns Updated user
   */
  static async assignUserRole(userId: string, role: UserRole, assignedBy: string): Promise<User> {
    // Use raw query to avoid Sequelize serialization issues
    const [userData] = (await sequelize.query(
      'SELECT id, email, password, role, "emailVerified", "phoneVerified", "phoneNumber", "isActive" FROM "Users" WHERE id = :userId LIMIT 1',
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    )) as any[];

    if (!userData) {
      throw new NotFoundError('User not found');
    }

    // Validate that the role is a valid UserRole
    if (!Object.values(UserRole).includes(role)) {
      throw new ValidationError('Invalid role specified');
    }

    const oldRole = userData.role;
    const userEmail = userData.email;

    // Use a transaction to ensure both tables are updated atomically
    const transaction = await sequelize.transaction();

    try {
      // Update the Users table
      await sequelize.query(
        'UPDATE "Users" SET role = :role, "updatedAt" = NOW() WHERE id = :userId',
        {
          replacements: { role, userId },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );

      // Update the Employees table (if an employee record exists for this user)
      // The employee record is linked by email (Users.email = Employees.userEmail)
      await sequelize.query(
        'UPDATE "Employees" SET role = :role, "updatedAt" = NOW() WHERE LOWER("userEmail") = LOWER(:userEmail)',
        {
          replacements: { role, userEmail },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );

      await transaction.commit();

      logger.info(`Role changed for user ${userId} from ${oldRole} to ${role} by ${assignedBy}`);
      logger.info(`Updated role in both Users and Employees tables for email: ${userEmail}`);
    } catch (error) {
      await transaction.rollback();
      logger.error(`Failed to assign role for user ${userId}:`, error);
      throw error;
    }

    // Fetch the updated user data
    const [updatedUser] = (await sequelize.query(
      'SELECT id, email, "phoneNumber", role, "emailVerified", "phoneVerified", "updatedAt" FROM "Users" WHERE id = :userId LIMIT 1',
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    )) as any[];

    return updatedUser as User;
  }

  /**
   * Get user by ID with role information
   * @param userId - User ID
   * @returns User with role information
   */
  static async getUserWithRole(userId: string): Promise<User> {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'email',
        'phoneNumber',
        'role',
        'emailVerified',
        'phoneVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get user by email with role information
   * Searches by User email, Employee userEmail, or Employee userCompEmail
   * @param email - Email to search for (can be user email, employee personal email, or company email)
   * @returns User with role information
   */
  static async getUserByEmailWithRole(email: string): Promise<User> {
    const searchEmail = email.toLowerCase().trim();

    // First, try to find user directly by their email
    let user = await User.findOne({
      where: { email: searchEmail },
      attributes: [
        'id',
        'email',
        'phoneNumber',
        'role',
        'emailVerified',
        'phoneVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    // If not found, search in Employees table by userEmail or userCompEmail
    if (!user) {
      const [employeeResult] = (await sequelize.query(
        `SELECT u.id, u.email, u."phoneNumber", u.role, u."emailVerified", u."phoneVerified", u."isActive", u."createdAt", u."updatedAt"
         FROM "Users" u
         INNER JOIN "Employees" e ON LOWER(u.email) = LOWER(e."userEmail")
         WHERE LOWER(e."userEmail") = LOWER(:email) OR LOWER(e."userCompEmail") = LOWER(:email)
         LIMIT 1`,
        {
          replacements: { email: searchEmail },
          type: QueryTypes.SELECT,
        }
      )) as any[];

      if (employeeResult) {
        // Convert the raw query result to a User-like object
        user = {
          id: employeeResult.id,
          email: employeeResult.email,
          phoneNumber: employeeResult.phoneNumber,
          role: employeeResult.role,
          emailVerified: employeeResult.emailVerified,
          phoneVerified: employeeResult.phoneVerified,
          isActive: employeeResult.isActive,
          createdAt: employeeResult.createdAt,
          updatedAt: employeeResult.updatedAt,
        } as any;
      }
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Generate a secure temporary password
   * Format: Uppercase + Lowercase + Numbers + Special char (12 characters)
   * @returns Temporary password string
   */
  static generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&';

    // Ensure at least one of each type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Create a user account for an employee with a temporary password
   * @param email - Employee email
   * @param role - User role (defaults to employee)
   * @param phoneNumber - Optional phone number
   * @returns Object with user data and temporary password
   */
  static async createUserForEmployee(data: {
    email: string;
    role?: UserRole;
    phoneNumber?: string;
  }): Promise<{ user: User; temporaryPassword: string }> {
    logger.info(`Creating user account for employee: ${data.email}`);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('User account already exists for this email');
    }

    // Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await this.hashPassword(temporaryPassword);

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(
      verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS
    );

    // Create user with mustChangePassword = true
    const user = await User.create({
      id: uuidv4(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      role: data.role || UserRole.EMPLOYEE,
      emailVerified: false,
      phoneVerified: false,
      verificationToken,
      verificationTokenExpiry,
      isActive: true,
      mustChangePassword: true, // Force password change on first login
    });

    logger.info(`User account created for employee: ${data.email} with temporary password`);

    // Convert Sequelize model to plain object
    const userPlain = user.get({ plain: true });

    return {
      user: userPlain as User,
      temporaryPassword,
    };
  }
}

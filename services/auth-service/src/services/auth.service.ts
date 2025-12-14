import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { UserRole, ConflictError, NotFoundError, ValidationError, UnauthorizedError } from '@hrm/common';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../config/jwt';
import { sendEmail } from '../config/email';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;

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
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
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

    const hashedPassword = await this.hashPassword(data.password);
    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

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
    });

    await this.sendVerificationEmail(user.email, verificationToken);

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    return { user, accessToken, refreshToken };
  }

  static async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    return { user, accessToken, refreshToken };
  }

  static async verifyEmail(token: string): Promise<User> {
    const user = await User.findOne({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      throw new NotFoundError('Invalid verification token');
    }

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      throw new ValidationError('Verification token has expired');
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return user;
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    await this.sendVerificationEmail(user.email, verificationToken);
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

    await this.sendPasswordResetEmail(user.email, resetToken);
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
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
  }

  static async getUserById(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

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
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

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
}


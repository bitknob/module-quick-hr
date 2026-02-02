import bcrypt from 'bcrypt';
import crypto from 'crypto';
import axios from 'axios';
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
import { sendServiceEmail as sendAuthEmail } from '../config/email';
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

  static isPersonalEmail(domain: string): boolean {
    const personalEmailDomains = [
      // Major providers
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'mail.com', 'gmx.com',
      'protonmail.com', 'tutanota.com', 'yandex.com',
      'zoho.com', 'fastmail.com',
      
      // Regional providers
      'rediffmail.com', 'sify.com', 'vsnl.net',
      'yahoo.co.in', 'gmail.co.in', 'hotmail.co.in',
      'outlook.co.in', 'live.com', 'msn.com',
      
      // Other common personal providers
      'inbox.com', 'mail.ru', 'rambler.ru',
      'qq.com', '163.com', '126.com',
      'sina.com', 'sohu.com', 'foxmail.com',
      
      // European providers
      'web.de', 'gmx.de', 't-online.de',
      'orange.fr', 'sfr.fr', 'laposte.net',
      'libero.it', 'tin.it', 'virgilio.it',
      'arcor.de', 'freenet.de',
      
      // UK providers
      'sky.com', 'fsmail.net',
      'talktalk.co.uk', 'btinternet.com',
      
      // Others
      'comcast.net', 'verizon.net', 'att.net',
      'cox.net', 'earthlink.net'
    ];
    
    return personalEmailDomains.includes(domain);
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
    companyEmail?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string;
    ipAddress?: string;
    userAgent?: string;
    requestBody?: any;
  }): Promise<{ user: User; employee?: any; accessToken: string; refreshToken: string }> {
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
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber:
        data.phoneNumber && data.phoneNumber.trim() !== '' ? data.phoneNumber : undefined,
      role: data.role || UserRole.EMPLOYEE,
      emailVerified: false,
      phoneVerified: false,
      verificationToken,
      verificationTokenExpiry,
      isActive: true,
      mustChangePassword: false,
    });

    // Reload to ensure all fields are populated
    await user.reload();

    const userId = user.getDataValue('id') as string;
    logger.info(`User created successfully with ID: ${userId}`);

    // Ensure user.id is set
    if (!userId) {
      logger.error('User ID is null after creation!');
      throw new Error('Failed to create user: User ID is null');
    }

    // Remove sensitive data from request body before storing
    const safeRequestBody = { ...data };
    if (safeRequestBody.password) delete (safeRequestBody as any).password;

    // Send verification email asynchronously (non-blocking) if enabled
    if (isEmailSendingEnabled()) {
      logger.info(`Creating verification record for userId: ${userId}`);
      // Create verification record
      const verification = await Verification.create({
        userId: userId,
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
      userId: userId,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    logger.info(`Generating tokens for user: ${userId}`);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: userId });

    logger.info(`Signup completed successfully for: ${data.email}`);

    // Convert Sequelize model to plain object
    const userPlain = user.get({ plain: true });

    // Create employee record if company information is provided
    let employee = null;
    if (data.companyEmail && data.companyName && data.firstName && data.lastName) {
      try {
        logger.info(`Creating employee record for user: ${userId}`);

        const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:9402';

        // Generate a service token for internal API calls
        const serviceToken = generateAccessToken({
          userId: userId,
          email: user.email,
          role: UserRole.SUPER_ADMIN,
          emailVerified: user.emailVerified,
        });

        // First, check if company exists or create it
        let companyId: string;
        try {
          const companyResponse = await axios.get(
            `${employeeServiceUrl}/api/companies/by-name/${encodeURIComponent(data.companyName)}`,
            {
              headers: {
                Authorization: `Bearer ${serviceToken}`,
              },
            }
          );
          companyId = companyResponse.data.response.id;
          logger.info(`Found existing company: ${companyId}`);
        } catch (error: any) {
          if (
            error.response?.status === 404 ||
            error.response?.data?.header?.responseCode === 404
          ) {
            // Company doesn't exist, create it
            logger.info(`Creating new company: ${data.companyName}`);

            // Generate a simple code from company name
            const companyCode = data.companyName
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .substring(0, 10);

            // Calculate 14 days trial end date
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 14);

            const createCompanyResponse = await axios.post(
              `${employeeServiceUrl}/api/companies`,
              {
                name: data.companyName,
                code: companyCode,
                industry: 'Technology', // Default value
                size: '1-10', // Default value
                website: '',
                address: '',
                subscriptionStatus: 'trial',
                subscriptionEndsAt: trialEndsAt,
              },
              {
                headers: {
                  Authorization: `Bearer ${serviceToken}`,
                },
              }
            );
            companyId = createCompanyResponse.data.response.id;
            logger.info(`Created new company with ID: ${companyId}`);
          } else {
            throw error;
          }
        }

        // Create employee record
        const employeeData = {
          userEmail: data.email,
          userCompEmail: data.companyEmail,
          companyId: companyId,
          employeeId: `EMP-${Date.now().toString().slice(-6)}`,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle || 'Employee',
          department: data.department || 'General',
          hireDate: data.hireDate || new Date().toISOString(),
          status: 'active',
          role: data.role || UserRole.EMPLOYEE,
        };

        const employeeResponse = await axios.post(
          `${employeeServiceUrl}/api/employees`,
          employeeData,
          {
            headers: {
              Authorization: `Bearer ${serviceToken}`,
            },
          }
        );

        employee = employeeResponse.data.response.employee;
        logger.info(`Created employee record with ID: ${employee.id}`);
      } catch (error: any) {
        logger.error('Failed to create employee record:', error.response?.data || error.message);
        // Don't fail the signup if employee creation fails
        // The user account is still created successfully
      }
    }

    return { user: userPlain as User, employee, accessToken, refreshToken };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const isPersonalEmail = this.isPersonalEmail(emailDomain);
    
    // First try to find user by the provided email (could be personal or company)
    const [users] = (await sequelize.query(
      'SELECT id, email, password, "isActive", role, "emailVerified", "phoneVerified", "phoneNumber", "mustChangePassword" FROM "Users" WHERE LOWER(email) = LOWER(:email) LIMIT 1',
      {
        replacements: { email: email.trim() },
        type: QueryTypes.SELECT,
      }
    )) as any[];

    // If no user found, check if this is a company email for an existing employee
    if (!users) {
      console.log('No user found, checking if employee exists with company email:', email);

      const [employee] = (await sequelize.query(
        `SELECT e."userEmail", e."firstName", e."lastName", e."companyId", c.name as "companyName"
         FROM "Employees" e
         INNER JOIN "Companies" c ON e."companyId" = c.id
         WHERE LOWER(e."userCompEmail") = LOWER(:email)
         LIMIT 1`,
        {
          replacements: { email },
          type: QueryTypes.SELECT,
        }
      )) as any[];

      if (employee) {
        console.log(
          'Found employee with company email, creating user account for company email login'
        );

        // Create user account for the employee using COMPANY EMAIL as login email
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await this.hashPassword(temporaryPassword);
        const userId = uuidv4();
        const verificationToken = uuidv4();
        const verificationTokenExpiry = new Date();
        verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

        try {
          await sequelize.query(
            `INSERT INTO "Users" ("id", "email", "password", "role", "emailVerified", "isActive", "mustChangePassword", "verificationToken", "verificationTokenExpiry", "createdAt", "updatedAt")
             VALUES (:id, :email, :password, :role, :emailVerified, :isActive, :mustChangePassword, :verificationToken, :verificationTokenExpiry, NOW(), NOW())`,
            {
              replacements: {
                id: userId,
                email: email, // Use company email as login email
                password: hashedPassword,
                role: 'employee',
                emailVerified: true,
                isActive: true,
                mustChangePassword: true,
                verificationToken,
                verificationTokenExpiry,
              },
              type: QueryTypes.INSERT,
            }
          );
        } catch (error) {
          console.error('Error creating user:', error);
          throw new UnauthorizedError('Failed to create user account');
        }

        console.log(
          'User account created for company email login. Temporary password:',
          temporaryPassword
        );

        // Send email with credentials to personal email but login with company email
        try {
          await this.sendEmployeeWelcomeEmail(
            employee.userEmail, // Send to personal email
            temporaryPassword,
            employee.companyName || 'HRM System',
            email // Show company email in the email body
          );
        } catch (emailError) {
          console.error('Failed to send credentials email:', emailError);
        }

        throw new UnauthorizedError(
          `User account created for company email ${email}. Please check your personal email (${employee.userEmail}) for credentials and login with your company email (${email}).`
        );
      }

      throw new UnauthorizedError('Invalid email or password');
    }

    const userData = users as any;
    console.log('User data:', { ...userData, password: userData.password ? '[HASHED]' : 'NULL' });

    if (!userData.password) {
      console.log('User has no password set');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is trying to login with appropriate email type
    if (userData.role === 'employee' && isPersonalEmail) {
      // Regular employees must login with company email
      throw new UnauthorizedError('Employees must login with their company email address. Personal emails are not allowed for employee accounts.');
    }

    // For subscription customers (company_admin, provider_admin, etc.), allow personal email login
    // The subscription creation process already validates the user has an active subscription
    if (userData.role !== 'employee' && isPersonalEmail) {
      // User is a subscription customer (company_admin, etc.) with personal email
      // Allow login since subscription creation already validated everything
      console.log('Allowing personal email login for subscription customer:', email, 'Role:', userData.role);
      // No additional checks needed - subscription creation process handles validation
    }

    if (userData.isActive === false) {
      console.log('User account is deactivated');
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await this.comparePassword(password, userData.password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password comparison failed');
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
      // Fallback: Check Verification table if not found in User (audit trail)
      const verification = await Verification.findOne({
        where: { token, type: VerificationType.EMAIL },
      });

      if (verification) {
        if (verification.status === 'verified' || verification.verifiedAt) {
          // If the token exists and is already verified, we return the user if we can find them
          // Otherwise produced "Email already verified" error which is better than "Invalid token"
          const verifiedUser = await User.findByPk(verification.userId);
          if (verifiedUser) {
            // Check if user is actually verified
            if (verifiedUser.emailVerified) {
              return verifiedUser;
            }
          }
          throw new ValidationError('Email already verified');
        }

        if (verification.expiresAt < new Date()) {
          throw new ValidationError('Verification token has expired');
        }
      }

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

    const validEmail = user.email || email;

    if (user.emailVerified) {
      // If user must change password (e.g. employee created by admin), allow resending "verification"
      // which is actually an activation/password reset link in this context
      if (user.mustChangePassword) {
        logger.info(
          `Resending activation/password reset email for user: ${email} (mustChangePassword=true)`
        );
        await this.forgotPassword(email);
        return;
      }
      throw new ValidationError('Email already verified');
    }

    // Special handling for users who must change password (likely created by admin)
    // even if email is NOT verified yet. We want to send them the activation flow.
    if (user.mustChangePassword) {
      logger.info(
        `Sending activation/password reset email for unverified user: ${email} (mustChangePassword=true)`
      );
      // We'll treat this as a forgot password flow so they can set their password
      // This will also effectively verify their email when they click the link (if we implemented that logic, but standard reset is fine)
      await this.forgotPassword(email);
      return;
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
        requestBody: null,
        status: 'pending',
        attempts: 0,
      });

      this.sendVerificationEmail(validEmail, verificationToken)
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
      await this.sendPasswordResetEmail(user.email || email, resetToken);
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

    if (!email) {
      logger.error('Cannot send verification email: email address is missing');
      return;
    }

    const verificationUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:9400/api/auth/verify-email-page'
    }?token=${token}`;

    await sendAuthEmail({
      to: email.trim(),
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

    if (!email) {
      logger.error('Cannot send password reset email: email address is missing');
      return;
    }

    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:9420'
    }/reset-password?token=${token}`;

    await sendAuthEmail({
      to: email.trim(),
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
    companyName?: string;
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

    // Send welcome email with credentials
    if (isEmailSendingEnabled()) {
      try {
        await this.sendEmployeeWelcomeEmail(
          data.email,
          temporaryPassword,
          data.companyName || 'HRM System',
          data.email // Use personal email as company email for now
        );
      } catch (emailError) {
        logger.error(`Failed to send welcome email to ${data.email}:`, emailError);
        // Do not throw; return credentials so admin can still share them manually
      }
    }

    // Convert Sequelize model to plain object
    const userPlain = user.get({ plain: true });

    return {
      user: userPlain as User,
      temporaryPassword,
    };
  }

  private static async sendEmployeeWelcomeEmail(
    email: string,
    tempPassword: string,
    companyName: string,
    companyEmail: string
  ): Promise<void> {
    if (!isEmailSendingEnabled()) {
      logger.info('Email sending is disabled - skipping employee welcome email');
      return;
    }

    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:9420/login';

    await sendAuthEmail({
      to: (email || '').trim(),
      subject: `Welcome to ${companyName} - Your Account Details`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0;">Welcome to ${companyName}</h2>
            </div>
            <div style="padding: 30px;">
              <p>Hello,</p>
              <p>Your account for <strong>${companyName}</strong> has been successfully created. Here are your login credentials:</p>
              
              <div style="background-color: #f0f7fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${companyEmail}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background-color: #e1e8ed; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
              </div>

              <p>Please log in using the button below. You will be required to change your password upon your first login.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
              </div>
              
              <p style="font-size: 14px; color: #7f8c8d;">If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3498db; font-size: 14px;">${loginUrl}</p>
            </div>
            <div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to ${companyName}. Your account has been created.\n\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease login at: ${loginUrl}`,
    });
  }

  static async resendUserCredentials(email: string): Promise<{ temporaryPassword: string }> {
    logger.info(`Resending credentials for user: ${email}`);

    // Check if user exists
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Fetch company information from employee record
    let companyName = 'HRM System';
    let companyEmail = email; // Default to personal email if company email not found
    try {
      const [employeeData] = (await sequelize.query(
        `SELECT c.name as "companyName", e."userCompEmail"
         FROM "Employees" e
         INNER JOIN "Companies" c ON e."companyId" = c.id
         WHERE LOWER(e."userEmail") = LOWER(:email)
         LIMIT 1`,
        {
          replacements: { email },
          type: QueryTypes.SELECT,
        }
      )) as { companyName: string; userCompEmail: string }[];

      if (employeeData) {
        if (employeeData.companyName) {
          companyName = employeeData.companyName;
        }
        if (employeeData.userCompEmail) {
          companyEmail = employeeData.userCompEmail;
        }
      }
    } catch (error) {
      logger.warn(`Could not fetch company information for ${email}:`, error);
      // Continue with default values
    }

    // Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await this.hashPassword(temporaryPassword);

    // Update user
    user.password = hashedPassword;
    user.mustChangePassword = true; // Force change on login
    await user.save();

    logger.info(`Credentials reset for user: ${email}`);

    // Send email
    if (isEmailSendingEnabled()) {
      try {
        await this.sendEmployeeWelcomeEmail(email, temporaryPassword, companyName, companyEmail);
      } catch (emailError) {
        logger.error(`Failed to send credentials email to ${email}:`, emailError);
      }
    }

    return { temporaryPassword };
  }
}

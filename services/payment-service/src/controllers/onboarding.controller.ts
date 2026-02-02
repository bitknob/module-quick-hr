import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { Subscription } from '../models/Subscription.model';
import { ResponseFormatter, logger } from '@hrm/common';
import { OnboardingService } from '../services/onboarding.service';

const OnboardingSchema = z.object({
  subscriptionId: z.number().int().positive('Subscription ID is required'),
  userData: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().optional(),
  }),
  companyData: z.object({
    name: z.string().min(1, 'Company name is required'),
    code: z.string().min(2, 'Company code is required'),
    description: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Valid company email is required'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  employeeData: z.object({
    department: z.string().optional(),
    designation: z.string().optional(),
    workLocation: z.string().optional(),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']).optional(),
    dateOfJoining: z.string().optional(),
    workEmail: z.string().email().optional(),
    workPhone: z.string().optional(),
  }).optional(),
});

export class OnboardingController {
  /**
   * Complete onboarding - create user, company, employee and assign roles
   */
  static async completeOnboarding(req: Request, res: Response) {
    try {
      const validatedData = OnboardingSchema.parse(req.body);
      
      logger.info('Starting complete onboarding process:', {
        subscriptionId: validatedData.subscriptionId,
        userEmail: validatedData.userData.email,
        companyName: validatedData.companyData.name
      });

      // 1. Verify subscription exists
      const subscription = await Subscription.findByPk(validatedData.subscriptionId);

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      // 2. Complete onboarding using service layer
      const onboardingResult = await OnboardingService.completeOnboarding(
        validatedData.subscriptionId,
        validatedData.companyData,
        validatedData.userData,
        validatedData.employeeData
      );

      // 3. Update subscription with company reference
      try {
        await subscription.update(
          { companyId: onboardingResult.company.id },
          { 
            // Skip timestamps to avoid PostgreSQL trigger conflict
            silent: true,
            logging: false
          }
        );
      } catch (updateError) {
        logger.warn('Failed to update subscription with company ID:', updateError);
        // Don't fail the onboarding if subscription update fails
      }

      logger.info('Onboarding completed successfully:', {
        userId: onboardingResult.user.id,
        companyId: onboardingResult.company.id,
        employeeId: onboardingResult.employee.id,
        subscriptionId: subscription.id
      });

      const responseData = {
        user: {
          id: onboardingResult.user.id,
          firstName: onboardingResult.user.firstName,
          lastName: onboardingResult.user.lastName,
          email: onboardingResult.user.email,
          phone: onboardingResult.user.phone,
          status: onboardingResult.user.status,
        },
        company: {
          id: onboardingResult.company.id,
          name: onboardingResult.company.name,
          code: onboardingResult.company.code,
          email: onboardingResult.company.email,
          status: onboardingResult.company.status,
        },
        employee: {
          id: onboardingResult.employee.id,
          department: onboardingResult.employee.department,
          designation: onboardingResult.employee.designation,
          status: onboardingResult.employee.status,
        },
        subscription: {
          id: subscription.id,
          status: subscription.status,
          trialEndDate: subscription.trialEndDate,
        },
        token: onboardingResult.token,
      };

      return ResponseFormatter.success(res, responseData, 'Onboarding completed successfully', '', 201);

    } catch (error: any) {
      logger.error('Onboarding failed:', error);
      
      if (error instanceof z.ZodError) {
        // Extract the first validation error for cleaner response
        const firstError = error.errors[0];
        const field = firstError.path.join('.');
        let message = firstError.message;
        
        // Provide more user-friendly messages for common validation errors
        if (field === 'userData.email' && message === 'Valid email is required') {
          message = 'Please provide a valid email address';
        } else if (field === 'userData.password' && message.includes('at least 6 characters')) {
          message = 'Password must be at least 6 characters long';
        } else if (field === 'userData.firstName' || field === 'userData.lastName') {
          message = `${field.split('.')[1]} is required`;
        } else if (field === 'companyData.name') {
          message = 'Company name is required';
        } else if (field === 'companyData.code') {
          message = 'Company code is required (minimum 2 characters)';
        } else if (field === 'companyData.email') {
          message = 'Company email address is required';
        }
        
        return ResponseFormatter.error(res, 'Validation error', message, 400);
      }

      // Provide business-friendly error messages
      let errorMessage = error.message;
      let statusCode = 500;
      
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        statusCode = 409;
        if (error.message.includes('Company code')) {
          errorMessage = 'Company code already exists. Please use a different company code.';
        } else if (error.message.includes('Email')) {
          errorMessage = 'Email address is already registered. Please use a different email or try logging in.';
        }
      } else if (error.message.includes('Password must contain')) {
        statusCode = 400;
        errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
      } else if (error.message.includes('Password must be at least')) {
        statusCode = 400;
        errorMessage = 'Password must be at least 6 characters long.';
      }

      return ResponseFormatter.error(res, 'Onboarding failed', errorMessage, statusCode);
    }
  }

  /**
   * Get subscription details with related company, user, and employee information
   */
  static async getSubscriptionDetails(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      // Get subscription details using raw SQL query
      const { sequelize } = require('../config/database');
      const [subscription] = await sequelize.query(
        'SELECT * FROM "Subscriptions" WHERE "id" = :subscriptionId LIMIT 1',
        {
          replacements: { subscriptionId },
          type: sequelize.QueryTypes.SELECT,
        }
      ) as any[];

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      const isOnboarded = !!subscription.company_id;
      let company = null;
      let user = null;
      let employee = null;

      if (isOnboarded) {
        try {
          // Get company details
          const [companyData] = await sequelize.query(
            'SELECT "id", "name", "code", "status", "subscriptionStatus", "createdAt" FROM "Companies" WHERE "id" = :companyId LIMIT 1',
            {
              replacements: { companyId: subscription.company_id },
              type: sequelize.QueryTypes.SELECT,
            }
          ) as any[];

          if (companyData) {
            company = companyData;

            // Get employee data directly from database
            try {
              // First try to find any employee for this company
              const employees = await sequelize.query(
                'SELECT * FROM "Employees" WHERE "companyId" = :companyId',
                {
                  replacements: { companyId: subscription.company_id },
                  type: sequelize.QueryTypes.SELECT,
                }
              ) as any[];

              if (employees && employees.length > 0) {
                employee = employees[0];

                // Get user details using employee's userEmail
                const users = await sequelize.query(
                  'SELECT * FROM "Users" WHERE "email" = :email',
                  {
                    replacements: { email: employee.userEmail },
                    type: sequelize.QueryTypes.SELECT,
                  }
                ) as any[];

                if (users && users.length > 0) {
                  user = users[0];
                }
              }
            } catch (dbError: any) {
              logger.warn('Failed to fetch employee details from database:', dbError.message);
            }
          }
        } catch (error) {
          logger.warn('Failed to fetch subscription details from database:', error);
        }
      }

      // Calculate onboarding level
      const onboardingLevel = this.calculateOnboardingLevel({
        subscription,
        company,
        employee,
        user,
        isOnboarded
      });

      const responseData = {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          trialStartDate: subscription.trial_start_date,
          trialEndDate: subscription.trial_end_date,
          subscriptionStartDate: subscription.subscription_start_date,
          subscriptionEndDate: subscription.subscription_end_date,
          amount: subscription.amount,
          currency: subscription.currency,
          interval: subscription.interval,
          autoRenew: subscription.auto_renew,
          isActive: subscription.is_active,
          createdAt: subscription.created_at,
          updatedAt: subscription.updated_at,
        },
        company: company ? {
          id: company.id,
          name: company.name,
          code: company.code,
          status: company.status,
          subscriptionStatus: company.subscriptionStatus,
          createdAt: company.createdAt,
        } : null,
        employee: employee ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          userEmail: employee.userEmail,
          workEmail: employee.userCompEmail,
          department: employee.department,
          designation: employee.designation,
          status: employee.status,
          createdAt: employee.createdAt,
        } : null,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        } : null,
        onboarding: {
          isOnboarded,
          level: onboardingLevel.level,
          levelName: onboardingLevel.levelName,
          progress: onboardingLevel.progress,
          nextStep: onboardingLevel.nextStep,
          completedSteps: onboardingLevel.completedSteps,
          totalSteps: onboardingLevel.totalSteps,
        },
      };

      return ResponseFormatter.success(res, responseData, 'Subscription details retrieved', '', 200);
    } catch (error: any) {
      logger.error('Failed to get subscription details:', error);
      return ResponseFormatter.error(res, 'Failed to get subscription details', error.message, 500);
    }
  }

  /**
   * Calculate onboarding level based on completed steps
   */
  static calculateOnboardingLevel(data: {
    subscription: any;
    company: any;
    employee: any;
    user: any;
    isOnboarded: boolean;
  }) {
    const { subscription, company, employee, user, isOnboarded } = data;
    
    // Define onboarding steps
    const totalSteps = 4;
    let completedSteps = 0;
    let level = 0;
    let levelName = 'Not Started';
    let progress = 0;
    let nextStep = 'Create subscription';

    // Step 1: Subscription created
    if (subscription) {
      completedSteps++;
      level = 1;
      levelName = 'Subscription Created';
      progress = (completedSteps / totalSteps) * 100;
      nextStep = 'Company setup';
    }

    // Step 2: Company created
    if (company) {
      completedSteps++;
      level = 2;
      levelName = 'Company Setup Complete';
      progress = (completedSteps / totalSteps) * 100;
      nextStep = 'Employee creation';
    }

    // Step 3: Employee created
    if (employee) {
      completedSteps++;
      level = 3;
      levelName = 'Employee Setup Complete';
      progress = (completedSteps / totalSteps) * 100;
      nextStep = 'User account setup';
    }

    // Step 4: User created and verified
    if (user && user.emailVerified) {
      completedSteps++;
      level = 4;
      levelName = 'Fully Onboarded';
      progress = (completedSteps / totalSteps) * 100;
      nextStep = 'Complete';
    } else if (user) {
      level = 3;
      levelName = 'User Account Created';
      progress = (completedSteps / totalSteps) * 100;
      nextStep = 'Email verification';
    }

    // If fully onboarded, update level name
    if (isOnboarded && completedSteps === totalSteps) {
      levelName = 'Onboarding Complete';
      nextStep = 'Start using the platform';
    }

    return {
      level,
      levelName,
      progress: Math.round(progress),
      nextStep,
      completedSteps,
      totalSteps,
      steps: [
        {
          step: 1,
          name: 'Subscription Created',
          completed: !!subscription,
          description: 'Subscription plan selected and trial activated'
        },
        {
          step: 2,
          name: 'Company Setup',
          completed: !!company,
          description: 'Company profile created and configured'
        },
        {
          step: 3,
          name: 'Employee Setup',
          completed: !!employee,
          description: 'Employee profile created with role assignment'
        },
        {
          step: 4,
          name: 'User Verification',
          completed: !!(user && user.emailVerified),
          description: 'User account created and email verified'
        }
      ]
    };
  }

  /**
   * Debug database contents for a subscription
   */
  static async debugDatabase(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const { sequelize } = require('../config/database');

      // Get subscription
      const [subscription] = await sequelize.query(
        'SELECT * FROM "Subscriptions" WHERE "id" = :subscriptionId LIMIT 1',
        {
          replacements: { subscriptionId },
          type: sequelize.QueryTypes.SELECT,
        }
      ) as any[];

      // Get all companies
      const [companies] = await sequelize.query(
        'SELECT "id", "name", "code" FROM "Companies" ORDER BY "createdAt" DESC LIMIT 5',
        {
          type: sequelize.QueryTypes.SELECT,
        }
      ) as any[];

      // Get all employees
      const [employees] = await sequelize.query(
        'SELECT "id", "companyId", "userEmail", "firstName", "lastName" FROM "Employees" ORDER BY "createdAt" DESC LIMIT 5',
        {
          type: sequelize.QueryTypes.SELECT,
        }
      ) as any[];

      // Get all users
      const [users] = await sequelize.query(
        'SELECT "id", "email", "role" FROM "Users" ORDER BY "createdAt" DESC LIMIT 5',
        {
          type: sequelize.QueryTypes.SELECT,
        }
      ) as any[];

      return ResponseFormatter.success(res, {
        subscription,
        companies,
        employees,
        users
      }, 'Debug data retrieved', '', 200);
    } catch (error: any) {
      logger.error('Debug database error:', error);
      return ResponseFormatter.error(res, 'Debug database error', error.message, 500);
    }
  }

  /**
   * Get onboarding status for a subscription (legacy endpoint)
   */
  static async getOnboardingStatus(req: Request, res: Response) {
    // Redirect to the new endpoint for backward compatibility
    return OnboardingController.getSubscriptionDetails(req, res);
  }
}

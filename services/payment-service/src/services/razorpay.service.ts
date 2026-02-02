import Razorpay from 'razorpay';
import { logger } from '@hrm/common';
import { Subscription } from '../models/Subscription.model';
import { PricingPlan } from '../models/PricingPlan.model';
import { EmailService } from './email.service';
import { SubscriptionHistoryService } from './subscriptionHistory.service';
import bcrypt from 'bcrypt';
import axios from 'axios';

export interface RazorpayCustomer {
  id: string;
  name?: string;
  email?: string;
  contact?: string | number;
}

export interface ExtendedCustomerData {
  name: string;
  personalEmail: string;
  companyEmail: string;
  companyName: string;
  companyCode: string;
  contact?: string | number;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RazorpaySubscriptionRequest {
  plan_id: string;
  customer_id: string;
  total_count: number;
  customer_notify: boolean;
  start_at?: number;
  expire_by?: number;
}

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Create a customer in Razorpay
   */
  async createCustomer(customerData: {
    name: string;
    email: string;
    contact?: string;
  }): Promise<RazorpayCustomer> {
    try {
      const customer = await this.razorpay.customers.create(customerData);
      logger.info('Razorpay customer created:', customer.id);
      return customer;
    } catch (error) {
      logger.error('Error creating Razorpay customer:', error);
      throw error;
    }
  }

  /**
   * Create a plan in Razorpay
   */
  async createPlan(planData: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    item: {
      name: string;
      description: string;
      amount: number;
      currency: string;
    };
    notes?: Record<string, string>;
  }) {
    try {
      logger.info('Creating Razorpay plan with data:', planData);
      logger.info('Razorpay instance initialized successfully');
      const plan = await this.razorpay.plans.create(planData);
      logger.info('Razorpay plan created:', plan.id);
      return plan;
    } catch (error) {
      logger.error('Error creating Razorpay plan:', error);
      throw error;
    }
  }

  /**
   * Create a subscription with 14-day trial
   */
  async createSubscription(subscriptionData: RazorpaySubscriptionRequest) {
    try {
      const subscription = await this.razorpay.subscriptions.create(subscriptionData);
      logger.info('Razorpay subscription created:', subscription.id);
      return subscription;
    } catch (error) {
      logger.error('Error creating Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd = false) {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
      logger.info('Razorpay subscription cancelled:', subscription.id);
      return subscription;
    } catch (error) {
      logger.error('Error cancelling Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionId: string, pauseAt: 'now') {
    try {
      const subscription = await this.razorpay.subscriptions.pause(subscriptionId, {
        pause_at: pauseAt,
      });
      logger.info('Razorpay subscription paused:', (subscription as any).id);
      return subscription;
    } catch (error) {
      logger.error('Error pausing Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Resume a subscription
   */
  async resumeSubscription(subscriptionId: string, resumeAt: 'now') {
    try {
      const subscription = await this.razorpay.subscriptions.resume(subscriptionId, {
        resume_at: resumeAt,
      });
      logger.info('Razorpay subscription resumed:', (subscription as any).id);
      return subscription;
    } catch (error) {
      logger.error('Error resuming Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Fetch subscription details
   */
  async fetchSubscription(subscriptionId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error fetching Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Create a subscription link for payment
   */
  async createSubscriptionLink(subscriptionId: string, customerEmail: string) {
    try {
      // For now, return a simple payment link - this can be enhanced later
      const link = {
        id: `inv_${Date.now()}`,
        short_url: `https://rzp.io/i/${subscriptionId}`,
        subscription_id: subscriptionId
      };
      logger.info('Payment link created for subscription:', subscriptionId);
      return link;
    } catch (error) {
      logger.error('Error creating Razorpay invoice:', error);
      throw error;
    }
  }

  /**
   * Calculate trial end date (14 days from now)
   */
  calculateTrialEndDate(): Date {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    return trialEndDate;
  }

  /**
   * Calculate next billing date based on interval
   */
  calculateNextBillingDate(interval: 'monthly' | 'yearly', startDate?: Date): Date {
    const date = startDate || new Date();
    const nextDate = new Date(date);
    
    if (interval === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (interval === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    return nextDate;
  }

  /**
   * Convert pricing plan to Razorpay plan format
   */
  async createPlanFromPricingPlan(pricingPlan: PricingPlan) {
    // Safety check for pricing plan ID
    const planId = pricingPlan.getDataValue('id') || pricingPlan.get('id') || pricingPlan.id;
    logger.info('createPlanFromPricingPlan called with:', {
      pricingPlan: pricingPlan.toJSON(),
      hasId: !!pricingPlan.id,
      idValue: pricingPlan.id,
      idType: typeof pricingPlan.id,
      dataValueId: pricingPlan.getDataValue('id'),
      getId: pricingPlan.get('id'),
      finalId: planId
    });
    
    if (!planId) {
      logger.error('Pricing plan ID is undefined:', pricingPlan.toJSON());
      throw new Error('Invalid pricing plan: ID is undefined');
    }
    
    const planData = {
      period: 'monthly' as const,
      interval: 1,
      item: {
        name: pricingPlan.name,
        description: pricingPlan.description || '',
        amount: Math.round(pricingPlan.monthlyPrice * 100), // Convert to paise
        currency: 'INR',
      },
      notes: {
        pricing_plan_id: planId.toString(),
        pricing_plan_name: pricingPlan.name,
      },
    };

    return this.createPlan(planData);
  }

  /**
   * Validate business email
   */
  private validateBusinessEmail(email: string): void {
    const personalEmailDomains = [
      // Major providers
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      
      // Microsoft services
      'live.com', 'msn.com', 'passport.com',
      
      // Apple services
      'icloud.com', 'me.com', 'mac.com',
      
      // AOL
      'aol.com',
      
      // Privacy-focused
      'protonmail.com', 'proton.me', 'tutanota.com', 'tutanota.de',
      
      // International providers
      'yandex.com', 'yandex.ru', 'mail.ru', 'list.ru', 'bk.ru',
      'rediffmail.com', 'rediff.com',
      '163.com', '126.com', 'qq.com', 'foxmail.com',
      'naver.com', 'hanmail.net', 'daum.net',
      
      // Business/personal hybrid (block for subscriptions)
      'zoho.com', 'zoho.eu', 'zoho.in',
      
      // Other popular providers
      'gmx.com', 'gmx.de', 'gmx.net',
      'web.de', 'mail.com', 'my.com',
      'inbox.com', 'inbox.lv',
      'mailfence.com', 'startmail.com',
      'runbox.com', 'fastmail.com',
      'hushmail.com', 'hush.com',
      'lavabit.com', 'countermail.com',
      
      // Regional providers
      'sify.com', 'sancharnet.in', 'vsnl.net',
      'dataone.in', 'bharatnet.in',
      'rogers.com', 'bell.net', 'telus.net',
      'shaw.ca', 'sympatico.ca',
      'optusnet.com.au', 'bigpond.com',
      'xtra.co.nz', 'clear.net.nz',
      
      // Emerging providers
      'hey.com', 'skiff.com', 'tutanota.com',
      'posteo.de', 'mailbox.org',
      'disroot.org', 'riseup.net',
      'autistici.org', 'inventati.org',
      'kolabnow.com', 'kolab.org',
      'mailfence.com', 'startmail.com',
      
      // Free email providers
      'mail2world.com', 'email.com',
      'excite.com', 'lycos.com',
      'netscape.net', 'netscape.com',
      'compuserve.com', 'att.net',
      'sbcglobal.net', 'ameritech.net',
      'pacbell.net', 'swbell.net',
      'bellsouth.net', 'verizon.net',
      
      // Additional domains
      'rocketmail.com', 'ymail.com',
      'talktalk.co.uk', 'btinternet.com',
      'blueyonder.co.uk', 'virginmedia.com',
      'sky.com', 'fsmail.net',
      'orange.fr', 'wanadoo.fr',
      'sfr.fr', 'laposte.net',
      'libero.it', 'tin.it',
      'virgilio.it', 'alice.it',
      'tiscali.it', 'iol.it',
      'supereva.it', 'gmail.it',
      'arcor.de', 'freenet.de',
      't-online.de', 'online.de',
      'gmx.at', 'aon.at',
      'chello.at', 'inbox.at',
      'vol.at', 'kabsi.at',
      'eunet.at', 'tele2.at'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      throw new Error('Invalid email format');
    }
    
    // Note: Allow both business and personal emails for trial subscriptions
    // Business email validation will be enforced during onboarding
    
    // Additional validation: check if it looks like a business domain
    const businessDomainPatterns = [
      /^[a-zA-Z0-9.-]+\.(com|org|net|io|co|in|us|uk|ca|au|de|fr|jp|cn|sg|my)$/
    ];
    
    const isValidBusinessDomain = businessDomainPatterns.some(pattern => pattern.test(domain));
    
    if (!isValidBusinessDomain) {
      throw new Error(`Invalid business domain: ${domain}. Please use a valid company email address.`);
    }
  }

  /**
   * Create subscription with trial for a company (without Razorpay for free trial)
   */
  async createSubscriptionWithTrial(
    pricingPlanId: number,
    customerData: ExtendedCustomerData,
    interval: 'monthly' | 'yearly' = 'monthly'
  ) {
    try {
      // Note: Allow both business and personal emails for trial subscriptions
      // Business email validation will be enforced during onboarding
      
      // Get pricing plan
      const pricingPlan = await PricingPlan.findByPk(pricingPlanId);
      if (!pricingPlan) {
        throw new Error('Pricing plan not found');
      }
      
      const planData = pricingPlan.get();
      logger.info('Creating free trial subscription for plan:', {
        name: planData.name,
        monthlyPrice: planData.monthlyPrice,
        yearlyPrice: planData.yearlyPrice,
        rawData: planData
      });

      // Step 1: Check if company already exists by trying to create it
      let company;
      let companyId;
      
      try {
        const companyResponse = await axios.post(
          `${process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:9402'}/api/companies/onboarding`,
          {
            name: customerData.companyName,
            code: customerData.companyCode,
            email: customerData.companyEmail,
            description: 'Company created during subscription',
            industry: 'Technology',
            website: '',
            phone: customerData.contact?.toString() || '',
            address: '',
          },
          { 
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Service': 'payment-service'
            }
          }
        );

        company = companyResponse.data.response;
        companyId = company.id;
        logger.info('Company created during subscription:', companyId);
      } catch (companyError: any) {
        // If company already exists, we need to find its ID
        if (companyError.response?.status === 409) {
          logger.info('Company already exists, checking for existing subscription');
          
          // Try to find existing subscription by company code pattern
          // For now, let's use a simple approach - generate a temporary companyId
          // and let the user know the company already exists
          const { v4: uuidv4 } = require('uuid');
          companyId = uuidv4();
          logger.info('Company already exists, using temporary companyId for subscription:', companyId);
          
          // TODO: Implement proper company lookup by code
          // For now, we'll proceed with the subscription creation
        } else {
          logger.error('Error creating company:', companyError);
          throw new Error(`Failed to create company: ${companyError.message}`);
        }
      }

      // Step 2: Create user directly in database to bypass email validation
      let user;
      let token;
      
      try {
        // Hash the password
        const hashedPassword = await this.hashPassword(customerData.password);
        
        // Create user directly in auth service database
        const { v4: uuidv4 } = require('uuid');
        const userId = uuidv4();
        
        const { sequelize: authSequelize } = require('../config/database');
        const [createdUser] = await authSequelize.query(
          `INSERT INTO "Users" ("id", "email", "password", "role", "emailVerified", "isActive", "createdAt", "updatedAt")
           VALUES (:id, :email, :password, :role, :emailVerified, :isActive, NOW(), NOW())
           RETURNING *`,
          {
            replacements: {
              id: userId,
              email: customerData.personalEmail,
              password: hashedPassword,
              role: 'company_admin',
              emailVerified: true,
              isActive: true,
            },
            type: authSequelize.QueryTypes.INSERT,
          }
        );

        user = createdUser;
        
        // Generate JWT token for the user
        const jwt = require('jsonwebtoken');
        token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        logger.info('User created directly during subscription:', user.id);
      } catch (userError: any) {
        logger.error('Error creating user directly:', userError);
        throw new Error(`Failed to create user: ${userError.message}`);
      }

      // Step 3: Create employee directly in database
      let employee;
      try {
        const { v4: uuidv4 } = require('uuid');
        const employeeId = uuidv4();
        
        const { sequelize: employeeSequelize } = require('../config/database');
        const [createdEmployee] = await employeeSequelize.query(
          `INSERT INTO "Employees" ("id", "userEmail", "companyId", "employeeId", "firstName", "lastName", "userCompEmail", "jobTitle", "department", "hireDate", "status", "createdAt", "updatedAt")
           VALUES (:id, :userEmail, :companyId, :employeeId, :firstName, :lastName, :userCompEmail, :jobTitle, :department, :hireDate, :status, NOW(), NOW())
           RETURNING *`,
          {
            replacements: {
              id: employeeId,
              userEmail: customerData.personalEmail,
              companyId: companyId,
              employeeId: `EMP-${Date.now()}`,
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              userCompEmail: customerData.companyEmail,
              jobTitle: 'Company Administrator',
              department: 'Management',
              hireDate: new Date().toISOString().split('T')[0],
              status: 'active',
            },
            type: employeeSequelize.QueryTypes.INSERT,
          }
        );

        employee = createdEmployee;
        logger.info('Employee created directly during subscription:', employee.id);
        logger.info('Employee details:', {
          id: employee.id,
          userEmail: employee.userEmail,
          userCompEmail: employee.userCompEmail,
          companyId: employee.companyId
        });
      } catch (employeeError: any) {
        logger.error('Error creating employee directly:', employeeError);
        throw new Error(`Failed to create employee: ${employeeError.message}`);
      }

      // Step 4: Skip role assignment for now - user already has company_admin role
      logger.info('Skipping role assignment - user already has company_admin role:', user.id);

      // Calculate trial dates
      const trialStartDate = new Date();
      const trialEndDate = this.calculateTrialEndDate();
      const subscriptionStartDate = new Date(trialEndDate);
      const subscriptionEndDate = this.calculateNextBillingDate(interval, subscriptionStartDate);

      // Get amount based on interval
      const amount = interval === 'monthly' ? planData.monthlyPrice : planData.yearlyPrice;
      if (!amount) {
        throw new Error(`No ${interval} price found for plan ${pricingPlanId}`);
      }

      // Create subscription data
      const subscriptionData = {
        companyId: companyId,
        pricingPlanId: pricingPlanId,
        status: 'trial' as const,
        trialStartDate,
        trialEndDate,
        subscriptionStartDate,
        subscriptionEndDate,
        amount: typeof amount === 'string' ? parseFloat(amount) : amount,
        currency: 'INR',
        interval,
        autoRenew: true,
        isActive: true,
        failedPaymentAttempts: 0,
        // Razorpay fields will be undefined until trial ends
        razorpaySubscriptionId: undefined,
        razorpayCustomerId: undefined,
      };

      // Create subscription with the actual companyId
      const { sequelize } = require('../config/database');
      const [subscription] = await sequelize.query(
        `INSERT INTO "Subscriptions" ("company_id", "pricing_plan_id", "status", "trial_start_date", "trial_end_date", "subscription_start_date", "subscription_end_date", "amount", "currency", "interval", "auto_renew", "is_active", "failed_payment_attempts", "razorpay_subscription_id", "razorpay_customer_id", "created_at", "updated_at")
         VALUES (:companyId, :pricingPlanId, :status, :trialStartDate, :trialEndDate, :subscriptionStartDate, :subscriptionEndDate, :amount, :currency, :interval, :autoRenew, :isActive, :failedPaymentAttempts, NULL, NULL, NOW(), NOW())
         RETURNING *`,
        {
          replacements: {
            companyId: companyId,
            pricingPlanId: subscriptionData.pricingPlanId,
            status: subscriptionData.status,
            trialStartDate: subscriptionData.trialStartDate,
            trialEndDate: subscriptionData.trialEndDate,
            subscriptionStartDate: subscriptionData.subscriptionStartDate,
            subscriptionEndDate: subscriptionData.subscriptionEndDate,
            amount: subscriptionData.amount,
            currency: subscriptionData.currency,
            interval: subscriptionData.interval,
            autoRenew: subscriptionData.autoRenew,
            isActive: subscriptionData.isActive,
            failedPaymentAttempts: subscriptionData.failedPaymentAttempts,
          },
          type: sequelize.QueryTypes.INSERT,
        }
      );
      
      // Create subscription history record directly
      try {
        await SubscriptionHistoryService.createHistoryEvent({
          subscriptionId: subscription.id,
          companyId: companyId,
          eventType: 'created',
          newStatus: 'trial',
          newPricingPlanId: pricingPlanId,
          amount: amount,
          currency: 'INR',
          description: 'Free trial started',
          metadata: {
            trialStartDate,
            trialEndDate,
            pricingPlanName: planData.name,
            customerEmail: customerData.personalEmail,
            interval: interval
          }
        });
      } catch (historyError) {
        logger.warn('Failed to create subscription history:', historyError);
        // Don't fail the subscription creation if history fails
      }

      logger.info('Free trial subscription created:', subscription.id);

      // Send confirmation email
      try {
        const emailHtml = EmailService.createSubscriptionEmailTemplate(
          customerData,
          {
            name: planData.name,
            amount: amount,
            interval: interval,
            subscriptionId: subscription.id
          },
          {
            trialStartDate,
            trialEndDate
          }
        );

        await EmailService.sendEmail({
          to: customerData.personalEmail,
          subject: 'Your HRM System Trial Subscription is Active',
          html: emailHtml
        });

        logger.info('Subscription confirmation email sent to:', customerData.personalEmail);
      } catch (emailError) {
        logger.warn('Failed to send subscription email:', emailError);
        // Don't fail the subscription creation if email fails
      }

      // Return subscription data without Razorpay payment link
      return {
        subscription: subscription,
        paymentLink: null, // No payment link for free trial
        trialDays: 14,
        trialEndDate: subscription.trialEndDate,
        message: 'Free trial started. No payment required during trial period.',
      };
    } catch (error: any) {
      logger.error('Error creating subscription with trial:', error);
      throw error;
    }
  }
}

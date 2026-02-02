import nodemailer from 'nodemailer';
import { logger } from '@hrm/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static async initialize(): Promise<void> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
      });
    }
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.initialize();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hrm-system.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', info.messageId);
    } catch (error: any) {
      logger.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  static createSubscriptionEmailTemplate(customerData: any, planDetails: any, trialDetails: any): string {
    const trialStartDate = new Date(trialDetails.trialStartDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const trialEndDate = new Date(trialDetails.trialEndDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const gracePeriodEnd = new Date(new Date(trialDetails.trialEndDate).getTime() + (3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HRM System - Trial Subscription Confirmed!</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .plan-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .plan-name {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 10px 0;
          }
          .plan-price {
            font-size: 32px;
            font-weight: 700;
            color: #27ae60;
            margin: 0 0 5px 0;
          }
          .plan-interval {
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .trial-info {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            text-align: center;
            color: white;
          }
          .trial-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 15px 0;
          }
          .trial-dates {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-bottom: 15px;
          }
          .date-item {
            text-align: center;
          }
          .date-label {
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 5px;
          }
          .date-value {
            font-size: 16px;
            font-weight: 600;
          }
          .grace-period {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .grace-period p {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #856404;
          }
          .grace-period strong {
            color: #f57c00;
          }
          .next-steps {
            background: #e8f5e8;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
          }
          .next-steps h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #2c3e50;
          }
          .next-steps p {
            margin: 0 0 10px 0;
            color: #5a6c7d;
          }
          .next-steps .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 5px;
            transition: all 0.3s ease;
          }
          .next-steps .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 0;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HRM System</h1>
            <p>Your trial subscription has been successfully activated</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${customerData.name}</strong>,</p>
            <p>Congratulations on choosing our HRM system! Your trial subscription is now active and ready to use.</p>
            
            <div class="plan-details">
              <div class="plan-name">${planDetails.name}</div>
              <div class="plan-price">₹${planDetails.amount}</div>
              <div class="plan-interval">${planDetails.interval}</div>
            </div>
            
            <div class="trial-info">
              <div class="trial-title">Free Trial Period</div>
              <div class="trial-dates">
                <div class="date-item">
                  <div class="date-label">Start Date</div>
                  <div class="date-value">${trialStartDate}</div>
                </div>
                <div class="date-item">
                  <div class="date-label">End Date</div>
                  <div class="date-value">${trialEndDate}</div>
                </div>
              </div>
            </div>
            
            <div class="grace-period">
              <p><strong>Grace Period:</strong> You have <strong>3 days</strong> after the trial ends to decide whether to continue with the paid plan.</p>
              <p><strong>Grace Period Ends:</strong> ${gracePeriodEnd}</p>
            </div>
            
            <div class="next-steps">
              <h3>Next Steps</h3>
              <p>Complete your onboarding to set up your company profile and start using the HRM system:</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:9420'}/onboarding?subscriptionId=${planDetails.subscriptionId}" class="btn">Complete Onboarding</a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:9420'}/login" class="btn">Login to Dashboard</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@hrm-system.com">support@hrm-system.com</a></p>
            <p>© 2024 HRM System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static createWelcomeEmailTemplate(userData: any, companyData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HRM System - Onboarding Complete!</title>
        <style>
          body {
            font-family: 'Segoe UI', Takahashi, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-message {
            background: #d4edda;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #28a745;
          }
          .welcome-message h3 {
            margin: 0 0 10px 0;
            color: #155724;
            font-size: 20px;
          }
          .company-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 5px 0;
          }
          .user-info {
            background: #e8f5e8;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .next-steps {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
          }
          .next-steps h3 {
            margin: 0 0 15px 0;
            font-size: 20px;
          }
          .next-steps p {
            margin: 0 0 20px 0;
            opacity: 0.9;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 0 0 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HRM System</h1>
            <p>Your company setup is complete and ready to use!</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${userData.firstName} ${userData.lastName}</strong>,</p>
            <p>Congratulations! Your company <strong>${companyData.name}</strong> has been successfully set up in the HRM system.</p>
            
            <div class="welcome-message">
              <h3>Onboarding Complete!</h3>
              <p>Your account has been created with company administrator privileges. You can now:</p>
              <ul>
                <li>Add and manage employees</li>
                <li>Configure departments and roles</li>
                <li>Set up payroll and attendance</li>
                <li>Access all HRM features</li>
              </ul>
            </div>
            
            <div class="company-info">
              <div class="company-name">${companyData.name}</div>
              <div class="company-code">Code: ${companyData.code}</div>
              <div class="company-email">${companyData.email}</div>
            </div>
            
            <div class="user-info">
              <div>Your Role: Company Administrator</div>
              <div>Email: ${userData.email}</div>
            </div>
            
            <div class="next-steps">
              <h3>Start Using HRM System</h3>
              <p>Access your dashboard to manage your company and employees:</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:9420'}/dashboard" class="btn">Go to Dashboard</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@hrm-system.com">support@hrm.com</a></p>
            <p>© 2024 HRM System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

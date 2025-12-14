import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { logger } from '@hrm/common';

export enum EmailProvider {
  SENDGRID = 'sendgrid',
  SMTP = 'smtp',
  CUSTOM = 'custom',
}

interface EmailConfig {
  provider: EmailProvider;
  sendgridApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail?: string;
  fromName?: string;
  customDomain?: string;
}

let emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.SMTP,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  fromEmail: process.env.FROM_EMAIL || 'noreply@hrm.com',
  fromName: process.env.FROM_NAME || 'HRM System',
  customDomain: process.env.CUSTOM_EMAIL_DOMAIN,
};

let smtpTransporter: nodemailer.Transporter | null = null;

export const initializeEmailService = (): void => {
  try {
    if (emailConfig.provider === EmailProvider.SENDGRID) {
      if (!emailConfig.sendgridApiKey) {
        throw new Error('SENDGRID_API_KEY is required when using SendGrid');
      }
      sgMail.setApiKey(emailConfig.sendgridApiKey);
      logger.info('SendGrid email service initialized');
    } else if (emailConfig.provider === EmailProvider.SMTP) {
      if (!emailConfig.smtpUser || !emailConfig.smtpPassword) {
        throw new Error('SMTP_USER and SMTP_PASSWORD are required when using SMTP');
      }

      smtpTransporter = nodemailer.createTransport({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: emailConfig.smtpSecure,
        auth: {
          user: emailConfig.smtpUser,
          pass: emailConfig.smtpPassword,
        },
      });

      logger.info('SMTP email service initialized');
    } else {
      logger.warn('Custom email provider configured - ensure custom implementation is provided');
    }
  } catch (error) {
    logger.error('Error initializing email service:', error);
    throw error;
  }
};

export const updateEmailConfig = (config: Partial<EmailConfig>): void => {
  emailConfig = { ...emailConfig, ...config };
  if (config.provider) {
    initializeEmailService();
  }
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const fromEmail = options.from || emailConfig.fromEmail || 'noreply@hrm.com';
    const fromName = emailConfig.fromName || 'HRM System';
    const from = emailConfig.customDomain
      ? `${fromName} <${fromName.toLowerCase().replace(/\s+/g, '.')}@${emailConfig.customDomain}>`
      : `${fromName} <${fromEmail}>`;

    if (emailConfig.provider === EmailProvider.SENDGRID) {
      const msg = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      };

      await sgMail.send(msg);
      logger.info(`Email sent via SendGrid to ${options.to}`);
    } else if (emailConfig.provider === EmailProvider.SMTP && smtpTransporter) {
      await smtpTransporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        html: options.html,
        replyTo: options.replyTo,
      });
      logger.info(`Email sent via SMTP to ${options.to}`);
    } else {
      throw new Error('Email service not properly configured');
    }
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    if (emailConfig.provider === EmailProvider.SMTP && smtpTransporter) {
      await smtpTransporter.verify();
      return true;
    } else if (emailConfig.provider === EmailProvider.SENDGRID) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Email connection verification failed:', error);
    return false;
  }
};


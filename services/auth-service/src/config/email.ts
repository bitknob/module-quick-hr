import { logger, sendEmail as sendCommonEmail } from '@hrm/common';

export enum EmailProvider {
  SENDGRID = 'sendgrid',
  SMTP = 'smtp',
  CUSTOM = 'custom',
  BREVO = 'brevo',
}

interface EmailConfig {
  provider: EmailProvider;
  fromEmail?: string;
  fromName?: string;
  customDomain?: string;
}

// Minimal config needed for backward compatibility
let emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.BREVO,
  fromEmail: process.env.FROM_EMAIL || 'noreply@hrm.com',
  fromName: process.env.FROM_NAME || 'HRM System',
  customDomain: process.env.CUSTOM_EMAIL_DOMAIN,
};

// No-op for now as we delegate to @hrm/common which reads env vars directly
export const initializeEmailService = (): void => {
  logger.info('Email service initialized via @hrm/common');
};

export const updateEmailConfig = (config: Partial<EmailConfig>): void => {
  emailConfig = { ...emailConfig, ...config };
  logger.info('Email config updated');
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string; // Legacy string format
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const fromEmail = options.from || emailConfig.fromEmail || 'noreply@hrm.com';
    const fromName = emailConfig.fromName || 'HRM System';

    // Convert 'to' to the format expected by common lib
    let recipients: { email: string }[] = [];
    if (Array.isArray(options.to)) {
      recipients = options.to.map((email) => ({ email }));
    } else if (typeof options.to === 'string') {
      recipients = [{ email: options.to }];
    } else {
      console.warn('[AuthService] options.to is neither string nor array:', options.to);
    }

    // Filter out any potential empty email objects
    recipients = recipients.filter((r) => r && r.email && r.email.trim() !== '');

    console.log('[AuthService] Resolved recipients:', JSON.stringify(recipients));

    // The common library expects recipients as object array
    // Filters empty ones to be safe
    const validRecipients = recipients.filter(
      (r) => r && r.email && typeof r.email === 'string' && r.email.trim() !== ''
    );

    if (validRecipients.length === 0) {
      throw new Error('No valid recipients provided');
    }

    const commonOptions = {
      to: validRecipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from: { name: fromName, email: fromEmail },
    };

    console.log(
      '[AuthService] Calling common sendEmail with options:',
      JSON.stringify(commonOptions, null, 2)
    );
    console.log('[AuthService] Env check - EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
    console.log('[AuthService] Env check - BREVO_API_KEY present:', !!process.env.BREVO_API_KEY);

    const success = await sendCommonEmail(commonOptions);

    if (!success) {
      throw new Error('Failed to send email via common service');
    }

    logger.info(
      `Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`
    );
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

export const verifyEmailConnection = async (): Promise<boolean> => {
  // Simple check if API key exists
  return !!process.env.BREVO_API_KEY;
};

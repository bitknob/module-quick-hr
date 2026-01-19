import { logger } from './logger';

export interface EmailOptions {
  to: string | { name?: string; email: string }[];
  subject: string;
  html: string;
  text?: string;
  from?: { name: string; email: string };
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';

  if (provider === 'brevo') {
    return sendEmailViaBrevo(options);
  }

  // Fallback or other providers can be added here
  logger.warn(
    `Email provider '${provider}' not implemented yet. Using Brevo if API key is present, otherwise failing.`
  );
  if (process.env.BREVO_API_KEY) {
    return sendEmailViaBrevo(options);
  }

  logger.error('No valid email provider configured');
  return false;
};

const sendEmailViaBrevo = async (options: EmailOptions): Promise<boolean> => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    logger.error('BREVO_API_KEY is missing in environment variables');
    return false;
  }

  const defaultFrom = {
    name: process.env.FROM_NAME || 'QuickHR',
    email: process.env.FROM_EMAIL || 'no-reply@quickhr.com',
  };

  const sender = options.from || defaultFrom;

  // Normalize 'to' field to array of objects
  let recipients: { name?: string; email: string }[] = [];
  if (typeof options.to === 'string') {
    recipients = [{ email: options.to }];
  } else {
    recipients = options.to;
  }

  const payload = {
    sender,
    to: recipients,
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.text,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('Brevo API Error:', JSON.stringify(errorData));
      return false;
    }

    const data = (await response.json()) as { messageId: string };
    logger.info(`Email sent successfully via Brevo. Message ID: ${data.messageId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email via Brevo:', error);
    return false;
  }
};

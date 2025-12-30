import * as admin from 'firebase-admin';
import { logger } from './logger';

const getFirebaseApp = (): admin.app.App => {
  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebase() first.');
  }
  return admin.apps[0]!;
};

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendPushNotification = async (
  fcmToken: string,
  payload: PushNotificationPayload
): Promise<PushNotificationResult> => {
  try {
    const app = getFirebaseApp();
    const messaging = app.messaging();

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data
        ? Object.entries(payload.data).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        : undefined,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    };

    const messageId = await messaging.send(message);
    logger.info(`Push notification sent successfully. Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  } catch (error: any) {
    logger.error('Error sending push notification:', error);

    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      logger.warn(`Invalid FCM token: ${fcmToken}`);
    }

    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
};

export const sendPushNotificationToMultiple = async (
  fcmTokens: string[],
  payload: PushNotificationPayload
): Promise<{
  successCount: number;
  failureCount: number;
  results: PushNotificationResult[];
}> => {
  if (fcmTokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      results: [],
    };
  }

  const results = await Promise.all(
    fcmTokens.map((token) => sendPushNotification(token, payload))
  );

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return {
    successCount,
    failureCount,
    results,
  };
};

export const sendPushNotificationToTopic = async (
  topic: string,
  payload: PushNotificationPayload
): Promise<PushNotificationResult> => {
  try {
    const app = getFirebaseApp();
    const messaging = app.messaging();

    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data
        ? Object.entries(payload.data).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        : undefined,
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      android: {
        priority: 'high',
      },
    };

    const messageId = await messaging.send(message);
    logger.info(`Push notification sent to topic ${topic}. Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  } catch (error: any) {
    logger.error(`Error sending push notification to topic ${topic}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
};


import { Notification, NotificationType, NotificationStatus, NotificationChannel } from '../models/Notification.model';
import { NotificationQueries } from '../queries/notification.queries';
import { EmployeeQueries } from '../queries/employee.queries';
import { NotFoundError, logger } from '@hrm/common';

interface CreateNotificationInput {
  companyId: string;
  userId: string;
  employeeId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

interface SendNotificationOptions {
  sendEmail?: boolean;
  sendPush?: boolean;
  emailSubject?: string;
  emailHtml?: string;
}

export class NotificationService {
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const channels = input.channels || [NotificationChannel.IN_APP];
    
    const notification = await NotificationQueries.create({
      companyId: input.companyId,
      userId: input.userId,
      employeeId: input.employeeId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      channels,
      scheduledFor: input.scheduledFor,
      metadata: input.metadata,
    });

    logger.info(`Notification created: ${notification.id} for user ${input.userId}`);

    return notification;
  }

  static async sendNotification(
    notificationId: string,
    options?: SendNotificationOptions
  ): Promise<Notification> {
    const notification = await NotificationQueries.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    const sendEmail = options?.sendEmail ?? notification.channels.includes(NotificationChannel.EMAIL);
    const sendPush = options?.sendPush ?? notification.channels.includes(NotificationChannel.PUSH);

    try {
      if (sendEmail) {
        await this.sendEmailNotification(notification, options);
      }

      if (sendPush) {
        await this.sendPushNotification(notification);
      }

      await NotificationQueries.markAsSent(notificationId);
      logger.info(`Notification sent: ${notificationId}`);
    } catch (error: any) {
      logger.error(`Error sending notification ${notificationId}:`, error);
      await NotificationQueries.markAsFailed(notificationId, error.message);
      throw error;
    }

    return await NotificationQueries.findById(notificationId) as Notification;
  }

  static async sendNotificationImmediately(
    input: CreateNotificationInput,
    options?: SendNotificationOptions
  ): Promise<Notification> {
    const notification = await this.createNotification(input);
    
    if (!input.scheduledFor || input.scheduledFor <= new Date()) {
      await this.sendNotification(notification.id, options);
    }

    return await NotificationQueries.findById(notification.id) as Notification;
  }

  private static async sendEmailNotification(
    notification: Notification,
    options?: SendNotificationOptions
  ): Promise<void> {
    logger.info(`Email notification requested for ${notification.id} - email integration to be implemented`);
  }

  private static async sendPushNotification(notification: Notification): Promise<void> {
    logger.info(`Push notification requested for ${notification.id} - push integration to be implemented`);
  }

  static async getNotificationsByUserId(
    userId: string,
    options?: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    return await NotificationQueries.findByUserId(userId, options);
  }

  static async getNotificationsByEmployeeId(
    employeeId: string,
    options?: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    return await NotificationQueries.findByEmployeeId(employeeId, options);
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await NotificationQueries.markAsRead(notificationId);
  }

  static async markAllAsRead(userId: string): Promise<number> {
    return await NotificationQueries.markAsReadByUserId(userId);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return await NotificationQueries.countUnreadByUserId(userId);
  }

  static async getNotificationById(notificationId: string): Promise<Notification> {
    const notification = await NotificationQueries.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return notification;
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const notification = await NotificationQueries.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    await notification.destroy();
  }
}


import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, NotFoundError } from '@hrm/common';
import { NotificationService } from '../services/notification.service';
import { NotificationType, NotificationChannel } from '../models/Notification.model';
import { z } from 'zod';
import { EmployeeQueries } from '../queries/employee.queries';

const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  employeeId: z.string().uuid('Invalid employee ID').optional(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.record(z.any()).optional(),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  scheduledFor: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export const createNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return next(new ValidationError('Company ID is required'));
    }

    const validatedData = createNotificationSchema.parse(req.body);

    const notification = await NotificationService.createNotification({
      companyId: companyId as string,
      userId: validatedData.userId,
      employeeId: validatedData.employeeId,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      data: validatedData.data,
      channels: validatedData.channels,
      scheduledFor: validatedData.scheduledFor,
    });

    const notificationData = notification.toJSON ? notification.toJSON() : notification;
    ResponseFormatter.success(res, notificationData, 'Notification created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const sendNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.sendNotification(id);
    const notificationData = notification.toJSON ? notification.toJSON() : notification;

    ResponseFormatter.success(res, notificationData, 'Notification sent successfully');
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid || req.user?.userId;
    if (!userId) {
      return next(new ValidationError('User ID is required'));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as NotificationType | undefined;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await NotificationService.getNotificationsByUserId(userId, {
      status: status as any,
      type,
      limit,
      offset,
      unreadOnly,
    });

    const notificationsData = notifications.map((n) => (n.toJSON ? n.toJSON() : n));

    ResponseFormatter.success(res, notificationsData, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCurrentEmployeeNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return next(new ValidationError('User email is required'));
    }

    const employee = await EmployeeQueries.findByUserEmail(userEmail);
    if (!employee) {
      ResponseFormatter.success(res, [], 'No employee record found');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as NotificationType | undefined;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await NotificationService.getNotificationsByEmployeeId(employee.id, {
      status: status as any,
      type,
      limit,
      offset,
      unreadOnly,
    });

    const notificationsData = notifications.map((n) => (n.toJSON ? n.toJSON() : n));

    ResponseFormatter.success(res, notificationsData, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.getNotificationById(id);
    const notificationData = notification.toJSON ? notification.toJSON() : notification;

    ResponseFormatter.success(res, notificationData, 'Notification retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await NotificationService.markAsRead(id);

    ResponseFormatter.success(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid || req.user?.userId;
    if (!userId) {
      return next(new ValidationError('User ID is required'));
    }

    const count = await NotificationService.markAllAsRead(userId);

    ResponseFormatter.success(res, { count }, `${count} notifications marked as read`);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid || req.user?.userId;
    if (!userId) {
      return next(new ValidationError('User ID is required'));
    }

    const count = await NotificationService.getUnreadCount(userId);

    ResponseFormatter.success(res, { count }, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await NotificationService.deleteNotification(id);

    ResponseFormatter.success(res, null, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

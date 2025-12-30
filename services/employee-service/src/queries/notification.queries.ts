import { Notification, NotificationStatus, NotificationType, NotificationChannel } from '../models/Notification.model';
import { Employee } from '../models/Employee.model';
import { Company } from '../models/Company.model';
import { Op } from 'sequelize';

export class NotificationQueries {
  static async create(data: {
    companyId: string;
    userId: string;
    employeeId?: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    channels: NotificationChannel[];
    scheduledFor?: Date;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    return await Notification.create(data);
  }

  static async findById(id: string): Promise<Notification | null> {
    return await Notification.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });
  }

  static async findByUserId(
    userId: string,
    options?: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    const where: any = { userId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.type) {
      where.type = options.type;
    }
    
    if (options?.unreadOnly) {
      where.readAt = { [Op.is]: null };
    }

    return await Notification.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  static async findByEmployeeId(
    employeeId: string,
    options?: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    const where: any = { employeeId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.type) {
      where.type = options.type;
    }
    
    if (options?.unreadOnly) {
      where.readAt = { [Op.is]: null };
    }

    return await Notification.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  static async findByCompanyId(
    companyId: string,
    options?: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    const where: any = { companyId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.type) {
      where.type = options.type;
    }

    return await Notification.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  static async markAsRead(id: string): Promise<void> {
    await Notification.update(
      { readAt: new Date(), status: NotificationStatus.READ },
      { where: { id } }
    );
  }

  static async markAsReadByUserId(userId: string): Promise<number> {
    const [count] = await Notification.update(
      { readAt: new Date(), status: NotificationStatus.READ },
      {
        where: {
          userId,
          readAt: { [Op.is]: null },
        } as any,
      }
    );
    return count;
  }

  static async markAsSent(id: string): Promise<void> {
    await Notification.update(
      { sentAt: new Date(), status: NotificationStatus.SENT },
      { where: { id } }
    );
  }

  static async markAsFailed(id: string, error: string): Promise<void> {
    await Notification.update(
      {
        status: NotificationStatus.FAILED,
        metadata: { error },
      },
      { where: { id } }
    );
  }

  static async countUnreadByUserId(userId: string): Promise<number> {
    const count = await Notification.count({
      where: {
        userId,
        readAt: { [Op.is]: null },
      } as any,
    });
    return count as number;
  }

  static async deleteOld(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const deletedCount = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
        status: {
          [Op.in]: [NotificationStatus.READ, NotificationStatus.SENT],
        },
      },
    });

    return deletedCount;
  }

  static async findPendingNotifications(limit: number = 100): Promise<Notification[]> {
    return await Notification.findAll({
      where: {
        status: NotificationStatus.PENDING,
        [Op.or]: [
          { scheduledFor: { [Op.is]: null } },
          { scheduledFor: { [Op.lte]: new Date() } },
        ],
      } as any,
      order: [['createdAt', 'ASC']],
      limit,
    });
  }
}


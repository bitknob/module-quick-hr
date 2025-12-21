import { PayslipGenerationSchedule, PayslipGenerationLog } from '../models';
import { NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class PayslipScheduleService {
  static async createSchedule(data: {
    companyId: string;
    scheduleName: string;
    description?: string;
    frequency: 'monthly' | 'biweekly' | 'weekly' | 'custom';
    generationDay: number;
    generationTime: string;
    timezone?: string;
    triggerType?: 'automatic' | 'manual' | 'scheduled';
    autoApprove?: boolean;
    autoSend?: boolean;
    emailConfiguration?: any;
    notificationConfiguration?: any;
    customScheduleRule?: any;
    enabledMonths?: number[];
    enabledYears?: number[];
    excludedDates?: Date[];
    createdBy?: string;
  }): Promise<PayslipGenerationSchedule> {
    this.validateScheduleData(data);

    const nextRunAt = this.calculateNextRunDate(
      data.frequency,
      data.generationDay,
      data.generationTime,
      data.timezone || 'UTC',
      data.enabledMonths,
      data.enabledYears,
      data.excludedDates
    );

    const schedule = await PayslipGenerationSchedule.create({
      id: uuidv4(),
      ...data,
      timezone: data.timezone || 'UTC',
      triggerType: data.triggerType || 'scheduled',
      autoApprove: data.autoApprove || false,
      autoSend: data.autoSend || false,
      status: 'active',
      nextRunAt,
    });

    return schedule;
  }

  static async updateSchedule(
    id: string,
    companyId: string,
    data: Partial<PayslipGenerationSchedule>
  ): Promise<PayslipGenerationSchedule> {
    const schedule = await PayslipGenerationSchedule.findOne({
      where: { id, companyId },
    });

    if (!schedule) {
      throw new NotFoundError('Payslip generation schedule');
    }

    if (data.frequency || data.generationDay || data.generationTime || data.timezone) {
      data.nextRunAt = this.calculateNextRunDate(
        data.frequency || schedule.frequency,
        data.generationDay || schedule.generationDay,
        data.generationTime || schedule.generationTime,
        data.timezone || schedule.timezone,
        data.enabledMonths || schedule.enabledMonths,
        data.enabledYears || schedule.enabledYears,
        data.excludedDates || schedule.excludedDates
      );
    }

    await schedule.update(data);
    return schedule;
  }

  static async getScheduleById(id: string, companyId: string): Promise<PayslipGenerationSchedule> {
    const schedule = await PayslipGenerationSchedule.findOne({
      where: { id, companyId },
    });

    if (!schedule) {
      throw new NotFoundError('Payslip generation schedule');
    }

    return schedule;
  }

  static async getSchedulesByCompany(
    companyId: string,
    status?: string
  ): Promise<PayslipGenerationSchedule[]> {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    return await PayslipGenerationSchedule.findAll({
      where,
      order: [['nextRunAt', 'ASC']],
    });
  }

  static async getDueSchedules(): Promise<PayslipGenerationSchedule[]> {
    const now = new Date();

    return await PayslipGenerationSchedule.findAll({
      where: {
        status: 'active',
        triggerType: 'scheduled',
        nextRunAt: {
          [Op.lte]: now,
        },
      },
    });
  }

  static async markScheduleRun(
    scheduleId: string,
    status: 'success' | 'failed',
    error?: string
  ): Promise<void> {
    const schedule = await PayslipGenerationSchedule.findByPk(scheduleId);
    if (!schedule) {
      return;
    }

    const nextRunAt = this.calculateNextRunDate(
      schedule.frequency,
      schedule.generationDay,
      schedule.generationTime,
      schedule.timezone,
      schedule.enabledMonths,
      schedule.enabledYears,
      schedule.excludedDates
    );

    await schedule.update({
      lastRunAt: new Date(),
      lastRunStatus: status,
      lastRunError: error || undefined,
      nextRunAt,
    });
  }

  static async createGenerationLog(data: {
    companyId: string;
    scheduleId?: string;
    payrollRunId?: string;
    generationSource: 'manual' | 'scheduled' | 'api' | 'bulk';
    month: number;
    year: number;
    templateId?: string;
    initiatedBy?: string;
    generationConfig?: any;
  }): Promise<PayslipGenerationLog> {
    return await PayslipGenerationLog.create({
      id: uuidv4(),
      ...data,
      status: 'initiated',
      totalEmployees: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      skippedGenerations: 0,
      startedAt: new Date(),
    });
  }

  static async updateGenerationLog(
    logId: string,
    data: {
      status?: 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled';
      totalEmployees?: number;
      successfulGenerations?: number;
      failedGenerations?: number;
      skippedGenerations?: number;
      completedAt?: Date;
      errorDetails?: any;
    }
  ): Promise<void> {
    const log = await PayslipGenerationLog.findByPk(logId);
    if (!log) {
      throw new NotFoundError('Generation log');
    }

    await log.update(data);
  }

  static async getGenerationLogsByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ rows: PayslipGenerationLog[]; count: number }> {
    const offset = (page - 1) * limit;

    return await PayslipGenerationLog.findAndCountAll({
      where: { companyId },
      order: [['startedAt', 'DESC']],
      limit,
      offset,
    });
  }

  private static validateScheduleData(data: {
    frequency: string;
    generationDay: number;
    generationTime: string;
  }): void {
    if (data.frequency === 'monthly' && (data.generationDay < 1 || data.generationDay > 31)) {
      throw new ValidationError('Generation day must be between 1 and 31 for monthly frequency');
    }

    if (data.frequency === 'biweekly' && (data.generationDay < 1 || data.generationDay > 14)) {
      throw new ValidationError('Generation day must be between 1 and 14 for biweekly frequency');
    }

    if (data.frequency === 'weekly' && (data.generationDay < 1 || data.generationDay > 7)) {
      throw new ValidationError('Generation day must be between 1 and 7 for weekly frequency');
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.generationTime)) {
      throw new ValidationError('Generation time must be in HH:MM format (24-hour)');
    }
  }

  private static calculateNextRunDate(
    frequency: string,
    generationDay: number,
    generationTime: string,
    timezone: string,
    enabledMonths?: number[],
    enabledYears?: number[],
    excludedDates?: Date[]
  ): Date {
    const now = new Date();
    let nextRun = new Date(now);

    const [hours, minutes] = generationTime.split(':').map(Number);

    switch (frequency) {
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        nextRun.setDate(generationDay);
        nextRun.setHours(hours, minutes, 0, 0);
        break;

      case 'biweekly':
        const daysToAdd = generationDay - (now.getDay() || 7);
        nextRun.setDate(now.getDate() + (daysToAdd > 0 ? daysToAdd : daysToAdd + 14));
        nextRun.setHours(hours, minutes, 0, 0);
        break;

      case 'weekly':
        const dayOfWeek = generationDay === 7 ? 0 : generationDay;
        const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7 || 7;
        nextRun.setDate(now.getDate() + daysUntilNext);
        nextRun.setHours(hours, minutes, 0, 0);
        break;

      default:
        nextRun.setDate(now.getDate() + 1);
        nextRun.setHours(hours, minutes, 0, 0);
    }

    if (enabledMonths && enabledMonths.length > 0) {
      while (!enabledMonths.includes(nextRun.getMonth() + 1)) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }

    if (enabledYears && enabledYears.length > 0) {
      while (!enabledYears.includes(nextRun.getFullYear())) {
        nextRun.setFullYear(nextRun.getFullYear() + 1);
      }
    }

    if (excludedDates && excludedDates.length > 0) {
      const isExcluded = excludedDates.some(
        (excludedDate) =>
          excludedDate.getDate() === nextRun.getDate() &&
          excludedDate.getMonth() === nextRun.getMonth() &&
          excludedDate.getFullYear() === nextRun.getFullYear()
      );

      if (isExcluded) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    }

    if (nextRun <= now) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    return nextRun;
  }
}


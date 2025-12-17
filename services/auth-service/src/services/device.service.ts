import { UserDevice } from '../models/UserDevice.model';
import { DeviceType, NotFoundError, ConflictError } from '@hrm/common';
import { Op } from 'sequelize';

export interface RegisterDeviceInput {
  userId: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  fcmToken?: string;
  apnsToken?: string;
  ipAddress?: string;
  userAgent?: string;
  isPrimary?: boolean;
}

export class DeviceService {
  static async registerDevice(input: RegisterDeviceInput): Promise<UserDevice> {
    const existingDevice = await UserDevice.findOne({
      where: {
        userId: input.userId,
        deviceId: input.deviceId,
      },
    });

    if (existingDevice) {
      existingDevice.lastActiveAt = new Date();
      existingDevice.isActive = true;
      if (input.fcmToken) {
        existingDevice.fcmToken = input.fcmToken;
      }
      if (input.apnsToken) {
        existingDevice.apnsToken = input.apnsToken;
      }
      if (input.deviceName) {
        existingDevice.deviceName = input.deviceName;
      }
      if (input.deviceModel) {
        existingDevice.deviceModel = input.deviceModel;
      }
      if (input.osVersion) {
        existingDevice.osVersion = input.osVersion;
      }
      if (input.appVersion) {
        existingDevice.appVersion = input.appVersion;
      }
      if (input.ipAddress) {
        existingDevice.ipAddress = input.ipAddress;
      }
      if (input.userAgent) {
        existingDevice.userAgent = input.userAgent;
      }
      if (input.isPrimary !== undefined) {
        existingDevice.isPrimary = input.isPrimary;
      }

      await existingDevice.save();
      return existingDevice;
    }

    if (input.isPrimary) {
      await UserDevice.update(
        { isPrimary: false },
        {
          where: {
            userId: input.userId,
            isPrimary: true,
          },
        }
      );
    }

    const device = await UserDevice.create({
      ...input,
      isActive: true,
      lastActiveAt: new Date(),
      isPrimary: input.isPrimary || false,
    });

    return device;
  }

  static async getDevicesByUserId(userId: string): Promise<UserDevice[]> {
    return await UserDevice.findAll({
      where: {
        userId,
        isActive: true,
      },
      order: [['isPrimary', 'DESC'], ['lastActiveAt', 'DESC']],
    });
  }

  static async getDeviceById(deviceId: string, userId: string): Promise<UserDevice | null> {
    return await UserDevice.findOne({
      where: {
        id: deviceId,
        userId,
      },
    });
  }

  static async updateDevice(
    deviceId: string,
    userId: string,
    updates: {
      fcmToken?: string;
      apnsToken?: string;
      deviceName?: string;
      isPrimary?: boolean;
      isActive?: boolean;
    }
  ): Promise<UserDevice> {
    const device = await UserDevice.findOne({
      where: {
        id: deviceId,
        userId,
      },
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    if (updates.isPrimary && updates.isPrimary !== device.isPrimary) {
      await UserDevice.update(
        { isPrimary: false },
        {
          where: {
            userId,
            isPrimary: true,
            id: { [Op.ne]: deviceId },
          },
        }
      );
    }

    if (updates.fcmToken !== undefined) {
      device.fcmToken = updates.fcmToken;
    }
    if (updates.apnsToken !== undefined) {
      device.apnsToken = updates.apnsToken;
    }
    if (updates.deviceName !== undefined) {
      device.deviceName = updates.deviceName;
    }
    if (updates.isPrimary !== undefined) {
      device.isPrimary = updates.isPrimary;
    }
    if (updates.isActive !== undefined) {
      device.isActive = updates.isActive;
    }

    device.lastActiveAt = new Date();
    await device.save();

    return device;
  }

  static async deactivateDevice(deviceId: string, userId: string): Promise<void> {
    const device = await UserDevice.findOne({
      where: {
        id: deviceId,
        userId,
      },
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    device.isActive = false;
    await device.save();
  }

  static async deleteDevice(deviceId: string, userId: string): Promise<void> {
    const device = await UserDevice.findOne({
      where: {
        id: deviceId,
        userId,
      },
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    await device.destroy();
  }

  static async getFcmTokensForUser(userId: string): Promise<string[]> {
    const devices = await UserDevice.findAll({
      where: {
        userId,
        isActive: true,
        fcmToken: { [Op.ne]: null as any },
      },
      attributes: ['fcmToken'],
    });

    return devices.map((d) => d.fcmToken!).filter((token) => token);
  }

  static async getApnsTokensForUser(userId: string): Promise<string[]> {
    const devices = await UserDevice.findAll({
      where: {
        userId,
        isActive: true,
        apnsToken: { [Op.ne]: null as any },
      },
      attributes: ['apnsToken'],
    });

    return devices.map((d) => d.apnsToken!).filter((token) => token);
  }
}


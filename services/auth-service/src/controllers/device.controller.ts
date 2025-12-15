import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeviceService } from '../services/device.service';
import { ResponseFormatter } from '@hrm/common';
import { AuthRequest } from '@hrm/common';
import { DeviceType } from '@hrm/common';

const registerDeviceSchema = z.object({
  deviceId: z.string().min(1),
  deviceType: z.nativeEnum(DeviceType),
  deviceName: z.string().optional(),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  fcmToken: z.string().optional(),
  apnsToken: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const updateDeviceSchema = z.object({
  fcmToken: z.string().optional(),
  apnsToken: z.string().optional(),
  deviceName: z.string().optional(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export class DeviceController {
  static async registerDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        return ResponseFormatter.error(res, 'User not authenticated', '', 401);
      }

      const validatedData = registerDeviceSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const device = await DeviceService.registerDevice({
        ...validatedData,
        userId: req.user.uid,
        ipAddress,
        userAgent,
      });

      ResponseFormatter.success(
        res,
        device,
        'Device registered successfully',
        `Device ${device.deviceName || device.deviceId} has been registered`
      );
    } catch (error) {
      next(error);
    }
  }

  static async getDevices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        return ResponseFormatter.error(res, 'User not authenticated', '', 401);
      }

      const devices = await DeviceService.getDevicesByUserId(req.user.uid);

      ResponseFormatter.success(
        res,
        devices,
        'Devices retrieved successfully',
        `Found ${devices.length} device(s)`
      );
    } catch (error) {
      next(error);
    }
  }

  static async getDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        return ResponseFormatter.error(res, 'User not authenticated', '', 401);
      }

      const { id } = req.params;
      const device = await DeviceService.getDeviceById(id, req.user.uid);

      if (!device) {
        return ResponseFormatter.error(res, 'Device not found', '', 404);
      }

      ResponseFormatter.success(res, device, 'Device retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        return ResponseFormatter.error(res, 'User not authenticated', '', 401);
      }

      const { id } = req.params;
      const validatedData = updateDeviceSchema.parse(req.body);

      const device = await DeviceService.updateDevice(id, req.user.uid, validatedData);

      ResponseFormatter.success(res, device, 'Device updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deactivateDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        return ResponseFormatter.error(res, 'User not authenticated', '', 401);
      }

      const { id } = req.params;
      await DeviceService.deactivateDevice(id, req.user.uid);

      ResponseFormatter.success(res, null, 'Device deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        return ResponseFormatter.error(res, 'User not authenticated', '', 401);
      }

      const { id } = req.params;
      await DeviceService.deleteDevice(id, req.user.uid);

      ResponseFormatter.success(res, null, 'Device deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}


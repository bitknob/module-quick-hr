import { Response, NextFunction } from 'express';
import { UserModuleService } from '../services/userModule.service';
import { ResponseFormatter, AuthRequest } from '@hrm/common';

export const assignModule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, moduleKey, moduleName } = req.body;

    if (!userId || !moduleKey) {
      return ResponseFormatter.error(res, 'User ID and module key are required', '', 400);
    }

    const userModule = await UserModuleService.assignModule({
      userId,
      moduleKey,
      moduleName,
    });

    ResponseFormatter.success(res, userModule, 'Module assigned successfully', '', 201);
  } catch (error) {
    next(error);
  }
};

export const getUserModules = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.query;

    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const modules = await UserModuleService.getUserModules(userId, isActiveBool);

    ResponseFormatter.success(res, modules, 'User modules retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllUserModules = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, isActive } = req.query;

    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const modules = await UserModuleService.getAllUserModules(
      userId as string | undefined,
      isActiveBool
    );

    ResponseFormatter.success(res, modules, 'User modules retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserModuleById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userModule = await UserModuleService.getUserModuleById(id);

    ResponseFormatter.success(res, userModule, 'User module retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserModule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { moduleName, isActive } = req.body;

    const userModule = await UserModuleService.updateUserModule(id, {
      moduleName,
      isActive,
    });

    ResponseFormatter.success(res, userModule, 'User module updated successfully');
  } catch (error) {
    next(error);
  }
};

export const removeUserModule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await UserModuleService.removeUserModule(id);

    ResponseFormatter.success(res, null, 'User module removed successfully');
  } catch (error) {
    next(error);
  }
};

export const getValidModuleKeys = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const moduleKeys = UserModuleService.getValidModuleKeys();
    const moduleNames = UserModuleService.getModuleNames();

    ResponseFormatter.success(res, {
      moduleKeys,
      moduleNames,
    }, 'Valid module keys retrieved successfully');
  } catch (error) {
    next(error);
  }
};


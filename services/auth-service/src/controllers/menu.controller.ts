import { Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service';
import { UserRole, ResponseFormatter, AuthRequest } from '@hrm/common';

export const getMenu = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.role) {
      return ResponseFormatter.error(res, 'User role not found', '', 400);
    }

    const role = req.user.role as UserRole;
    const menu = await MenuService.getMenuForRole(role);

    ResponseFormatter.success(res, menu, 'Menu retrieved successfully');
  } catch (error) {
    next(error);
  }
};


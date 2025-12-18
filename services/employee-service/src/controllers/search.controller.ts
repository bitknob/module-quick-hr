import { Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { ResponseFormatter, UserRole } from '@hrm/common';
import { EnrichedAuthRequest } from '../middleware/accessControl';

export const globalSearch = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.role) {
      return ResponseFormatter.error(res, 'User role not found', '', 400);
    }

    const searchTerm = (req.query.q || req.query.searchTerm || '') as string;
    const limit = parseInt((req.query.limit as string) || '20');

    if (!searchTerm || searchTerm.trim().length === 0) {
      return ResponseFormatter.error(res, 'Search term is required', '', 400);
    }

    if (searchTerm.trim().length < 2) {
      return ResponseFormatter.error(res, 'Search term must be at least 2 characters', '', 400);
    }

    const userRole = req.user.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const result = await SearchService.globalSearch(
      searchTerm,
      userRole,
      userCompanyId,
      Math.min(limit, 50) // Max 50 results
    );

    ResponseFormatter.success(
      res,
      result,
      'Search completed successfully',
      `Found ${result.total} result(s) across ${Object.values(result.byType).filter(count => count > 0).length} type(s)`
    );
  } catch (error) {
    next(error);
  }
};


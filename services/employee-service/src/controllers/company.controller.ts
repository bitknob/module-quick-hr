import { Response, NextFunction } from 'express';
import { CompanyService } from '../services/company.service';
import { AccessControl, UserRole, ResponseFormatter, ValidationError } from '@hrm/common';
import { EnrichedAuthRequest } from '../middleware/accessControl';

export const getAllCompanies = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await CompanyService.getAllCompanies();
    ResponseFormatter.success(res, companies, 'Companies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCompany = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    // Check access permissions
    if (!AccessControl.canAccessAllCompanies(userRole) && userCompanyId && userCompanyId !== id) {
      return ResponseFormatter.error(res, 'Access denied: Cannot access different company', '', 403);
    }

    const company = await CompanyService.getCompanyById(id);
    ResponseFormatter.success(res, company, 'Company retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, description, hrbpId } = req.body;

    if (!name || !code) {
      return ResponseFormatter.error(res, 'Name and code are required', '', 400);
    }

    const company = await CompanyService.createCompany({
      name,
      code,
      description,
      hrbpId,
    });

    ResponseFormatter.success(res, company, 'Company created successfully', '', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    // Check access permissions
    if (!AccessControl.canAccessAllCompanies(userRole) && userCompanyId && userCompanyId !== id) {
      return ResponseFormatter.error(res, 'Access denied: Cannot update different company', '', 403);
    }

    const { name, code, description, hrbpId, status } = req.body;

    const company = await CompanyService.updateCompany(id, {
      name,
      code,
      description,
      hrbpId,
      status,
    });

    ResponseFormatter.success(res, company, 'Company updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await CompanyService.deleteCompany(id);
    ResponseFormatter.success(res, null, 'Company deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadCompanyProfileImage = async (
  req: EnrichedAuthRequest & { file?: { buffer: Buffer; originalname: string; mimetype: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    // Check access permissions
    if (!AccessControl.canAccessAllCompanies(userRole) && userCompanyId !== companyId) {
      return ResponseFormatter.error(res, 'Access denied: Cannot upload image for different company', '', 403);
    }

    if (!req.file) {
      return next(new ValidationError('No image file provided'));
    }

    // Delete old profile image if exists
    const company = await CompanyService.getCompanyById(companyId);
    if (company.profileImageUrl) {
      try {
        const { deleteFromFirebaseStorage } = require('@hrm/common');
        await deleteFromFirebaseStorage(company.profileImageUrl);
      } catch (error) {
        // Log error but continue with upload
        console.error('Failed to delete old profile image:', error);
      }
    }

    // Upload new image to Firebase Storage
    const folder = `companies/${companyId}`;
    const { uploadToFirebaseStorage } = require('@hrm/common');
    const imageUrl = await uploadToFirebaseStorage(
      req.file.buffer,
      req.file.originalname,
      folder,
      req.file.mimetype
    );

    // Update company with new profile image URL
    const updatedCompany = await CompanyService.updateProfileImage(companyId, imageUrl);

    ResponseFormatter.success(
      res,
      {
        id: updatedCompany.id,
        name: updatedCompany.name,
        profileImageUrl: updatedCompany.profileImageUrl,
      },
      'Company profile image uploaded successfully'
    );
  } catch (error) {
    next(error);
  }
};

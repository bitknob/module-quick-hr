import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { PayslipTemplate, Payslip } from '../models';
import { PayslipGeneratorService } from '../services/payslipGenerator.service';
import { resolveCompanyId, checkCompanyAccess } from '../utils/companyIdResolver';
import { z } from 'zod';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const createTemplateSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  templateName: z.string().min(1, 'Template name is required'),
  templateType: z.enum(['standard', 'minimal', 'detailed', 'custom']),
  description: z.string().optional(),
  headerConfiguration: z.any().default({}),
  footerConfiguration: z.any().default({}),
  bodyConfiguration: z.any().default({}),
  stylingConfiguration: z.any().default({}),
  sectionsConfiguration: z.any().default({}),
  watermarkSettings: z.any().optional(),
  brandingSettings: z.any().optional(),
  isDefault: z.boolean().optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

export const createTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create template'));
    }

    const validatedData = createTemplateSchema.parse(req.body);

    if (validatedData.isDefault) {
      await PayslipTemplate.update(
        { isDefault: false },
        { where: { companyId: validatedData.companyId } }
      );
    }

    const template = await PayslipTemplate.create({
      id: uuidv4(),
      ...validatedData,
      status: 'draft',
      isDefault: validatedData.isDefault || false,
      createdBy: req.user!.uid,
    });

    const templateData = template.toJSON ? template.toJSON() : template;
    ResponseFormatter.success(res, templateData, 'Template created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return next(new ValidationError('Company ID is required'));
    }

    const template = await PayslipGeneratorService.getTemplateById(id, companyId);
    const templateData = template.toJSON ? template.toJSON() : template;

    ResponseFormatter.success(res, templateData, 'Template retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTemplatesByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    const resolvedCompanyId = await resolveCompanyId(req.params.companyId, req.user?.uid, userRole);
    await checkCompanyAccess(resolvedCompanyId, req.user?.uid, userRole);
    
    // If resolvedCompanyId is null, it means placeholder was sent for a user who can access all companies
    // Return empty array in this case
    if (resolvedCompanyId === null) {
      ResponseFormatter.success(res, [], 'Templates retrieved successfully');
      return;
    }
    
    const status = req.query.status as string | undefined;

    const where: any = { companyId: resolvedCompanyId };
    if (status) {
      where.status = status;
    }

    const templates = await PayslipTemplate.findAll({
      where,
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    const templatesData = templates.map((t) => (t.toJSON ? t.toJSON() : t));
    ResponseFormatter.success(res, templatesData, 'Templates retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;
    const userRole = req.user?.role as UserRole;

    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to update template'));
    }

    const validatedData = updateTemplateSchema.parse(req.body);
    const template = await PayslipGeneratorService.getTemplateById(id, companyId);

    if (validatedData.isDefault) {
      await PayslipTemplate.update(
        { isDefault: false },
        { where: { companyId, id: { [Op.ne]: id } } }
      );
    }

    await template.update(validatedData);
    const templateData = template.toJSON ? template.toJSON() : template;

    ResponseFormatter.success(res, templateData, 'Template updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const setDefaultTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;
    const userRole = req.user?.role as UserRole;

    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to set default template'));
    }

    const template = await PayslipGeneratorService.getTemplateById(id, companyId);

    await PayslipTemplate.update(
      { isDefault: false },
      { where: { companyId, id: { [Op.ne]: id } } }
    );

    await template.update({ isDefault: true, status: 'active' });
    const templateData = template.toJSON ? template.toJSON() : template;

    ResponseFormatter.success(res, templateData, 'Default template set successfully');
  } catch (error) {
    next(error);
  }
};

export const generatePayslipPDF = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findByPk(id);
    if (!payslip) {
      return next(new ValidationError('Payslip not found'));
    }

    const options = {
      templateId: req.body.templateId,
      format: req.body.format || 'pdf',
      includeWatermark: req.body.includeWatermark !== false,
      includeLogo: req.body.includeLogo !== false,
      language: req.body.language || 'en',
      currency: req.body.currency || 'INR',
      customStyles: req.body.customStyles,
    };

    const result = await PayslipGeneratorService.generatePayslipPDF(payslip, options);

    ResponseFormatter.success(res, result, 'Payslip PDF generated successfully');
  } catch (error) {
    next(error);
  }
};


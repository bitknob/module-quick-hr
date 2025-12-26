import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError } from '@hrm/common';
import { EmployeeDetailService } from '../services/employeeDetail.service';
import { z } from 'zod';

const createOrUpdateDetailSchema = z.object({
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankIFSC: z.string().optional(),
  panNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  spouseName: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  previousEmployer: z.string().optional(),
  previousDesignation: z.string().optional(),
  previousSalary: z.number().optional(),
  noticePeriod: z.number().int().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  additionalInfo: z.record(z.any()).optional(),
});

export const createOrUpdateDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, companyId } = req.params;
    const validatedData = createOrUpdateDetailSchema.parse(req.body);
    const detail = await EmployeeDetailService.createOrUpdateDetail(
      employeeId,
      companyId,
      validatedData
    );
    const detailData = detail.toJSON ? detail.toJSON() : detail;

    ResponseFormatter.success(res, detailData, 'Employee detail saved successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const detail = await EmployeeDetailService.getDetailByEmployeeId(employeeId, companyId);
    const detailData = detail.toJSON ? detail.toJSON() : detail;

    ResponseFormatter.success(res, detailData, 'Employee detail retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, companyId } = req.params;
    const validatedData = createOrUpdateDetailSchema.parse(req.body);
    const detail = await EmployeeDetailService.updateDetail(
      employeeId,
      companyId,
      validatedData
    );
    const detailData = detail.toJSON ? detail.toJSON() : detail;

    ResponseFormatter.success(res, detailData, 'Employee detail updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getDetailsByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const details = await EmployeeDetailService.getDetailsByCompany(companyId);
    const detailsData = details.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.success(res, detailsData, 'Employee details retrieved successfully');
  } catch (error) {
    next(error);
  }
};


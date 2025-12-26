import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole, NotFoundError } from '@hrm/common';
import { DocumentService } from '../services/document.service';
import { EmployeeQueries } from '../queries/employee.queries';
import { z } from 'zod';
import { DocumentType, DocumentStatus } from '../models/EmployeeDocument.model';

const uploadDocumentSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  documentType: z.enum([
    'id_proof',
    'address_proof',
    'pan_card',
    'aadhaar_card',
    'passport',
    'driving_license',
    'educational_certificate',
    'experience_certificate',
    'offer_letter',
    'appointment_letter',
    'relieving_letter',
    'salary_slip',
    'bank_statement',
    'form_16',
    'other',
  ]),
  documentName: z.string().min(1, 'Document name is required'),
  expiryDate: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  notes: z.string().optional(),
});

const updateDocumentSchema = z.object({
  documentName: z.string().min(1).optional(),
  expiryDate: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  notes: z.string().optional(),
});

const rejectDocumentSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export const uploadDocument = async (
  req: AuthRequest & { file?: { buffer: Buffer; originalname: string; mimetype: string; size: number } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      return next(new ValidationError('No document file provided'));
    }

    if (!req.user?.uid) {
      return next(new ValidationError('User ID is required'));
    }

    const validatedData = uploadDocumentSchema.parse(req.body);
    const document = await DocumentService.uploadDocument({
      employeeId: validatedData.employeeId,
      companyId: validatedData.companyId,
      documentType: validatedData.documentType as DocumentType,
      documentName: validatedData.documentName,
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      expiryDate: validatedData.expiryDate,
      notes: validatedData.notes,
      uploadedBy: req.user.uid,
    });

    const documentData = document.toJSON ? document.toJSON() : document;
    ResponseFormatter.success(res, documentData, 'Document uploaded successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const document = await DocumentService.getDocumentById(id, companyId);
    const documentData = document.toJSON ? document.toJSON() : document;

    ResponseFormatter.success(res, documentData, 'Document retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const validatedData = updateDocumentSchema.parse(req.body);
    const document = await DocumentService.updateDocument(id, validatedData, companyId);
    const documentData = document.toJSON ? document.toJSON() : document;

    ResponseFormatter.success(res, documentData, 'Document updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const deleteDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    await DocumentService.deleteDocument(id, companyId);
    ResponseFormatter.success(res, null, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.MANAGER].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to verify documents'));
    }

    if (!req.user?.uid) {
      return next(new ValidationError('User ID is required'));
    }

    const document = await DocumentService.verifyDocument(id, req.user.uid, companyId);
    const documentData = document.toJSON ? document.toJSON() : document;

    ResponseFormatter.success(res, documentData, 'Document verified successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.MANAGER].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to reject documents'));
    }

    if (!req.user?.uid) {
      return next(new ValidationError('User ID is required'));
    }

    const validatedData = rejectDocumentSchema.parse(req.body);
    const document = await DocumentService.rejectDocument(
      id,
      req.user.uid,
      validatedData.rejectionReason,
      companyId
    );
    const documentData = document.toJSON ? document.toJSON() : document;

    ResponseFormatter.success(res, documentData, 'Document rejected successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getDocumentsByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const documentType = req.query.documentType as DocumentType | undefined;
    const status = req.query.status as DocumentStatus | undefined;

    // Check if the employeeId parameter is actually a userId
    // First try to find by employee ID, then by userId
    let actualEmployeeId = employeeId;
    let employee = await EmployeeQueries.findById(employeeId, companyId);
    
    if (!employee) {
      // Try to find by userId
      employee = await EmployeeQueries.findByUserId(employeeId);
      if (employee) {
        actualEmployeeId = employee.id;
      } else {
        // Employee not found - check if it's the current user requesting their own data
        // Users without employee records don't have documents, so return empty array
        const currentUserId = req.user?.uid || req.user?.userId;
        if (currentUserId && currentUserId === employeeId) {
          ResponseFormatter.success(res, [], 'Documents retrieved successfully (no employee record)');
          return;
        }
        // For other users, return 404
        throw new NotFoundError('Employee');
      }
    }

    // Only call service if we found an employee
    const documents = await DocumentService.getDocumentsByEmployee(
      actualEmployeeId,
      companyId,
      documentType,
      status
    );
    const documentsData = documents.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.success(res, documentsData, 'Documents retrieved successfully');
  } catch (error: any) {
    // Handle NotFoundError - if user is requesting their own data, return empty array
    if (error instanceof NotFoundError && error.message?.includes('Employee')) {
      const { employeeId } = req.params;
      const currentUserId = req.user?.uid || req.user?.userId;
      if (currentUserId && currentUserId === employeeId) {
        // User is requesting their own data but has no employee record
        ResponseFormatter.success(res, [], 'Documents retrieved successfully (no employee record)');
        return;
      }
    }
    // For other errors, pass to error handler
    next(error);
  }
};

export const getDocumentsByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const documentType = req.query.documentType as DocumentType | undefined;
    const status = req.query.status as DocumentStatus | undefined;

    const documents = await DocumentService.getDocumentsByCompany(companyId, documentType, status);
    const documentsData = documents.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.success(res, documentsData, 'Documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPendingDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const documents = await DocumentService.getPendingDocuments(companyId);
    const documentsData = documents.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.success(res, documentsData, 'Pending documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const searchDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = {
      companyId: req.query.companyId as string | undefined,
      employeeId: req.query.employeeId as string | undefined,
      documentType: req.query.documentType as DocumentType | undefined,
      status: req.query.status as DocumentStatus | undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await DocumentService.searchDocuments(filters, page, limit);
    const documentsData = result.rows.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.paginated(
      res,
      documentsData,
      result.count,
      page,
      limit,
      'Documents retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};


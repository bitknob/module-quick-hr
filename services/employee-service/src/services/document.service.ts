import { EmployeeDocument, DocumentType } from '../models/EmployeeDocument.model';

type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';
import { DocumentQueries } from '../queries/document.queries';
import { EmployeeQueries } from '../queries/employee.queries';
import { ConflictError, NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { uploadDocumentToS3, deleteFromS3 } from '@hrm/common';

export class DocumentService {
  static async uploadDocument(data: {
    employeeId: string;
    companyId: string;
    documentType: DocumentType;
    documentName: string;
    fileBuffer: Buffer;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expiryDate?: Date;
    notes?: string;
    uploadedBy: string;
  }): Promise<EmployeeDocument> {
    const employee = await EmployeeQueries.findById(data.employeeId, data.companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    if (employee.companyId !== data.companyId) {
      throw new ValidationError('Employee does not belong to the specified company');
    }

    // Limit file size to 2MB (client-side limit)
    // After compression, files will be smaller, allowing more files within AWS free tier (5GB storage limit)
    if (data.fileSize > 2 * 1024 * 1024) {
      throw new ValidationError('File size exceeds maximum allowed size of 2MB');
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(data.mimeType)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: PDF, Images (JPEG, PNG, GIF, WebP), Word Documents`
      );
    }

    const uploadResult = await uploadDocumentToS3(
      data.fileBuffer,
      data.fileName,
      data.mimeType
    );

    // Use compressed size for storage tracking (actual size stored in S3)
    return await EmployeeDocument.create({
      id: uuidv4(),
      employeeId: data.employeeId,
      companyId: data.companyId,
      documentType: data.documentType,
      documentName: data.documentName,
      fileUrl: uploadResult.url,
      fileName: data.fileName,
      fileSize: uploadResult.compressedSize, // Store compressed size (actual S3 storage)
      mimeType: data.mimeType,
      status: 'pending',
      expiryDate: data.expiryDate,
      notes: data.notes,
      uploadedBy: data.uploadedBy,
    });
  }

  static async getDocumentById(id: string, companyId?: string): Promise<EmployeeDocument> {
    const document = await DocumentQueries.findById(id, companyId);
    if (!document) {
      throw new NotFoundError('Document');
    }
    return document;
  }

  static async updateDocument(
    id: string,
    data: Partial<{
      documentName: string;
      expiryDate: Date;
      notes: string;
    }>,
    companyId?: string
  ): Promise<EmployeeDocument> {
    const document = await DocumentQueries.findById(id, companyId);
    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.status === 'verified') {
      throw new ValidationError('Cannot update verified document');
    }

    await EmployeeDocument.update(data as any, { where: { id } });
    return await DocumentQueries.findById(id, companyId) as EmployeeDocument;
  }

  static async deleteDocument(id: string, companyId?: string): Promise<void> {
    const document = await DocumentQueries.findById(id, companyId);
    if (!document) {
      throw new NotFoundError('Document');
    }

    try {
      // Track deletion with actual file size before deleting
      const { trackDeletion } = require('@hrm/common');
      trackDeletion(document.fileSize);
      
      await deleteFromS3(document.fileUrl);
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
    }

    await EmployeeDocument.destroy({ where: { id } });
  }

  static async verifyDocument(
    id: string,
    verifierId: string,
    companyId?: string
  ): Promise<EmployeeDocument> {
    const document = await DocumentQueries.findById(id, companyId);
    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.status !== 'pending') {
      throw new ValidationError('Only pending documents can be verified');
    }

    const verifier = await EmployeeQueries.findById(verifierId, companyId);
    if (!verifier) {
      throw new NotFoundError('Verifier');
    }

    await EmployeeDocument.update(
      {
        status: 'verified',
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      },
      { where: { id } }
    );

    return await DocumentQueries.findById(id, companyId) as EmployeeDocument;
  }

  static async rejectDocument(
    id: string,
    verifierId: string,
    rejectionReason: string,
    companyId?: string
  ): Promise<EmployeeDocument> {
    const document = await DocumentQueries.findById(id, companyId);
    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.status !== 'pending') {
      throw new ValidationError('Only pending documents can be rejected');
    }

    const verifier = await EmployeeQueries.findById(verifierId, companyId);
    if (!verifier) {
      throw new NotFoundError('Verifier');
    }

    await EmployeeDocument.update(
      {
        status: 'rejected',
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason,
      },
      { where: { id } }
    );

    return await DocumentQueries.findById(id, companyId) as EmployeeDocument;
  }

  static async getDocumentsByEmployee(
    employeeId: string,
    companyId?: string,
    documentType?: DocumentType,
    status?: DocumentStatus
  ): Promise<EmployeeDocument[]> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    return await DocumentQueries.findByEmployee(employeeId, companyId, documentType, status);
  }

  static async getDocumentsByCompany(
    companyId: string,
    documentType?: DocumentType,
    status?: DocumentStatus
  ): Promise<EmployeeDocument[]> {
    return await DocumentQueries.findByCompany(companyId, documentType, status);
  }

  static async getPendingDocuments(companyId: string): Promise<EmployeeDocument[]> {
    return await DocumentQueries.findPendingByCompany(companyId);
  }

  static async markExpiredDocuments(): Promise<number> {
    const expiredDocuments = await DocumentQueries.findExpiredDocuments();
    let count = 0;

    for (const doc of expiredDocuments) {
      await EmployeeDocument.update(
        { status: 'expired' },
        { where: { id: doc.id } }
      );
      count++;
    }

    return count;
  }

  static async searchDocuments(
    filters: {
      companyId?: string;
      employeeId?: string;
      documentType?: DocumentType;
      status?: DocumentStatus;
    },
    page: number = 1,
    limit: number = 20
  ) {
    return await DocumentQueries.searchDocuments(filters, page, limit);
  }
}


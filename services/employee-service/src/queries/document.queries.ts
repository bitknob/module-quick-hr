import { Op } from 'sequelize';
import { EmployeeDocument } from '../models/EmployeeDocument.model';
import { Employee } from '../models/Employee.model';
import { DocumentType, DocumentStatus } from '../models/EmployeeDocument.model';

export class DocumentQueries {
  static async findById(id: string, companyId?: string): Promise<EmployeeDocument | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    return await EmployeeDocument.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'verifier',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
    });
  }

  static async findByEmployee(
    employeeId: string,
    companyId?: string,
    documentType?: DocumentType,
    status?: DocumentStatus
  ): Promise<EmployeeDocument[]> {
    const where: any = { employeeId };
    if (companyId) {
      where.companyId = companyId;
    }
    if (documentType) {
      where.documentType = documentType;
    }
    if (status) {
      where.status = status;
    }

    return await EmployeeDocument.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'verifier',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  static async findByCompany(
    companyId: string,
    documentType?: DocumentType,
    status?: DocumentStatus
  ): Promise<EmployeeDocument[]> {
    const where: any = { companyId };
    if (documentType) {
      where.documentType = documentType;
    }
    if (status) {
      where.status = status;
    }

    return await EmployeeDocument.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'verifier',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  static async findPendingByCompany(companyId: string): Promise<EmployeeDocument[]> {
    return await EmployeeDocument.findAll({
      where: {
        companyId,
        status: 'pending',
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  static async findExpiredDocuments(): Promise<EmployeeDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await EmployeeDocument.findAll({
      where: {
        expiryDate: {
          [Op.lt]: today,
        },
        status: {
          [Op.ne]: 'expired',
        },
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
      ],
    });
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
  ): Promise<{ rows: EmployeeDocument[]; count: number }> {
    const where: any = {};
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }
    if (filters.documentType) {
      where.documentType = filters.documentType;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await EmployeeDocument.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'verifier',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }
}


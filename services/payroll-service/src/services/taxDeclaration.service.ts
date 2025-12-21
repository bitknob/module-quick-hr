import { EmployeeTaxDeclaration } from '../models/EmployeeTaxDeclaration.model';
import { NotFoundError, ValidationError, ConflictError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';

export class TaxDeclarationService {
  static async createOrUpdateTaxDeclaration(data: {
    employeeId: string;
    companyId: string;
    financialYear: string;
    declarations: any;
  }): Promise<EmployeeTaxDeclaration> {
    const existing = await EmployeeTaxDeclaration.findOne({
      where: {
        employeeId: data.employeeId,
        financialYear: data.financialYear,
      },
    });

    let totalDeclaredAmount = 0;
    if (data.declarations) {
      Object.values(data.declarations).forEach((value: any) => {
        if (typeof value === 'number') {
          totalDeclaredAmount += value;
        }
      });
    }

    if (existing) {
      await existing.update({
        declarations: data.declarations,
        totalDeclaredAmount,
        verificationStatus: 'pending',
      });
      return existing;
    }

    const declaration = await EmployeeTaxDeclaration.create({
      id: uuidv4(),
      ...data,
      totalDeclaredAmount,
      verificationStatus: 'pending',
    });

    return declaration;
  }

  static async submitTaxDeclaration(id: string): Promise<EmployeeTaxDeclaration> {
    const declaration = await EmployeeTaxDeclaration.findByPk(id);
    if (!declaration) {
      throw new NotFoundError('Tax declaration');
    }

    await declaration.update({
      submittedAt: new Date(),
    });

    return declaration;
  }

  static async verifyTaxDeclaration(
    id: string,
    verifiedAmount: number,
    verifiedBy: string,
    notes?: string
  ): Promise<EmployeeTaxDeclaration> {
    const declaration = await EmployeeTaxDeclaration.findByPk(id);
    if (!declaration) {
      throw new NotFoundError('Tax declaration');
    }

    let verificationStatus: 'verified' | 'partial' | 'rejected' = 'verified';
    if (verifiedAmount < declaration.totalDeclaredAmount) {
      verificationStatus = verifiedAmount > 0 ? 'partial' : 'rejected';
    }

    await declaration.update({
      verifiedAmount,
      verificationStatus,
      verifiedBy,
      verifiedAt: new Date(),
      notes,
    });

    return declaration;
  }

  static async getTaxDeclarationById(id: string): Promise<EmployeeTaxDeclaration> {
    const declaration = await EmployeeTaxDeclaration.findByPk(id);
    if (!declaration) {
      throw new NotFoundError('Tax declaration');
    }
    return declaration;
  }

  static async getTaxDeclarationByEmployeeAndYear(
    employeeId: string,
    financialYear: string
  ): Promise<EmployeeTaxDeclaration | null> {
    return await EmployeeTaxDeclaration.findOne({
      where: {
        employeeId,
        financialYear,
      },
    });
  }

  static async getTaxDeclarationsByCompany(
    companyId: string,
    financialYear?: string,
    verificationStatus?: string
  ): Promise<EmployeeTaxDeclaration[]> {
    const where: any = { companyId };

    if (financialYear) where.financialYear = financialYear;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    return await EmployeeTaxDeclaration.findAll({
      where,
      order: [['financialYear', 'DESC'], ['createdAt', 'DESC']],
    });
  }
}


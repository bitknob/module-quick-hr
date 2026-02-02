import { Company } from '../models/Company.model';
import { CompanyQueries } from '../queries/company.queries';
import { NotFoundError, ConflictError, ValidationError } from '@hrm/common';

export class CompanyService {
  static async createCompany(data: {
    name: string;
    code: string;
    description?: string;
    hrbpId?: string;
    subscriptionStatus?: 'trial' | 'active' | 'inactive' | 'expired';
    subscriptionEndsAt?: Date;
  }): Promise<Company> {
    const existingCompany = await CompanyQueries.findByCode(data.code);
    if (existingCompany) {
      throw new ConflictError('Company code already exists');
    }

    return await CompanyQueries.create(data);
  }

  static async getAllCompanies(options?: {
    searchTerm?: string;
    status?: string;
    limit?: number;
  }): Promise<Company[]> {
    return await CompanyQueries.findAll(options);
  }

  static async getCompanyById(id: string): Promise<Company> {
    const company = await CompanyQueries.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    return company;
  }

  static async getCompanyByName(name: string): Promise<Company> {
    const company = await CompanyQueries.findByName(name);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    return company;
  }

  static async updateCompany(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      hrbpId?: string;
      status?: 'active' | 'inactive';
      subscriptionStatus?: 'trial' | 'active' | 'inactive' | 'expired';
      subscriptionEndsAt?: Date;
    }
  ): Promise<Company> {
    const company = await CompanyQueries.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (data.code && data.code !== company.code) {
      const existingCompany = await CompanyQueries.findByCode(data.code);
      if (existingCompany) {
        throw new ConflictError('Company code already exists');
      }
    }

    const affectedCount = await CompanyQueries.update(id, data);
    if (affectedCount === 0) {
      throw new NotFoundError('Company not found');
    }

    const updatedCompany = await CompanyQueries.findById(id);
    if (!updatedCompany) {
      throw new NotFoundError('Company not found');
    }

    return updatedCompany;
  }

  static async deleteCompany(id: string): Promise<void> {
    const company = await CompanyQueries.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const affectedCount = await CompanyQueries.delete(id);
    if (affectedCount === 0) {
      throw new NotFoundError('Company not found');
    }
  }

  static async updateProfileImage(companyId: string, profileImageUrl: string): Promise<Company> {
    const company = await CompanyQueries.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    await CompanyQueries.update(companyId, { profileImageUrl });
    const updatedCompany = await CompanyQueries.findById(companyId);
    if (!updatedCompany) {
      throw new NotFoundError('Company not found');
    }

    return updatedCompany;
  }
}

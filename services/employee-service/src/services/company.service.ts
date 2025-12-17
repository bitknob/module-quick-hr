import { Company } from '../models/Company.model';
import { CompanyQueries } from '../queries/company.queries';
import { NotFoundError } from '@hrm/common';

export class CompanyService {
  static async getCompanyById(id: string): Promise<Company> {
    const company = await CompanyQueries.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    return company;
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


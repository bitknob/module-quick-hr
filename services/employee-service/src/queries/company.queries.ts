import { Company } from '../models/Company.model';

export class CompanyQueries {
  static async findAll(): Promise<Company[]> {
    return await Company.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
  }

  static async findById(id: string): Promise<Company | null> {
    return await Company.findByPk(id);
  }

  static async findByCode(code: string): Promise<Company | null> {
    return await Company.findOne({
      where: { code },
    });
  }

  static async create(data: {
    name: string;
    code: string;
    description?: string;
    hrbpId?: string;
  }): Promise<Company> {
    return await Company.create(data);
  }

  static async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      profileImageUrl?: string;
      hrbpId?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<[number]> {
    return await Company.update(data, {
      where: { id },
    });
  }

  static async delete(id: string): Promise<number> {
    return await Company.update(
      { status: 'inactive' },
      { where: { id } }
    );
  }
}


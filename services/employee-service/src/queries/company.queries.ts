import { Company } from '../models/Company.model';
import { Op } from 'sequelize';

export class CompanyQueries {
  static async findAll(options?: {
    searchTerm?: string;
    status?: string;
    limit?: number;
  }): Promise<Company[]> {
    const whereClause: any = {};
    
    // Handle status filter
    if (options?.status) {
      whereClause.status = options.status;
    }
    
    // Handle search term with case-insensitive matching and prioritization
    if (options?.searchTerm) {
      const searchTerm = options.searchTerm.trim();
      
      // Try exact case-sensitive match first
      const exactMatch = await Company.findOne({
        where: { 
          name: searchTerm,
          ...(options?.status && { status: options.status })
        }
      });
      
      if (exactMatch) {
        return [exactMatch]; // Return only the exact match
      }
      
      // If no exact match, try case-insensitive partial match
      whereClause.name = {
        [Op.iLike]: `%${searchTerm}%`
      };
    }
    
    const queryOptions: any = {
      where: whereClause,
      order: [['name', 'ASC']],
    };
    
    // Handle limit
    if (options?.limit && options.limit > 0) {
      queryOptions.limit = options.limit;
    }
    
    return await Company.findAll(queryOptions);
  }

  static async findById(id: string): Promise<Company | null> {
    return await Company.findByPk(id);
  }

  static async findByCode(code: string): Promise<Company | null> {
    return await Company.findOne({
      where: { code },
    });
  }

  static async findByName(name: string): Promise<Company | null> {
    return await Company.findOne({
      where: { name },
    });
  }

  static async create(data: {
    name: string;
    code: string;
    description?: string;
    hrbpId?: string;
    subscriptionStatus?: 'trial' | 'active' | 'inactive' | 'expired';
    subscriptionEndsAt?: Date;
  }): Promise<Company> {
    return await Company.create({
      ...data,
      status: 'active',
      subscriptionStatus: data.subscriptionStatus || 'trial',
    });
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
      subscriptionStatus?: 'trial' | 'active' | 'inactive' | 'expired';
      subscriptionEndsAt?: Date;
    }
  ): Promise<number> {
    const [affectedCount] = await Company.update(data, {
      where: { id },
    });
    return affectedCount;
  }

  static async delete(id: string): Promise<number> {
    const [affectedCount] = await Company.update({ status: 'inactive' }, { where: { id } });
    return affectedCount;
  }
}

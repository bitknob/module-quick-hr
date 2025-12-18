import { Department } from '../models/Department.model';

export class DepartmentQueries {
  static async findAll(companyId?: string): Promise<Department[]> {
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }
    return await Department.findAll({
      where,
      order: [['name', 'ASC']],
    });
  }

  static async findById(id: string, companyId?: string): Promise<Department | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    return await Department.findOne({ where });
  }

  static async findByName(name: string, companyId: string): Promise<Department | null> {
    return await Department.findOne({
      where: { name, companyId },
    });
  }

  static async create(data: {
    companyId: string;
    name: string;
    description?: string;
    headId?: string;
  }): Promise<Department> {
    return await Department.create(data);
  }

  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      headId?: string;
    }
  ): Promise<[number]> {
    return await Department.update(data, {
      where: { id },
    });
  }

  static async delete(id: string): Promise<number> {
    return await Department.destroy({
      where: { id },
    });
  }
}


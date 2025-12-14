import { Department } from '../models/Department.model';

export class DepartmentQueries {
  static async findAll(): Promise<Department[]> {
    return await Department.findAll({
      order: [['name', 'ASC']],
    });
  }

  static async findById(id: string): Promise<Department | null> {
    return await Department.findByPk(id);
  }

  static async findByName(name: string): Promise<Department | null> {
    return await Department.findOne({
      where: { name },
    });
  }

  static async create(data: {
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


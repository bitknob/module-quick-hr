import { Department } from '../models/Department.model';
import { Op } from 'sequelize';

export class DepartmentQueries {
  static async findAll(companyId?: string, includeSubDepartments: boolean = false): Promise<Department[]> {
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }
    const include: any[] = [];
    if (includeSubDepartments) {
      include.push({
        model: Department,
        as: 'subDepartments',
        required: false,
      });
      include.push({
        model: Department,
        as: 'parentDepartment',
        required: false,
      });
    }
    return await Department.findAll({
      where,
      include: include.length > 0 ? include : undefined,
      order: [['name', 'ASC']],
    });
  }

  static async findById(id: string, companyId?: string, includeSubDepartments: boolean = false): Promise<Department | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    const include: any[] = [];
    if (includeSubDepartments) {
      include.push({
        model: Department,
        as: 'subDepartments',
        required: false,
      });
      include.push({
        model: Department,
        as: 'parentDepartment',
        required: false,
      });
    }
    return await Department.findOne({
      where,
      include: include.length > 0 ? include : undefined,
    });
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
    parentDepartmentId?: string;
    hasSubDepartments?: boolean;
  }): Promise<Department> {
    const department = await Department.create(data);
    
    if (data.parentDepartmentId) {
      await Department.update(
        { hasSubDepartments: true },
        { where: { id: data.parentDepartmentId } }
      );
    }
    
    return department;
  }

  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      headId?: string;
      parentDepartmentId?: string;
      hasSubDepartments?: boolean;
    }
  ): Promise<[number]> {
    const oldDepartment = await Department.findByPk(id);
    const result = await Department.update(data, {
      where: { id },
    });
    
    if (data.parentDepartmentId && oldDepartment?.parentDepartmentId !== data.parentDepartmentId) {
      await Department.update(
        { hasSubDepartments: true },
        { where: { id: data.parentDepartmentId } }
      );
      
      if (oldDepartment?.parentDepartmentId) {
        const subDepartmentCount = await Department.count({
          where: { parentDepartmentId: oldDepartment.parentDepartmentId },
        });
        if (subDepartmentCount === 0) {
          await Department.update(
            { hasSubDepartments: false },
            { where: { id: oldDepartment.parentDepartmentId } }
          );
        }
      }
    }
    
    return result;
  }

  static async delete(id: string): Promise<number> {
    const department = await Department.findByPk(id);
    const result = await Department.destroy({
      where: { id },
    });
    
    if (department?.parentDepartmentId) {
      const subDepartmentCount = await Department.count({
        where: { parentDepartmentId: department.parentDepartmentId },
      });
      if (subDepartmentCount === 0) {
        await Department.update(
          { hasSubDepartments: false },
          { where: { id: department.parentDepartmentId } }
        );
      }
    }
    
    return result;
  }
  
  static async findSubDepartments(parentDepartmentId: string): Promise<Department[]> {
    return await Department.findAll({
      where: { parentDepartmentId },
      order: [['name', 'ASC']],
    });
  }
  
  static async findTopLevelDepartments(companyId: string): Promise<Department[]> {
    return await Department.findAll({
      where: {
        companyId,
        parentDepartmentId: {
          [Op.is]: null,
        },
      } as any,
      order: [['name', 'ASC']],
    });
  }
}


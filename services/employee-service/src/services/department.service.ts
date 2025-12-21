import { Department } from '../models/Department.model';
import { DepartmentQueries } from '../queries/department.queries';
import { NotFoundError, ConflictError } from '@hrm/common';

export class DepartmentService {
  static async createDepartment(data: {
    companyId: string;
    name: string;
    description?: string;
    headId?: string;
    parentDepartmentId?: string;
    hasSubDepartments?: boolean;
  }): Promise<Department> {
    const existingDepartment = await DepartmentQueries.findByName(data.name, data.companyId);
    if (existingDepartment) {
      throw new ConflictError('Department name already exists in this company');
    }

    if (data.parentDepartmentId) {
      const parentDepartment = await DepartmentQueries.findById(data.parentDepartmentId, data.companyId);
      if (!parentDepartment) {
        throw new NotFoundError('Parent department not found');
      }
      if (parentDepartment.companyId !== data.companyId) {
        throw new ConflictError('Parent department must belong to the same company');
      }
    }

    return await DepartmentQueries.create(data);
  }

  static async getAllDepartments(companyId?: string): Promise<Department[]> {
    return await DepartmentQueries.findAll(companyId);
  }

  static async getDepartmentById(id: string, companyId?: string): Promise<Department> {
    const department = await DepartmentQueries.findById(id, companyId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return department;
  }

  static async updateDepartment(
    id: string,
    data: {
      name?: string;
      description?: string;
      headId?: string;
      parentDepartmentId?: string;
      hasSubDepartments?: boolean;
    },
    companyId?: string
  ): Promise<Department> {
    const department = await DepartmentQueries.findById(id, companyId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    if (data.name && data.name !== department.name) {
      const existingDepartment = await DepartmentQueries.findByName(data.name, department.companyId);
      if (existingDepartment) {
        throw new ConflictError('Department name already exists in this company');
      }
    }

    if (data.parentDepartmentId) {
      if (data.parentDepartmentId === id) {
        throw new ConflictError('Department cannot be its own parent');
      }
      const parentDepartment = await DepartmentQueries.findById(data.parentDepartmentId, department.companyId);
      if (!parentDepartment) {
        throw new NotFoundError('Parent department not found');
      }
      if (parentDepartment.companyId !== department.companyId) {
        throw new ConflictError('Parent department must belong to the same company');
      }
    }

    await DepartmentQueries.update(id, data);
    const updatedDepartment = await DepartmentQueries.findById(id, companyId);
    if (!updatedDepartment) {
      throw new NotFoundError('Department not found');
    }

    return updatedDepartment;
  }
  
  static async getSubDepartments(parentDepartmentId: string, companyId?: string): Promise<Department[]> {
    const parentDepartment = await DepartmentQueries.findById(parentDepartmentId, companyId);
    if (!parentDepartment) {
      throw new NotFoundError('Parent department not found');
    }
    return await DepartmentQueries.findSubDepartments(parentDepartmentId);
  }
  
  static async getTopLevelDepartments(companyId: string): Promise<Department[]> {
    return await DepartmentQueries.findTopLevelDepartments(companyId);
  }

  static async deleteDepartment(id: string, companyId?: string): Promise<void> {
    const department = await DepartmentQueries.findById(id, companyId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    const affectedCount = await DepartmentQueries.delete(id);
    if (affectedCount === 0) {
      throw new NotFoundError('Department not found');
    }
  }
}


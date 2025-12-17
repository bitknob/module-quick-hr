import { QueryTypes, Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from '../models/Employee.model';
import { Company } from '../models/Company.model';

export interface HierarchyNode {
  employeeId: string;
  managerId?: string;
  level: number;
  path: string[];
}

export class EmployeeQueries {
  static async findById(id: string, companyId?: string): Promise<Employee | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    return await Employee.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });
  }

  static async findByEmployeeId(employeeId: string, companyId: string): Promise<Employee | null> {
    return await Employee.findOne({
      where: { employeeId, companyId },
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });
  }

  static async findByUserId(userId: string): Promise<Employee | null> {
    return await Employee.findOne({
      where: { userId },
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
    });
  }

  static async findDirectReports(managerId: string, companyId?: string): Promise<Employee[]> {
    const where: any = { managerId, status: 'active' };
    if (companyId) {
      where.companyId = companyId;
    }

    return await Employee.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'subordinates',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
    });
  }

  static async findAllSubordinates(managerId: string, companyId?: string): Promise<Employee[]> {
    const companyFilter = companyId ? 'AND e."companyId" = :companyId' : '';
    const query = `
      WITH RECURSIVE subordinates AS (
        SELECT id, "managerId", "companyId", "firstName", "lastName", email, "jobTitle", department, status
        FROM "Employees"
        WHERE "managerId" = :managerId AND status = 'active'
        ${companyId ? 'AND "companyId" = :companyId' : ''}
        
        UNION ALL
        
        SELECT e.id, e."managerId", e."companyId", e."firstName", e."lastName", e.email, e."jobTitle", e.department, e.status
        FROM "Employees" e
        INNER JOIN subordinates s ON e."managerId" = s.id
        WHERE e.status = 'active' ${companyFilter}
      )
      SELECT * FROM subordinates;
    `;

    return await sequelize.query(query, {
      replacements: companyId ? { managerId, companyId } : { managerId },
      type: QueryTypes.SELECT,
      model: Employee,
    }) as Employee[];
  }

  static async getHierarchyTree(rootId?: string): Promise<HierarchyNode[]> {
    const query = rootId
      ? `
        WITH RECURSIVE hierarchy AS (
          SELECT 
            id as "employeeId",
            "managerId",
            0 as level,
            ARRAY[id::text] as path
          FROM "Employees"
          WHERE id = :rootId AND status = 'active'
          
          UNION ALL
          
          SELECT 
            e.id as "employeeId",
            e."managerId",
            h.level + 1,
            h.path || e.id::text
          FROM "Employees" e
          INNER JOIN hierarchy h ON e."managerId" = h."employeeId"
          WHERE e.status = 'active' AND NOT (e.id::text = ANY(h.path))
        )
        SELECT * FROM hierarchy;
      `
      : `
        WITH RECURSIVE hierarchy AS (
          SELECT 
            id as "employeeId",
            "managerId",
            0 as level,
            ARRAY[id::text] as path
          FROM "Employees"
          WHERE "managerId" IS NULL AND status = 'active'
          
          UNION ALL
          
          SELECT 
            e.id as "employeeId",
            e."managerId",
            h.level + 1,
            h.path || e.id::text
          FROM "Employees" e
          INNER JOIN hierarchy h ON e."managerId" = h."employeeId"
          WHERE e.status = 'active' AND NOT (e.id::text = ANY(h.path))
        )
        SELECT * FROM hierarchy;
      `;

    return await sequelize.query(query, {
      replacements: rootId ? { rootId } : {},
      type: QueryTypes.SELECT,
    }) as HierarchyNode[];
  }

  static async checkCycle(employeeId: string, newManagerId: string): Promise<boolean> {
    const query = `
      WITH RECURSIVE path AS (
        SELECT id, "managerId", ARRAY[id::text] as visited
        FROM "Employees"
        WHERE id = :newManagerId
        
        UNION ALL
        
        SELECT e.id, e."managerId", p.visited || e.id::text
        FROM "Employees" e
        INNER JOIN path p ON e."managerId" = p.id
        WHERE NOT (e.id::text = ANY(p.visited))
      )
      SELECT EXISTS(SELECT 1 FROM path WHERE id = :employeeId) as has_cycle;
    `;

    const result = await sequelize.query(query, {
      replacements: { employeeId, newManagerId },
      type: QueryTypes.SELECT,
    });

    return (result[0] as any).has_cycle;
  }

  static async searchEmployees(
    filters: {
      companyId?: string;
      department?: string;
      jobTitle?: string;
      status?: string;
      searchTerm?: string;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ employees: Employee[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.jobTitle) {
      where.jobTitle = filters.jobTitle;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.searchTerm) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${filters.searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${filters.searchTerm}%` } },
        { email: { [Op.iLike]: `%${filters.searchTerm}%` } },
        { employeeId: { [Op.iLike]: `%${filters.searchTerm}%` } },
      ];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      employees: rows,
      total: count,
    };
  }

  static async getEmployeesByDepartment(department: string, companyId?: string): Promise<Employee[]> {
    const where: any = { department, status: 'active' };
    if (companyId) {
      where.companyId = companyId;
    }

    return await Employee.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });
  }

  static async updateManager(
    employeeId: string,
    newManagerId: string | null
  ): Promise<void> {
    await Employee.update(
      { managerId: newManagerId ?? undefined },
      { where: { id: employeeId } }
    );
  }
}


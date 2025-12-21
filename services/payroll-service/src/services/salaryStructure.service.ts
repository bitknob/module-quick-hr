import { SalaryStructure, PayrollComponent, EmployeeSalaryStructure } from '../models';
import { ComponentCategory } from '../models/PayrollComponent.model';
import { ConflictError, NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class SalaryStructureService {
  static async createSalaryStructure(data: {
    companyId: string;
    name: string;
    description?: string;
    components?: Array<{
      componentName: string;
      componentType: 'earning' | 'deduction';
      componentCategory: ComponentCategory;
      isPercentage: boolean;
      value: number;
      percentageOf?: string;
      isTaxable: boolean;
      isStatutory: boolean;
      priority: number;
    }>;
  }): Promise<SalaryStructure> {
    const existing = await SalaryStructure.findOne({
      where: {
        companyId: data.companyId,
        name: data.name,
      },
    });

    if (existing) {
      throw new ConflictError('Salary structure with this name already exists');
    }

    const structure = await SalaryStructure.create({
      id: uuidv4(),
      companyId: data.companyId,
      name: data.name,
      description: data.description,
      isActive: true,
    });

    if (data.components && data.components.length > 0) {
      const components = data.components.map((comp) => ({
        id: uuidv4(),
        salaryStructureId: structure.id,
        ...comp,
        isActive: true,
      }));

      await PayrollComponent.bulkCreate(components);
    }

    return await this.getSalaryStructureById(structure.id);
  }

  static async getSalaryStructureById(id: string): Promise<SalaryStructure> {
    const structure = await SalaryStructure.findByPk(id, {
      include: [
        {
          model: PayrollComponent,
          as: 'components',
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!structure) {
      throw new NotFoundError('Salary structure');
    }

    return structure;
  }

  static async updateSalaryStructure(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      isActive: boolean;
    }>
  ): Promise<SalaryStructure> {
    const structure = await SalaryStructure.findByPk(id);
    if (!structure) {
      throw new NotFoundError('Salary structure');
    }

    if (data.name && data.name !== structure.name) {
      const existing = await SalaryStructure.findOne({
        where: {
          companyId: structure.companyId,
          name: data.name,
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new ConflictError('Salary structure with this name already exists');
      }
    }

    await structure.update(data);
    return await this.getSalaryStructureById(id);
  }

  static async addComponent(
    salaryStructureId: string,
    componentData: {
      componentName: string;
      componentType: 'earning' | 'deduction';
      componentCategory: ComponentCategory;
      isPercentage: boolean;
      value: number;
      percentageOf?: string;
      isTaxable: boolean;
      isStatutory: boolean;
      priority: number;
    }
  ): Promise<PayrollComponent> {
    const structure = await SalaryStructure.findByPk(salaryStructureId);
    if (!structure) {
      throw new NotFoundError('Salary structure');
    }

    const component = await PayrollComponent.create({
      id: uuidv4(),
      salaryStructureId,
      ...componentData,
      isActive: true,
    });

    return component;
  }

  static async updateComponent(
    id: string,
    data: Partial<PayrollComponent>
  ): Promise<PayrollComponent> {
    const component = await PayrollComponent.findByPk(id);
    if (!component) {
      throw new NotFoundError('Payroll component');
    }

    await component.update(data);
    return component;
  }

  static async deleteComponent(id: string): Promise<void> {
    const component = await PayrollComponent.findByPk(id);
    if (!component) {
      throw new NotFoundError('Payroll component');
    }

    await component.update({ isActive: false });
  }

  static async getSalaryStructuresByCompany(companyId: string): Promise<SalaryStructure[]> {
    return await SalaryStructure.findAll({
      where: {
        companyId,
        isActive: true,
      },
      include: [
        {
          model: PayrollComponent,
          as: 'components',
          where: { isActive: true },
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  static async assignSalaryStructureToEmployee(data: {
    employeeId: string;
    companyId: string;
    salaryStructureId: string;
    ctc: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
  }): Promise<EmployeeSalaryStructure> {
    const structure = await SalaryStructure.findByPk(data.salaryStructureId);
    if (!structure) {
      throw new NotFoundError('Salary structure');
    }

    if (structure.companyId !== data.companyId) {
      throw new ValidationError('Salary structure does not belong to this company');
    }

    await EmployeeSalaryStructure.update(
      { isActive: false },
      {
        where: {
          employeeId: data.employeeId,
          isActive: true,
        },
      }
    );

    const employeeStructure = await EmployeeSalaryStructure.create({
      id: uuidv4(),
      ...data,
      isActive: true,
    });

    return employeeStructure;
  }

  static async getEmployeeSalaryStructure(employeeId: string): Promise<EmployeeSalaryStructure | null> {
    return await EmployeeSalaryStructure.findOne({
      where: {
        employeeId,
        isActive: true,
      },
      include: [
        {
          model: SalaryStructure,
          as: 'salaryStructure',
          include: [
            {
              model: PayrollComponent,
              as: 'components',
              where: { isActive: true },
              required: false,
            },
          ],
        },
      ],
    });
  }
}


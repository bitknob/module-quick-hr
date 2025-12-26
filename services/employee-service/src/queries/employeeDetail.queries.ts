import { EmployeeDetail } from '../models/EmployeeDetail.model';
import { Employee } from '../models/Employee.model';

export class EmployeeDetailQueries {
  static async findByEmployeeId(
    employeeId: string,
    companyId?: string
  ): Promise<EmployeeDetail | null> {
    const where: any = { employeeId };
    if (companyId) {
      where.companyId = companyId;
    }

    return await EmployeeDetail.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
    });
  }

  static async findByCompany(companyId: string): Promise<EmployeeDetail[]> {
    return await EmployeeDetail.findAll({
      where: { companyId },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
    });
  }
}


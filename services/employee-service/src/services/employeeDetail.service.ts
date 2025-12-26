import { EmployeeDetail } from '../models/EmployeeDetail.model';
import { EmployeeDetailQueries } from '../queries/employeeDetail.queries';
import { EmployeeQueries } from '../queries/employee.queries';
import { NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';

export class EmployeeDetailService {
  static async createOrUpdateDetail(
    employeeId: string,
    companyId: string,
    data: Partial<{
      emergencyContactName: string;
      emergencyContactPhone: string;
      emergencyContactRelation: string;
      bankAccountNumber: string;
      bankName: string;
      bankBranch: string;
      bankIFSC: string;
      panNumber: string;
      aadhaarNumber: string;
      passportNumber: string;
      drivingLicenseNumber: string;
      bloodGroup: string;
      maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
      spouseName: string;
      fatherName: string;
      motherName: string;
      permanentAddress: string;
      currentAddress: string;
      previousEmployer: string;
      previousDesignation: string;
      previousSalary: number;
      noticePeriod: number;
      skills: string[];
      languages: string[];
      additionalInfo: Record<string, any>;
    }>
  ): Promise<EmployeeDetail> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    if (employee.companyId !== companyId) {
      throw new ValidationError('Employee does not belong to the specified company');
    }

    const existing = await EmployeeDetailQueries.findByEmployeeId(employeeId, companyId);

    if (existing) {
      await EmployeeDetail.update(data as any, { where: { id: existing.id } });
      return await EmployeeDetailQueries.findByEmployeeId(employeeId, companyId) as EmployeeDetail;
    }

    return await EmployeeDetail.create({
      id: uuidv4(),
      employeeId,
      companyId,
      ...data,
    });
  }

  static async getDetailByEmployeeId(
    employeeId: string,
    companyId?: string
  ): Promise<EmployeeDetail> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    const detail = await EmployeeDetailQueries.findByEmployeeId(employeeId, companyId);
    if (!detail) {
      throw new NotFoundError('Employee detail');
    }

    return detail;
  }

  static async updateDetail(
    employeeId: string,
    companyId: string,
    data: Partial<{
      emergencyContactName: string;
      emergencyContactPhone: string;
      emergencyContactRelation: string;
      bankAccountNumber: string;
      bankName: string;
      bankBranch: string;
      bankIFSC: string;
      panNumber: string;
      aadhaarNumber: string;
      passportNumber: string;
      drivingLicenseNumber: string;
      bloodGroup: string;
      maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
      spouseName: string;
      fatherName: string;
      motherName: string;
      permanentAddress: string;
      currentAddress: string;
      previousEmployer: string;
      previousDesignation: string;
      previousSalary: number;
      noticePeriod: number;
      skills: string[];
      languages: string[];
      additionalInfo: Record<string, any>;
    }>
  ): Promise<EmployeeDetail> {
    return await this.createOrUpdateDetail(employeeId, companyId, data);
  }

  static async getDetailsByCompany(companyId: string): Promise<EmployeeDetail[]> {
    return await EmployeeDetailQueries.findByCompany(companyId);
  }
}


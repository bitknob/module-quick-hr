import { Employee } from '../models/Employee.model';
import { EmployeeQueries } from '../queries/employee.queries';
import { ConflictError, NotFoundError, ValidationError, UserRole } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export class EmployeeService {
  static async createEmployee(data: {
    userEmail: string;
    companyId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    userCompEmail: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    address?: string;
    jobTitle: string;
    department: string;
    managerId?: string;
    hireDate: Date;
    salary?: number;
  }): Promise<Employee> {
    // Check for duplicate userEmail first
    const existingUserEmail = await Employee.findOne({ where: { userEmail: data.userEmail } });
    if (existingUserEmail) {
      throw new ConflictError('An employee record already exists for this user email');
    }

    const existingEmployee = await EmployeeQueries.findByEmployeeId(
      data.employeeId,
      data.companyId
    );
    if (existingEmployee) {
      throw new ConflictError('Employee ID already exists in this company');
    }

    const existingEmail = await Employee.findOne({ where: { userCompEmail: data.userCompEmail } });
    if (existingEmail) {
      throw new ConflictError('Company email already exists');
    }

    // Normalize empty strings to null/undefined for optional fields
    const normalizedData = {
      ...data,
      managerId: data.managerId && data.managerId.trim() !== '' ? data.managerId : undefined,
      dateOfBirth:
        data.dateOfBirth && data.dateOfBirth.toString().trim() !== ''
          ? data.dateOfBirth
          : undefined,
    };

    if (normalizedData.managerId) {
      const manager = await EmployeeQueries.findById(
        normalizedData.managerId,
        normalizedData.companyId
      );
      if (!manager) {
        throw new NotFoundError('Manager');
      }

      if (manager.companyId !== normalizedData.companyId) {
        throw new ValidationError('Manager must be from the same company');
      }

      const hasCycle = await EmployeeQueries.checkCycle(
        normalizedData.managerId,
        normalizedData.managerId
      );
      if (hasCycle) {
        throw new ValidationError('Cannot assign manager: would create a cycle in hierarchy');
      }
    }

    return await Employee.create({
      id: uuidv4(),
      ...normalizedData,
      status: 'active',
    });
  }

  static async getEmployeeById(id: string, companyId?: string): Promise<Employee> {
    const employee = await EmployeeQueries.findById(id, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }
    return employee;
  }

  static async getEmployeeByUserEmail(userEmail: string): Promise<Employee> {
    const employee = await EmployeeQueries.findByUserEmail(userEmail);
    if (!employee) {
      throw new NotFoundError('Employee');
    }
    return employee;
  }

  static async getEmployeeByAnyEmail(email: string): Promise<Employee> {
    const employee = await EmployeeQueries.findByAnyEmail(email);
    if (!employee) {
      throw new NotFoundError('Employee');
    }
    return employee;
  }

  static async updateEmployee(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth: Date;
      address: string;
      jobTitle: string;
      department: string;
      managerId: string;
      salary: number;
      status: 'active' | 'inactive' | 'terminated';
    }>,
    companyId?: string
  ): Promise<Employee> {
    const employee = await EmployeeQueries.findById(id, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    // Normalize empty strings to null/undefined for optional fields
    const managerIdValue =
      data.managerId !== undefined
        ? data.managerId && data.managerId.toString().trim() !== ''
          ? data.managerId
          : null
        : undefined;

    // Build update object, excluding managerId from spread to handle it separately
    const { managerId, ...restData } = data;
    const updateData: Record<string, any> = { ...restData };

    // Handle managerId separately to support null values (Sequelize accepts null at runtime)
    if (managerIdValue !== undefined) {
      updateData.managerId = managerIdValue;
    }

    // Only validate manager if a new managerId is being set (not null/undefined)
    if (managerIdValue !== undefined && managerIdValue !== employee.managerId) {
      if (managerIdValue === null) {
        // Setting managerId to null is allowed (removing manager)
      } else if (managerIdValue === id) {
        throw new ValidationError('Employee cannot be their own manager');
      } else {
        const manager = await EmployeeQueries.findById(managerIdValue, employee.companyId);
        if (!manager) {
          throw new NotFoundError('Manager');
        }

        if (manager.companyId !== employee.companyId) {
          throw new ValidationError('Manager must be from the same company');
        }

        const hasCycle = await EmployeeQueries.checkCycle(id, managerIdValue);
        if (hasCycle) {
          throw new ValidationError('Cannot assign manager: would create a cycle in hierarchy');
        }
      }
    }

    await Employee.update(updateData as any, { where: { id } });
    return (await EmployeeQueries.findById(id, companyId)) as Employee;
  }

  static async deleteEmployee(id: string): Promise<void> {
    const employee = await EmployeeQueries.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    const subordinates = await EmployeeQueries.findDirectReports(id);
    if (subordinates.length > 0) {
      throw new ValidationError(
        'Cannot delete employee with direct reports. Reassign subordinates first.'
      );
    }

    await Employee.update({ status: 'terminated' }, { where: { id } });
  }

  static async getDirectReports(managerId: string, companyId?: string): Promise<Employee[]> {
    return await EmployeeQueries.findDirectReports(managerId, companyId);
  }

  static async getAllSubordinates(managerId: string, companyId?: string): Promise<Employee[]> {
    return await EmployeeQueries.findAllSubordinates(managerId, companyId);
  }

  static async getHierarchyTree(rootId?: string, companyId?: string) {
    return await EmployeeQueries.getHierarchyTree(rootId);
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
  ) {
    return await EmployeeQueries.searchEmployees(filters, page, limit);
  }

  static async getEmployeesByDepartment(
    department: string,
    companyId?: string
  ): Promise<Employee[]> {
    return await EmployeeQueries.getEmployeesByDepartment(department, companyId);
  }

  static async transferEmployee(
    employeeId: string,
    newManagerId: string | null
  ): Promise<Employee> {
    const employee = await EmployeeQueries.findById(employeeId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    if (newManagerId) {
      const manager = await EmployeeQueries.findById(newManagerId);
      if (!manager) {
        throw new NotFoundError('Manager');
      }

      if (newManagerId === employeeId) {
        throw new ValidationError('Employee cannot be their own manager');
      }

      const hasCycle = await EmployeeQueries.checkCycle(employeeId, newManagerId);
      if (hasCycle) {
        throw new ValidationError('Cannot assign manager: would create a cycle in hierarchy');
      }
    }

    await EmployeeQueries.updateManager(employeeId, newManagerId);
    return (await EmployeeQueries.findById(employeeId)) as Employee;
  }

  /**
   * Create a user account for an employee with a temporary password
   * Calls the auth service to create the user account
   * @param data - Employee user data
   * @returns Object with email and temporary password
   */
  static async createUserAccountForEmployee(
    data: {
      email: string;
      role?: UserRole;
      phoneNumber?: string;
      companyName?: string;
    },
    authToken?: string
  ): Promise<{ email: string; temporaryPassword: string }> {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:9400';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = authToken;
    }

    try {
      const response = await axios.post(
        `${authServiceUrl}/api/auth/create-user-for-employee`,
        {
          email: data.email,
          role: data.role || UserRole.EMPLOYEE,
          phoneNumber: data.phoneNumber,
          companyName: data.companyName,
        },
        {
          headers,
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data?.response?.temporaryPassword) {
        return {
          email: data.email,
          temporaryPassword: response.data.response.temporaryPassword,
        };
      }

      throw new Error('Failed to retrieve temporary password from auth service');
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('User account already exists');
      }
      if (error.response?.data?.header?.responseMessage) {
        throw new Error(error.response.data.header.responseMessage);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  static async bulkAssignManager(
    employeeIds: string[],
    newManagerId: string
  ): Promise<{ successCount: number; failureCount: number; errors: any[] }> {
    let successCount = 0;
    let failureCount = 0;
    const errors: any[] = [];

    // Check if manager exists
    const manager = await EmployeeQueries.findById(newManagerId);
    if (!manager) {
      throw new NotFoundError('Manager not found');
    }

    // Process each employee
    for (const employeeId of employeeIds) {
      try {
        // Validate basic rules
        if (employeeId === newManagerId) {
          throw new ValidationError('Employee cannot be their own manager');
        }

        const employee = await EmployeeQueries.findById(employeeId);
        if (!employee) {
          throw new NotFoundError(`Employee ${employeeId} not found`);
        }

        if (employee.companyId !== manager.companyId) {
          throw new ValidationError('Manager must be from the same company');
        }

        // Check for cycle
        const hasCycle = await EmployeeQueries.checkCycle(employeeId, newManagerId);
        if (hasCycle) {
          throw new ValidationError('Cannot assign manager: would create a cycle');
        }

        // Perform update
        await EmployeeQueries.updateManager(employeeId, newManagerId);
        successCount++;
      } catch (error: any) {
        failureCount++;
        errors.push({
          employeeId,
          error: error.message,
        });
      }
    }

    return { successCount, failureCount, errors };
  }

  static async getPotentialManagers(
    employeeId: string,
    companyId: string,
    searchTerm?: string
  ): Promise<Employee[]> {
    return await EmployeeQueries.getPotentialManagers(employeeId, companyId, searchTerm);
  }
}

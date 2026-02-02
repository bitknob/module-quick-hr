import { logger } from '@hrm/common';
import { EmailService } from './email.service';
import axios from 'axios';

export interface CompanyData {
  name: string;
  code: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  companyId?: string;
}

export interface EmployeeData {
  userId: string;
  companyId: string;
  department?: string;
  designation?: string;
  workLocation?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  dateOfJoining?: string;
  workEmail?: string;
  workPhone?: string;
}

export interface OnboardingResult {
  user: any;
  company: any;
  employee: any;
  token: string;
}

export class OnboardingService {
  private static readonly SERVICES = {
    AUTH: 'http://localhost:9401',
    EMPLOYEE: 'http://localhost:9402',
  };

  private static readonly HEADERS = {
    'Content-Type': 'application/json',
    'X-Internal-Service': 'payment-service',
  };

  /**
   * Create company via employee service
   */
  static async createCompany(companyData: CompanyData): Promise<any> {
    try {
      logger.info('Creating company:', companyData.name);
      
      const response = await axios.post(
        `${this.SERVICES.EMPLOYEE}/api/companies/onboarding`,
        companyData,
        { headers: this.HEADERS }
      );

      logger.info('Company created successfully:', response.data.response.id);
      return response.data.response;
    } catch (error: any) {
      logger.error('Failed to create company:', error.response?.data || error.message);
      
      // Return business-friendly error message
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          'Company with this code already exists. Please use a different company code.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create user via auth service
   */
  static async createUser(userData: UserData): Promise<{ user: any; token: string }> {
    try {
      logger.info('Creating user:', userData.email);
      
      const response = await axios.post(
        `${this.SERVICES.AUTH}/api/auth/signup`,
        userData,
        { headers: this.HEADERS }
      );

      logger.info('User created successfully:', response.data.response.user.id);
      return {
        user: response.data.response.user,
        token: response.data.response.token
      };
    } catch (error: any) {
      logger.error('Failed to create user:', error.response?.data || error.message);
      
      // Return business-friendly error message
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          'Email address is already registered. Please use a different email or try logging in.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create employee via employee service
   */
  static async createEmployee(
    employeeData: EmployeeData, 
    token: string, 
    userFirstName: string, 
    userLastName: string, 
    userEmail: string
  ): Promise<any> {
    try {
      logger.info('Creating employee for user:', employeeData.userId);
      
      const response = await axios.post(
        `${this.SERVICES.EMPLOYEE}/api/employees/onboarding`,
        {
          userId: employeeData.userId,
          companyId: employeeData.companyId,
          firstName: userFirstName,
          lastName: userLastName,
          userEmail: employeeData.workEmail || userEmail, // Use company email if available
          department: employeeData.department || 'Management',
          designation: employeeData.designation || 'Company Administrator',
          workLocation: employeeData.workLocation || 'Office',
          employmentType: employeeData.employmentType || 'full-time',
          dateOfJoining: employeeData.dateOfJoining || new Date().toISOString().split('T')[0],
          workEmail: employeeData.workEmail || userEmail,
          workPhone: employeeData.workPhone,
        },
        { 
          headers: {
            ...this.HEADERS,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      logger.info('Employee created successfully:', response.data.response.id);
      return response.data.response;
    } catch (error: any) {
      logger.error('Failed to create employee:', error.response?.data || error.message);
      
      // Return business-friendly error message
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          'Failed to create employee record. Please check the provided details and try again.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Assign admin role to user
   */
  static async assignAdminRole(userId: string, companyId: string, token: string): Promise<void> {
    try {
      logger.info('Assigning admin role to user:', userId);
      
      await axios.post(
        `${this.SERVICES.AUTH}/api/auth/assign-admin-role-onboarding`,
        {
          userId,
          companyId,
          roleName: 'company_admin',
        },
        { 
          headers: {
            ...this.HEADERS,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      logger.info('Admin role assigned successfully');
    } catch (error: any) {
      logger.error('Failed to assign role:', error.response?.data || error.message);
      // Don't fail the entire onboarding if role assignment fails
      logger.warn('Role assignment failed, but continuing with onboarding');
    }
  }

  /**
   * Get company details
   */
  static async getCompany(companyId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.SERVICES.EMPLOYEE}/api/companies/${companyId}`,
        { headers: this.HEADERS }
      );
      return response.data.response.company;
    } catch (error: any) {
      logger.error('Failed to fetch company details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Get users by company
   */
  static async getCompanyUsers(companyId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.SERVICES.AUTH}/api/auth/company/${companyId}/users`,
        { headers: this.HEADERS }
      );
      return response.data.response.users || [];
    } catch (error: any) {
      logger.error('Failed to fetch company users:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Complete full onboarding process
   */
  static async completeOnboarding(
    subscriptionId: number,
    companyData: CompanyData,
    userData: UserData,
    employeeData?: Partial<EmployeeData>
  ): Promise<OnboardingResult> {
    // Step 1: Create company
    const company = await this.createCompany(companyData);

    // Step 2: Create user with company reference
    const userResult = await this.createUser({
      ...userData,
      companyId: company.id
    });

    // Step 3: Create employee
    const employee = await this.createEmployee(
      {
        userId: userResult.user.id,
        companyId: company.id,
        department: employeeData?.department || 'Management',
        designation: employeeData?.designation || 'Company Administrator',
        workLocation: employeeData?.workLocation || 'Office',
        employmentType: employeeData?.employmentType || 'full-time',
        dateOfJoining: employeeData?.dateOfJoining || new Date().toISOString().split('T')[0],
        workEmail: employeeData?.workEmail || userData.email,
        workPhone: employeeData?.workPhone || userData.phone,
      },
      userResult.token,
      userData.firstName,
      userData.lastName,
      userData.email
    );

    // Step 4: Assign admin role
    await this.assignAdminRole(userResult.user.id, company.id, userResult.token);

    // Step 5: Send welcome email
    try {
      const welcomeEmailHtml = EmailService.createWelcomeEmailTemplate(
        userData,
        companyData
      );

      await EmailService.sendEmail({
        to: userData.email,
        subject: 'Welcome to HRM System - Your Company is Ready',
        html: welcomeEmailHtml
      });

      logger.info('Welcome email sent to:', userData.email);
    } catch (emailError) {
      logger.warn('Failed to send welcome email:', emailError);
      // Don't fail the onboarding if email fails
    }

    return {
      user: userResult.user,
      company,
      employee,
      token: userResult.token
    };
  }
}

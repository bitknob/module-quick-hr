import { Op } from 'sequelize';
import { UserRole, AccessControl } from '@hrm/common';
import { Employee, Company, Department } from '../models';

export interface SearchResult {
  type: 'employee' | 'company' | 'department' | 'menu';
  id: string;
  title: string;
  subtitle?: string;
  path?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export class SearchService {
  static async globalSearch(
    searchTerm: string,
    userRole: UserRole,
    userCompanyId?: string,
    limit: number = 10
  ): Promise<{
    results: SearchResult[];
    total: number;
    byType: {
      employees: number;
      companies: number;
      departments: number;
      menus: number;
    };
  }> {
    const results: SearchResult[] = [];
    const searchLower = searchTerm.toLowerCase().trim();

    if (!searchLower) {
      return {
        results: [],
        total: 0,
        byType: {
          employees: 0,
          companies: 0,
          departments: 0,
          menus: 0,
        },
      };
    }

    // Search Employees
    if (this.canSearchEmployees(userRole)) {
      const employeeLimit = Math.ceil(limit * 0.4); // 40% of results
      const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;

      const employees = await Employee.findAll({
        where: {
          ...(companyId && { companyId }),
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${searchLower}%` } },
            { lastName: { [Op.iLike]: `%${searchLower}%` } },
            { userCompEmail: { [Op.iLike]: `%${searchLower}%` } },
            { employeeId: { [Op.iLike]: `%${searchLower}%` } },
            { jobTitle: { [Op.iLike]: `%${searchLower}%` } },
            { department: { [Op.iLike]: `%${searchLower}%` } },
          ],
        },
        limit: employeeLimit,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id',
          'firstName',
          'lastName',
          'userCompEmail',
          'employeeId',
          'jobTitle',
          'department',
          'companyId',
        ],
      });

      employees.forEach((emp) => {
        const empData = emp.toJSON ? emp.toJSON() : emp;
        results.push({
          type: 'employee',
          id: empData.id,
          title: `${empData.firstName || ''} ${empData.lastName || ''}`.trim(),
          subtitle: `${empData.jobTitle || ''} • ${empData.department || ''}`,
          path: `/dashboard/employees/${empData.id}`,
          icon: 'user',
          metadata: {
            userCompEmail: empData.userCompEmail,
            employeeId: empData.employeeId,
            companyId: empData.companyId,
          },
        });
      });
    }

    // Search Companies
    if (this.canSearchCompanies(userRole)) {
      const companyLimit = Math.ceil(limit * 0.3); // 30% of results

      const companies = await Company.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchLower}%` } },
            { code: { [Op.iLike]: `%${searchLower}%` } },
            { description: { [Op.iLike]: `%${searchLower}%` } },
          ],
        },
        limit: companyLimit,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'code', 'description', 'status'],
      });

      companies.forEach((company) => {
        const companyData = company.toJSON ? company.toJSON() : company;

        // Skip if essential fields are missing
        if (!companyData.id || !companyData.name) {
          return;
        }

        results.push({
          type: 'company',
          id: companyData.id,
          title: companyData.name,
          subtitle: companyData.code
            ? `${companyData.code}${companyData.status === 'inactive' ? ' (Inactive)' : ''}`
            : companyData.status === 'inactive'
              ? '(Inactive)'
              : '',
          path: `/dashboard/companies/${companyData.id}`,
          icon: 'building',
          metadata: {
            code: companyData.code || null,
            description: companyData.description || null,
            status: companyData.status || 'active',
          },
        });
      });
    }

    // Search Departments
    if (this.canSearchDepartments(userRole)) {
      const departmentLimit = Math.ceil(limit * 0.2); // 20% of results
      const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;

      const departments = await Department.findAll({
        where: {
          ...(companyId && { companyId }),
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchLower}%` } },
            { description: { [Op.iLike]: `%${searchLower}%` } },
          ],
        },
        limit: departmentLimit,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'description', 'companyId'],
      });

      departments.forEach((dept) => {
        const deptData = dept.toJSON ? dept.toJSON() : dept;
        results.push({
          type: 'department',
          id: deptData.id,
          title: deptData.name || '',
          subtitle: deptData.description || undefined,
          path: `/dashboard/departments/${deptData.id}`,
          icon: 'sitemap',
          metadata: {
            companyId: deptData.companyId,
            description: deptData.description,
          },
        });
      });
    }

    // Search Menus (simplified - searches common menu items based on role)
    if (this.canSearchMenus(userRole)) {
      const menuLimit = Math.ceil(limit * 0.1); // 10% of results
      const menuItems = this.getMenuItemsForRole(userRole);

      const matchingMenus = menuItems
        .filter((menu) => {
          const matchesLabel = menu.label.toLowerCase().includes(searchLower);
          const matchesPath = menu.path.toLowerCase().includes(searchLower);
          return matchesLabel || matchesPath;
        })
        .slice(0, menuLimit)
        .map((menu) => ({
          type: 'menu' as const,
          id: menu.id,
          title: menu.label,
          subtitle: menu.path,
          path: menu.path,
          icon: menu.icon,
          metadata: {},
        }));

      results.push(...matchingMenus);
    }

    // Sort results by relevance (exact matches first, then partial)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchLower;
      const bExact = b.title.toLowerCase() === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = a.title.toLowerCase().startsWith(searchLower);
      const bStarts = b.title.toLowerCase().startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.title.localeCompare(b.title);
    });

    // Limit total results
    const limitedResults = results.slice(0, limit);

    return {
      results: limitedResults,
      total: limitedResults.length,
      byType: {
        employees: limitedResults.filter((r) => r.type === 'employee').length,
        companies: limitedResults.filter((r) => r.type === 'company').length,
        departments: limitedResults.filter((r) => r.type === 'department').length,
        menus: limitedResults.filter((r) => r.type === 'menu').length,
      },
    };
  }

  private static canSearchEmployees(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.PROVIDER_ADMIN,
      UserRole.PROVIDER_HR_STAFF,
      UserRole.HRBP,
      UserRole.COMPANY_ADMIN,
      UserRole.DEPARTMENT_HEAD,
      UserRole.MANAGER,
    ].includes(role);
  }

  private static canSearchCompanies(role: UserRole): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF].includes(
      role
    );
  }

  private static canSearchDepartments(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.PROVIDER_ADMIN,
      UserRole.PROVIDER_HR_STAFF,
      UserRole.HRBP,
      UserRole.COMPANY_ADMIN,
      UserRole.DEPARTMENT_HEAD,
      UserRole.MANAGER,
    ].includes(role);
  }

  private static canSearchMenus(role: UserRole): boolean {
    return true; // All authenticated users can search menus
  }

  private static getMenuItemsForRole(
    role: UserRole
  ): Array<{ id: string; label: string; path: string; icon?: string }> {
    const allMenus = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
      { id: 'companies', label: 'Companies', path: '/dashboard/companies', icon: 'building' },
      { id: 'employees', label: 'Employees', path: '/dashboard/employees', icon: 'users' },
      { id: 'departments', label: 'Departments', path: '/dashboard/departments', icon: 'sitemap' },
      { id: 'approvals', label: 'Approvals', path: '/dashboard/approvals', icon: 'check-circle' },
      { id: 'leave', label: 'Leave', path: '/dashboard/leave', icon: 'calendar' },
      { id: 'attendance', label: 'Attendance', path: '/dashboard/attendance', icon: 'clock' },
      { id: 'profile', label: 'Profile', path: '/dashboard/profile', icon: 'user' },
      { id: 'settings', label: 'Settings', path: '/dashboard/settings', icon: 'settings' },
    ];

    const roleMenus: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: [
        'dashboard',
        'companies',
        'employees',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
        'settings',
      ],
      [UserRole.PROVIDER_ADMIN]: [
        'dashboard',
        'companies',
        'employees',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
        'settings',
      ],
      [UserRole.PROVIDER_HR_STAFF]: [
        'dashboard',
        'companies',
        'employees',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
        'settings',
      ],
      [UserRole.HRBP]: [
        'dashboard',
        'employees',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
        'settings',
      ],
      [UserRole.COMPANY_ADMIN]: [
        'dashboard',
        'employees',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
        'settings',
      ],
      [UserRole.DEPARTMENT_HEAD]: [
        'dashboard',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
      ],
      [UserRole.MANAGER]: [
        'dashboard',
        'departments',
        'approvals',
        'leave',
        'attendance',
        'profile',
      ],
      [UserRole.EMPLOYEE]: ['dashboard', 'leave', 'attendance', 'profile'],
    };

    const allowedMenuIds = roleMenus[role] || [];
    return allMenus.filter((menu) => allowedMenuIds.includes(menu.id));
  }
}

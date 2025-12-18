import { UserRole } from '@hrm/common';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  roles: UserRole[];
}

export class MenuService {
  private static readonly ALL_MENU_ITEMS: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'home',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.DEPARTMENT_HEAD,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
      ],
    },
    {
      id: 'companies',
      label: 'Companies',
      path: '/dashboard/companies',
      icon: 'building',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
      ],
    },
    {
      id: 'employees',
      label: 'Employees',
      path: '/dashboard/employees',
      icon: 'users',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
      ],
      children: [
        {
          id: 'employees-list',
          label: 'All Employees',
          path: '/dashboard/employees',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
          ],
        },
        {
          id: 'employees-create',
          label: 'Create Employee',
          path: '/dashboard/employees/create',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
          ],
        },
      ],
    },
    {
      id: 'departments',
      label: 'Departments',
      path: '/dashboard/departments',
      icon: 'sitemap',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.DEPARTMENT_HEAD,
        UserRole.MANAGER,
      ],
    },
    {
      id: 'approvals',
      label: 'Approvals',
      path: '/dashboard/approvals',
      icon: 'check-circle',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.DEPARTMENT_HEAD,
        UserRole.MANAGER,
      ],
      children: [
        {
          id: 'approvals-pending',
          label: 'Pending Approvals',
          path: '/dashboard/approvals/pending',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
            UserRole.DEPARTMENT_HEAD,
            UserRole.MANAGER,
          ],
        },
        {
          id: 'approvals-all',
          label: 'All Approvals',
          path: '/dashboard/approvals',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
          ],
        },
      ],
    },
    {
      id: 'leave',
      label: 'Leave',
      path: '/dashboard/leave',
      icon: 'calendar',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.DEPARTMENT_HEAD,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
      ],
      children: [
        {
          id: 'leave-requests',
          label: 'My Leave Requests',
          path: '/dashboard/leave/requests',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
            UserRole.DEPARTMENT_HEAD,
            UserRole.MANAGER,
            UserRole.EMPLOYEE,
          ],
        },
        {
          id: 'leave-create',
          label: 'Request Leave',
          path: '/dashboard/leave/create',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
            UserRole.DEPARTMENT_HEAD,
            UserRole.MANAGER,
            UserRole.EMPLOYEE,
          ],
        },
        {
          id: 'leave-all',
          label: 'All Leave Requests',
          path: '/dashboard/leave',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
          ],
        },
      ],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      path: '/dashboard/attendance',
      icon: 'clock',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.DEPARTMENT_HEAD,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/dashboard/profile',
      icon: 'user',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.DEPARTMENT_HEAD,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/dashboard/settings',
      icon: 'settings',
      roles: [
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
      ],
      children: [
        {
          id: 'settings-general',
          label: 'General',
          path: '/dashboard/settings/general',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
            UserRole.PROVIDER_HR_STAFF,
            UserRole.HRBP,
            UserRole.COMPANY_ADMIN,
          ],
        },
        {
          id: 'settings-users',
          label: 'Users',
          path: '/dashboard/settings/users',
          roles: [
            UserRole.SUPER_ADMIN,
            UserRole.PROVIDER_ADMIN,
          ],
        },
      ],
    },
  ];

  static getMenuForRole(role: UserRole): MenuItem[] {
    return this.ALL_MENU_ITEMS
      .filter((item) => item.roles.includes(role))
      .map((item) => {
        const menuItem: MenuItem = {
          id: item.id,
          label: item.label,
          path: item.path,
          icon: item.icon,
          roles: item.roles,
        };

        if (item.children) {
          menuItem.children = item.children.filter((child) => child.roles.includes(role));
        }

        return menuItem;
      })
      .filter((item) => {
        if (item.children && item.children.length === 0) {
          return item.path !== undefined;
        }
        return true;
      });
  }
}


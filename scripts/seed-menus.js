const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbName = process.env.DB_NAME || 'quick_hr';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
});

const menus = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
    parentId: null,
    displayOrder: 1,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
  },
  {
    id: 'companies',
    label: 'Companies',
    path: '/dashboard/companies',
    icon: 'building',
    parentId: null,
    displayOrder: 2,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff'],
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/dashboard/employees',
    icon: 'users',
    parentId: null,
    displayOrder: 3,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
    children: [
      {
        id: 'employees-list',
        label: 'All Employees',
        path: '/dashboard/employees',
        parentId: 'employees',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'employees-create',
        label: 'Create Employee',
        path: '/dashboard/employees/create',
        parentId: 'employees',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'employees-documents',
        label: 'Employee Documents',
        path: '/dashboard/employees/documents',
        parentId: 'employees',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'employees-details',
        label: 'Employee Details',
        path: '/dashboard/employees/details',
        parentId: 'employees',
        displayOrder: 4,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
    ],
  },
  {
    id: 'departments',
    label: 'Departments',
    path: '/dashboard/departments',
    icon: 'sitemap',
    parentId: null,
    displayOrder: 4,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    path: '/dashboard/approvals',
    icon: 'check-circle',
    parentId: null,
    displayOrder: 5,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
    children: [
      {
        id: 'approvals-pending',
        label: 'Pending Approvals',
        path: '/dashboard/approvals/pending',
        parentId: 'approvals',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
      },
      {
        id: 'approvals-all',
        label: 'All Approvals',
        path: '/dashboard/approvals',
        parentId: 'approvals',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
    ],
  },
  {
    id: 'leave',
    label: 'Leave',
    path: '/dashboard/leave',
    icon: 'calendar',
    parentId: null,
    displayOrder: 6,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
    children: [
      {
        id: 'leave-requests',
        label: 'My Leave Requests',
        path: '/dashboard/leave/requests',
        parentId: 'leave',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'leave-create',
        label: 'Request Leave',
        path: '/dashboard/leave/create',
        parentId: 'leave',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'leave-pending-approval',
        label: 'Pending Approvals',
        path: '/dashboard/leave/pending',
        parentId: 'leave',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
      },
      {
        id: 'leave-all',
        label: 'All Leave Requests',
        path: '/dashboard/leave',
        parentId: 'leave',
        displayOrder: 4,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/dashboard/attendance',
    icon: 'clock',
    parentId: null,
    displayOrder: 7,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
    children: [
      {
        id: 'attendance-my',
        label: 'My Attendance',
        path: '/dashboard/attendance/my',
        parentId: 'attendance',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'attendance-checkin',
        label: 'Check In/Out',
        path: '/dashboard/attendance/checkin',
        parentId: 'attendance',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'attendance-all',
        label: 'All Attendance',
        path: '/dashboard/attendance',
        parentId: 'attendance',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
      },
      {
        id: 'attendance-stats',
        label: 'Attendance Statistics',
        path: '/dashboard/attendance/stats',
        parentId: 'attendance',
        displayOrder: 4,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    path: '/dashboard/documents',
    icon: 'file-text',
    parentId: null,
    displayOrder: 8,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
    children: [
      {
        id: 'documents-my',
        label: 'My Documents',
        path: '/dashboard/documents/my',
        parentId: 'documents',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'documents-upload',
        label: 'Upload Document',
        path: '/dashboard/documents/upload',
        parentId: 'documents',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
      },
      {
        id: 'documents-pending',
        label: 'Pending Verification',
        path: '/dashboard/documents/pending',
        parentId: 'documents',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
      },
      {
        id: 'documents-all',
        label: 'All Documents',
        path: '/dashboard/documents',
        parentId: 'documents',
        displayOrder: 4,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager'],
      },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: '/dashboard/payroll',
    icon: 'dollar-sign',
    parentId: null,
    displayOrder: 9,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'employee'],
    children: [
      {
        id: 'payroll-runs',
        label: 'Payroll Runs',
        path: '/dashboard/payroll/runs',
        parentId: 'payroll',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'payroll-payslips',
        label: 'Payslips',
        path: '/dashboard/payroll/payslips',
        parentId: 'payroll',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'employee'],
      },
      {
        id: 'payroll-salary-structures',
        label: 'Salary Structures',
        path: '/dashboard/payroll/salary-structures',
        parentId: 'payroll',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'payroll-tax-configuration',
        label: 'Tax Configuration',
        path: '/dashboard/payroll/tax-configuration',
        parentId: 'payroll',
        displayOrder: 4,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'payroll-variable-pay',
        label: 'Variable Pay',
        path: '/dashboard/payroll/variable-pay',
        parentId: 'payroll',
        displayOrder: 5,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'payroll-arrears',
        label: 'Arrears',
        path: '/dashboard/payroll/arrears',
        parentId: 'payroll',
        displayOrder: 6,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'payroll-loans',
        label: 'Loans',
        path: '/dashboard/payroll/loans',
        parentId: 'payroll',
        displayOrder: 7,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'employee'],
      },
      {
        id: 'payroll-reimbursements',
        label: 'Reimbursements',
        path: '/dashboard/payroll/reimbursements',
        parentId: 'payroll',
        displayOrder: 8,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'employee'],
      },
      {
        id: 'payroll-tax-declarations',
        label: 'Tax Declarations',
        path: '/dashboard/payroll/tax-declarations',
        parentId: 'payroll',
        displayOrder: 9,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'employee'],
      },
      {
        id: 'payroll-payslip-templates',
        label: 'Payslip Templates',
        path: '/dashboard/payroll/payslip-templates',
        parentId: 'payroll',
        displayOrder: 10,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'payroll-payslip-schedules',
        label: 'Payslip Schedules',
        path: '/dashboard/payroll/payslip-schedules',
        parentId: 'payroll',
        displayOrder: 11,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/dashboard/profile',
    icon: 'user',
    parentId: null,
    displayOrder: 10,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    icon: 'settings',
    parentId: null,
    displayOrder: 11,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
    children: [
      {
        id: 'settings-general',
        label: 'General',
        path: '/dashboard/settings/general',
        parentId: 'settings',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin'],
      },
      {
        id: 'settings-users',
        label: 'Users',
        path: '/dashboard/settings/users',
        parentId: 'settings',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin'],
      },
      {
        id: 'settings-roles',
        label: 'Role Management',
        path: '/dashboard/settings/roles',
        parentId: 'settings',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin'],
      },
    ],
  },
  {
    id: 'roles',
    label: 'Roles',
    path: '/dashboard/roles',
    icon: 'shield',
    parentId: null,
    displayOrder: 12,
    roles: ['super_admin', 'provider_admin', 'provider_hr_staff'],
    children: [
      {
        id: 'roles-list',
        label: 'All Roles',
        path: '/dashboard/roles',
        parentId: 'roles',
        displayOrder: 1,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff'],
      },
      {
        id: 'roles-create',
        label: 'Create Role',
        path: '/dashboard/roles/create',
        parentId: 'roles',
        displayOrder: 2,
        roles: ['super_admin', 'provider_admin'],
      },
      {
        id: 'roles-hierarchy',
        label: 'Role Hierarchy',
        path: '/dashboard/roles/hierarchy',
        parentId: 'roles',
        displayOrder: 3,
        roles: ['super_admin', 'provider_admin', 'provider_hr_staff'],
      },
    ],
  },
];

async function seedMenus() {
  const client = await pool.connect();
  try {
    console.log('Starting menu seeding...');
    await client.query('BEGIN');

    for (const menu of menus) {
      const { children, roles, ...menuData } = menu;
      
      await client.query(
        `INSERT INTO "Menus" (id, label, path, icon, "parentId", "displayOrder", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           label = EXCLUDED.label,
           path = EXCLUDED.path,
           icon = EXCLUDED.icon,
           "parentId" = EXCLUDED."parentId",
           "displayOrder" = EXCLUDED."displayOrder",
           "isActive" = EXCLUDED."isActive"`,
        [
          menuData.id,
          menuData.label,
          menuData.path,
          menuData.icon || null,
          menuData.parentId || null,
          menuData.displayOrder || 0,
          true,
        ]
      );

      for (const roleKey of roles) {
        await client.query(
          `INSERT INTO "MenuRoles" ("menuId", "roleKey")
           VALUES ($1, $2)
           ON CONFLICT ("menuId", "roleKey") DO NOTHING`,
          [menuData.id, roleKey]
        );
      }

      if (children) {
        for (const child of children) {
          const { roles: childRoles, ...childData } = child;
          
          await client.query(
            `INSERT INTO "Menus" (id, label, path, icon, "parentId", "displayOrder", "isActive")
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               label = EXCLUDED.label,
               path = EXCLUDED.path,
               icon = EXCLUDED.icon,
               "parentId" = EXCLUDED."parentId",
               "displayOrder" = EXCLUDED."displayOrder",
               "isActive" = EXCLUDED."isActive"`,
            [
              childData.id,
              childData.label,
              childData.path,
              null,
              childData.parentId || null,
              childData.displayOrder || 0,
              true,
            ]
          );

          for (const roleKey of childRoles) {
            await client.query(
              `INSERT INTO "MenuRoles" ("menuId", "roleKey")
               VALUES ($1, $2)
               ON CONFLICT ("menuId", "roleKey") DO NOTHING`,
              [childData.id, roleKey]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Menu seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Menu seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedMenus().catch((error) => {
  console.error('Menu seeding process failed:', error);
  process.exit(1);
});


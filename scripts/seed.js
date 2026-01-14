const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'quick_hr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const SALT_ROUNDS = 12;

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting database seeding...');

    await client.query('BEGIN');

    // Optionally create super_admin user first
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    let superAdminUserId = null;

    if (superAdminEmail && superAdminPassword) {
      const existingUser = await client.query('SELECT id FROM "Users" WHERE email = $1', [
        superAdminEmail.toLowerCase().trim(),
      ]);

      if (existingUser.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(superAdminPassword, SALT_ROUNDS);
        const result = await client.query(
          `INSERT INTO "Users" (id, email, password, role, "emailVerified", "isActive", "createdAt", "updatedAt")
           VALUES (uuid_generate_v4(), $1, $2, 'super_admin', true, true, NOW(), NOW())
           RETURNING id`,
          [superAdminEmail.toLowerCase().trim(), hashedPassword]
        );
        superAdminUserId = result.rows[0].id;
        console.log(`Super admin user created: ${superAdminEmail}`);
      } else {
        superAdminUserId = existingUser.rows[0].id;
        console.log(`Super admin user already exists: ${superAdminEmail}`);
      }
    } else {
      console.log(
        'Skipping super_admin creation (SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD not set)'
      );
      console.log(
        'To create a super_admin user, set these environment variables and run seed again.'
      );
    }

    // Create Quick HR company first (for super admin)
    let quickHrCompanyId = null;
    const quickHrCompany = await client.query('SELECT id FROM "Companies" WHERE code = $1', [
      'QUICKHR',
    ]);

    if (quickHrCompany.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO "Companies" (id, name, code, description, status, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, $3, 'active', NOW(), NOW())
         RETURNING id`,
        ['Quick HR', 'QUICKHR', 'Quick HR - HRM Platform Provider']
      );
      quickHrCompanyId = result.rows[0].id;
      console.log('Quick HR company created');
    } else {
      quickHrCompanyId = quickHrCompany.rows[0].id;
      console.log('Quick HR company already exists');
    }

    // Create employee record for super admin if user was created
    if (superAdminUserId && quickHrCompanyId) {
      const existingSuperAdminEmployee = await client.query(
        'SELECT id FROM "Employees" WHERE "userEmail" = $1',
        [superAdminEmail.toLowerCase().trim()]
      );

      if (existingSuperAdminEmployee.rows.length === 0) {
        await client.query(
          `INSERT INTO "Employees" (id, "userEmail", "companyId", "employeeId", "firstName", "lastName", "userCompEmail", 
           "jobTitle", department, "hireDate", status, role, "createdAt", "updatedAt")
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', 'super_admin', NOW(), NOW())`,
          [
            superAdminEmail.toLowerCase().trim(),
            quickHrCompanyId,
            'EMP-ADMIN-001',
            'Super',
            'Admin',
            superAdminEmail.toLowerCase().trim(),
            'System Administrator',
            'Administration',
            new Date('2020-01-01'),
          ]
        );
        console.log(`Super admin employee record created for Quick HR company`);
      } else {
        console.log(`Super admin employee record already exists`);
      }
    }

    // Seed companies
    const companies = [
      { name: 'Acme Corporation', code: 'ACME001', description: 'Leading technology company' },
      { name: 'Tech Solutions Inc', code: 'TECH001', description: 'Technology consulting firm' },
      {
        name: 'Global Industries',
        code: 'GLOB001',
        description: 'International business solutions',
      },
    ];

    const companyIds = [];
    for (const company of companies) {
      const existingCompany = await client.query('SELECT id FROM "Companies" WHERE code = $1', [
        company.code,
      ]);

      if (existingCompany.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO "Companies" (id, name, code, description, status, "createdAt", "updatedAt")
           VALUES (uuid_generate_v4(), $1, $2, $3, 'active', NOW(), NOW())
           RETURNING id`,
          [company.name, company.code, company.description]
        );
        companyIds.push(result.rows[0].id);
        console.log(`Company created: ${company.name}`);
      } else {
        companyIds.push(existingCompany.rows[0].id);
        console.log(`Company already exists: ${company.name}`);
      }
    }

    console.log('Seeded companies successfully!');

    // Seed departments for each company
    const departmentTemplates = [
      { name: 'Engineering', description: 'Software Development and Engineering' },
      { name: 'Human Resources', description: 'HR Management and Operations' },
      { name: 'Finance', description: 'Financial Planning and Accounting' },
      { name: 'Sales', description: 'Sales and Business Development' },
      { name: 'Marketing', description: 'Marketing and Communications' },
    ];

    for (const companyId of companyIds) {
      for (const dept of departmentTemplates) {
        const existingDept = await client.query(
          'SELECT id FROM "Departments" WHERE "companyId" = $1 AND name = $2',
          [companyId, dept.name]
        );

        if (existingDept.rows.length === 0) {
          await client.query(
            `INSERT INTO "Departments" (id, "companyId", name, description, "createdAt", "updatedAt")
             VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())`,
            [companyId, dept.name, dept.description]
          );
        }
      }
    }

    console.log(`Seeded departments successfully for ${companyIds.length} companies!`);

    // Helper function to get or create user and return user ID
    const getOrCreateUser = async (email, password, role) => {
      const existingUser = await client.query('SELECT id FROM "Users" WHERE email = $1', [
        email.toLowerCase().trim(),
      ]);

      if (existingUser.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await client.query(
          `INSERT INTO "Users" (id, email, password, role, "emailVerified", "isActive", "createdAt", "updatedAt")
           VALUES (uuid_generate_v4(), $1, $2, $3, true, true, NOW(), NOW())
           RETURNING id`,
          [email.toLowerCase().trim(), hashedPassword, role]
        );
        console.log(`Test user created: ${email} (${role})`);
        return result.rows[0].id;
      } else {
        console.log(`Test user already exists: ${email}`);
        return existingUser.rows[0].id;
      }
    };

    // Helper function to get department ID by company and name
    const getDepartmentId = async (companyId, departmentName) => {
      const result = await client.query(
        'SELECT id FROM "Departments" WHERE "companyId" = $1 AND name = $2',
        [companyId, departmentName]
      );
      return result.rows.length > 0 ? result.rows[0].id : null;
    };

    // Helper function to get or create employee and return employee record
    const getOrCreateEmployee = async (employeeData) => {
      const existingEmployee = await client.query(
        'SELECT id FROM "Employees" WHERE "userEmail" = $1',
        [employeeData.userEmail]
      );

      if (existingEmployee.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO "Employees" (id, "userEmail", "companyId", "employeeId", "firstName", "lastName", "userCompEmail", "phoneNumber", 
           "jobTitle", department, "hireDate", status, "createdAt", "updatedAt")
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', NOW(), NOW())
           RETURNING id`,
          [
            employeeData.userEmail,
            employeeData.companyId,
            employeeData.employeeId,
            employeeData.firstName,
            employeeData.lastName,
            employeeData.userCompEmail,
            employeeData.phoneNumber || null,
            employeeData.jobTitle,
            employeeData.department,
            employeeData.hireDate,
          ]
        );
        console.log(
          `Employee created: ${employeeData.firstName} ${employeeData.lastName} (${employeeData.employeeId})`
        );
        return result.rows[0].id;
      } else {
        const existing = await client.query('SELECT id FROM "Employees" WHERE "userEmail" = $1', [
          employeeData.userEmail,
        ]);
        console.log(`Employee already exists: ${employeeData.firstName} ${employeeData.lastName}`);
        return existing.rows[0].id;
      }
    };

    // Create test users and employees if SEED_TEST_USERS environment variable is set
    if (process.env.SEED_TEST_USERS === 'true') {
      console.log('Creating test users and employees...');

      // Get first company for role-based assignments
      const firstCompanyId = companyIds[0];
      const secondCompanyId = companyIds.length > 1 ? companyIds[1] : companyIds[0];

      // Create provider-level users (can access all companies)
      const providerAdminUserId = await getOrCreateUser(
        'provider.admin@quickhr.com',
        'Test123!@#',
        'provider_admin'
      );
      const providerHrStaffUserId = await getOrCreateUser(
        'provider.hr.staff@quickhr.com',
        'Test123!@#',
        'provider_hr_staff'
      );

      // Create HRBP user (assigned to first company)
      const hrbpUserId = await getOrCreateUser('hrbp@quickhr.com', 'Test123!@#', 'hrbp');

      // Create company admin user (assigned to first company)
      const companyAdminUserId = await getOrCreateUser(
        'company.admin@quickhr.com',
        'Test123!@#',
        'company_admin'
      );

      // Create department head user (assigned to first company, Engineering department)
      const departmentHeadUserId = await getOrCreateUser(
        'department.head@quickhr.com',
        'Test123!@#',
        'department_head'
      );

      // Create manager user (assigned to first company, Engineering department)
      const managerUserId = await getOrCreateUser('manager@quickhr.com', 'Test123!@#', 'manager');

      // Create employee user (assigned to first company, Engineering department)
      const employeeUserId = await getOrCreateUser(
        'employee@quickhr.com',
        'Test123!@#',
        'employee'
      );

      console.log('Test users created successfully!');

      // Create Employee records for all users
      console.log('Creating employee records...');

      // Provider Admin - assigned to first company (but can access all)
      const providerAdminEmployeeId = await getOrCreateEmployee({
        userEmail: 'provider.admin@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-PA-001',
        firstName: 'Provider',
        lastName: 'Admin',
        userCompEmail: 'provider.admin@quickhr.com',
        jobTitle: 'Provider Administrator',
        department: 'Human Resources',
        hireDate: new Date('2020-01-01'),
      });

      // Provider HR Staff - assigned to first company (but can access all)
      const providerHrStaffEmployeeId = await getOrCreateEmployee({
        userEmail: 'provider.hr.staff@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-PHS-001',
        firstName: 'Provider',
        lastName: 'HR Staff',
        userCompEmail: 'provider.hr.staff@quickhr.com',
        jobTitle: 'HR Staff',
        department: 'Human Resources',
        hireDate: new Date('2020-02-01'),
      });

      // HRBP - assigned to first company
      const hrbpEmployeeId = await getOrCreateEmployee({
        userEmail: 'hrbp@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-HRBP-001',
        firstName: 'HR',
        lastName: 'Business Partner',
        userCompEmail: 'hrbp@quickhr.com',
        jobTitle: 'HR Business Partner',
        department: 'Human Resources',
        hireDate: new Date('2020-03-01'),
      });

      // Company Admin - assigned to first company
      const companyAdminEmployeeId = await getOrCreateEmployee({
        userEmail: 'company.admin@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-CA-001',
        firstName: 'Company',
        lastName: 'Administrator',
        userCompEmail: 'company.admin@quickhr.com',
        jobTitle: 'Company Administrator',
        department: 'Human Resources',
        hireDate: new Date('2020-04-01'),
      });

      // Department Head - assigned to first company, Engineering department
      const departmentHeadEmployeeId = await getOrCreateEmployee({
        userEmail: 'department.head@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-DH-001',
        firstName: 'Department',
        lastName: 'Head',
        userCompEmail: 'department.head@quickhr.com',
        jobTitle: 'Engineering Director',
        department: 'Engineering',
        hireDate: new Date('2020-05-01'),
      });

      // Manager - assigned to first company, Engineering department, reports to Department Head
      const managerEmployeeId = await getOrCreateEmployee({
        userEmail: 'manager@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-MGR-001',
        firstName: 'Manager',
        lastName: 'User',
        userCompEmail: 'manager@quickhr.com',
        jobTitle: 'Engineering Manager',
        department: 'Engineering',
        hireDate: new Date('2020-06-01'),
      });

      // Employee - assigned to first company, Engineering department, reports to Manager
      const employeeEmployeeId = await getOrCreateEmployee({
        userEmail: 'employee@quickhr.com',
        companyId: firstCompanyId,
        employeeId: 'EMP-EMP-001',
        firstName: 'Employee',
        lastName: 'User',
        userCompEmail: 'employee@quickhr.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        hireDate: new Date('2020-07-01'),
      });

      console.log('Employee records created successfully!');

      // Update manager relationships
      console.log('Setting up manager hierarchy...');

      // Set manager for manager user (reports to department head)
      await client.query('UPDATE "Employees" SET "managerId" = $1 WHERE id = $2', [
        departmentHeadEmployeeId,
        managerEmployeeId,
      ]);
      console.log('Manager assigned to Department Head');

      // Set manager for employee user (reports to manager)
      await client.query('UPDATE "Employees" SET "managerId" = $1 WHERE id = $2', [
        managerEmployeeId,
        employeeEmployeeId,
      ]);
      console.log('Employee assigned to Manager');

      // Assign HRBP to first company
      console.log('Assigning HRBP to company...');
      await client.query('UPDATE "Companies" SET "hrbpId" = $1 WHERE id = $2', [
        hrbpEmployeeId,
        firstCompanyId,
      ]);
      console.log('HRBP assigned to company');

      // Set department heads
      console.log('Setting department heads...');
      const engineeringDeptId = await getDepartmentId(firstCompanyId, 'Engineering');
      if (engineeringDeptId) {
        await client.query('UPDATE "Departments" SET "headId" = $1 WHERE id = $2', [
          departmentHeadEmployeeId,
          engineeringDeptId,
        ]);
        console.log('Department Head assigned to Engineering department');
      }

      // Create additional employees for second company if it exists
      if (companyIds.length > 1) {
        console.log('Creating employees for second company...');

        // Create HRBP for second company
        const hrbp2UserId = await getOrCreateUser('hrbp2@quickhr.com', 'Test123!@#', 'hrbp');
        const hrbp2EmployeeId = await getOrCreateEmployee({
          userEmail: 'hrbp2@quickhr.com',
          companyId: secondCompanyId,
          employeeId: 'EMP-HRBP-002',
          firstName: 'HRBP',
          lastName: 'Second',
          userCompEmail: 'hrbp2@quickhr.com',
          jobTitle: 'HR Business Partner',
          department: 'Human Resources',
          hireDate: new Date('2020-08-01'),
        });

        // Assign HRBP to second company
        await client.query('UPDATE "Companies" SET "hrbpId" = $1 WHERE id = $2', [
          hrbp2EmployeeId,
          secondCompanyId,
        ]);
        console.log('HRBP assigned to second company');

        // Create company admin for second company
        const companyAdmin2UserId = await getOrCreateUser(
          'company.admin2@quickhr.com',
          'Test123!@#',
          'company_admin'
        );
        await getOrCreateEmployee({
          userEmail: 'company.admin2@quickhr.com',
          companyId: secondCompanyId,
          employeeId: 'EMP-CA-002',
          firstName: 'Company',
          lastName: 'Admin Two',
          userCompEmail: 'company.admin2@quickhr.com',
          jobTitle: 'Company Administrator',
          department: 'Human Resources',
          hireDate: new Date('2020-09-01'),
        });

        // Create department head for second company
        const deptHead2UserId = await getOrCreateUser(
          'department.head2@quickhr.com',
          'Test123!@#',
          'department_head'
        );
        const deptHead2EmployeeId = await getOrCreateEmployee({
          userEmail: 'department.head2@quickhr.com',
          companyId: secondCompanyId,
          employeeId: 'EMP-DH-002',
          firstName: 'Department',
          lastName: 'Head Two',
          userCompEmail: 'department.head2@quickhr.com',
          jobTitle: 'Sales Director',
          department: 'Sales',
          hireDate: new Date('2020-10-01'),
        });

        // Set department head for Sales department in second company
        const salesDeptId = await getDepartmentId(secondCompanyId, 'Sales');
        if (salesDeptId) {
          await client.query('UPDATE "Departments" SET "headId" = $1 WHERE id = $2', [
            deptHead2EmployeeId,
            salesDeptId,
          ]);
          console.log('Department Head assigned to Sales department in second company');
        }

        // Create manager for second company
        const manager2UserId = await getOrCreateUser(
          'manager2@quickhr.com',
          'Test123!@#',
          'manager'
        );
        const manager2EmployeeId = await getOrCreateEmployee({
          userEmail: 'manager2@quickhr.com',
          companyId: secondCompanyId,
          employeeId: 'EMP-MGR-002',
          firstName: 'Manager',
          lastName: 'Two',
          userCompEmail: 'manager2@quickhr.com',
          jobTitle: 'Sales Manager',
          department: 'Sales',
          hireDate: new Date('2020-11-01'),
        });

        // Set manager relationship
        await client.query('UPDATE "Employees" SET "managerId" = $1 WHERE id = $2', [
          deptHead2EmployeeId,
          manager2EmployeeId,
        ]);

        // Create employee for second company
        const employee2UserId = await getOrCreateUser(
          'employee2@quickhr.com',
          'Test123!@#',
          'employee'
        );
        const employee2EmployeeId = await getOrCreateEmployee({
          userEmail: 'employee2@quickhr.com',
          companyId: secondCompanyId,
          employeeId: 'EMP-EMP-002',
          firstName: 'Employee',
          lastName: 'Two',
          userCompEmail: 'employee2@quickhr.com',
          jobTitle: 'Sales Representative',
          department: 'Sales',
          hireDate: new Date('2020-12-01'),
        });

        // Set employee manager relationship
        await client.query('UPDATE "Employees" SET "managerId" = $1 WHERE id = $2', [
          manager2EmployeeId,
          employee2EmployeeId,
        ]);

        console.log('Employees for second company created successfully!');
      }

      // Create additional employees for third company if it exists
      if (companyIds.length > 2) {
        console.log('Creating employees for third company...');

        const thirdCompanyId = companyIds[2];

        // Create HRBP for third company
        const hrbp3UserId = await getOrCreateUser('hrbp3@quickhr.com', 'Test123!@#', 'hrbp');
        const hrbp3EmployeeId = await getOrCreateEmployee({
          userEmail: 'hrbp3@quickhr.com',
          companyId: thirdCompanyId,
          employeeId: 'EMP-HRBP-003',
          firstName: 'HRBP',
          lastName: 'Third',
          userCompEmail: 'hrbp3@quickhr.com',
          jobTitle: 'HR Business Partner',
          department: 'Human Resources',
          hireDate: new Date('2021-01-01'),
        });

        // Assign HRBP to third company
        await client.query('UPDATE "Companies" SET "hrbpId" = $1 WHERE id = $2', [
          hrbp3EmployeeId,
          thirdCompanyId,
        ]);
        console.log('HRBP assigned to third company');

        // Create company admin for third company
        const companyAdmin3UserId = await getOrCreateUser(
          'company.admin3@quickhr.com',
          'Test123!@#',
          'company_admin'
        );
        await getOrCreateEmployee({
          userEmail: 'company.admin3@quickhr.com',
          companyId: thirdCompanyId,
          employeeId: 'EMP-CA-003',
          firstName: 'Company',
          lastName: 'Admin Three',
          userCompEmail: 'company.admin3@quickhr.com',
          jobTitle: 'Company Administrator',
          department: 'Human Resources',
          hireDate: new Date('2021-02-01'),
        });

        // Create department head for third company
        const deptHead3UserId = await getOrCreateUser(
          'department.head3@quickhr.com',
          'Test123!@#',
          'department_head'
        );
        const deptHead3EmployeeId = await getOrCreateEmployee({
          userEmail: 'department.head3@quickhr.com',
          companyId: thirdCompanyId,
          employeeId: 'EMP-DH-003',
          firstName: 'Department',
          lastName: 'Head Three',
          userCompEmail: 'department.head3@quickhr.com',
          jobTitle: 'Finance Director',
          department: 'Finance',
          hireDate: new Date('2021-03-01'),
        });

        // Set department head for Finance department in third company
        const financeDeptId = await getDepartmentId(thirdCompanyId, 'Finance');
        if (financeDeptId) {
          await client.query('UPDATE "Departments" SET "headId" = $1 WHERE id = $2', [
            deptHead3EmployeeId,
            financeDeptId,
          ]);
          console.log('Department Head assigned to Finance department in third company');
        }

        // Create manager for third company
        const manager3UserId = await getOrCreateUser(
          'manager3@quickhr.com',
          'Test123!@#',
          'manager'
        );
        const manager3EmployeeId = await getOrCreateEmployee({
          userEmail: 'manager3@quickhr.com',
          companyId: thirdCompanyId,
          employeeId: 'EMP-MGR-003',
          firstName: 'Manager',
          lastName: 'Three',
          userCompEmail: 'manager3@quickhr.com',
          jobTitle: 'Finance Manager',
          department: 'Finance',
          hireDate: new Date('2021-04-01'),
        });

        // Set manager relationship
        await client.query('UPDATE "Employees" SET "managerId" = $1 WHERE id = $2', [
          deptHead3EmployeeId,
          manager3EmployeeId,
        ]);

        // Create employee for third company
        const employee3UserId = await getOrCreateUser(
          'employee3@quickhr.com',
          'Test123!@#',
          'employee'
        );
        const employee3EmployeeId = await getOrCreateEmployee({
          userEmail: 'employee3@quickhr.com',
          companyId: thirdCompanyId,
          employeeId: 'EMP-EMP-003',
          firstName: 'Employee',
          lastName: 'Three',
          userCompEmail: 'employee3@quickhr.com',
          jobTitle: 'Financial Analyst',
          department: 'Finance',
          hireDate: new Date('2021-05-01'),
        });

        // Set employee manager relationship
        await client.query('UPDATE "Employees" SET "managerId" = $1 WHERE id = $2', [
          manager3EmployeeId,
          employee3EmployeeId,
        ]);

        console.log('Employees for third company created successfully!');
      }

      console.log('Role-based seeding completed successfully!');
    } else {
      console.log('Skipping test users creation (set SEED_TEST_USERS=true to enable)');
    }

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

-- HRM Database Schema
-- PostgreSQL Tables with Multi-Tenant Support

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Authentication)
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(50) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('super_admin', 'provider_admin', 'provider_hr_staff', 'hrbp', 'company_admin', 'department_head', 'manager', 'employee')),
    "emailVerified" BOOLEAN DEFAULT false,
    "phoneVerified" BOOLEAN DEFAULT false,
    "verificationToken" VARCHAR(255),
    "verificationTokenExpiry" TIMESTAMP,
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordTokenExpiry" TIMESTAMP,
    "lastLogin" TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON "Users"("phoneNumber");
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON "Users"("verificationToken");
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON "Users"("resetPasswordToken");
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON "Users"("isActive");

-- Companies Table (Multi-Tenant Support)
CREATE TABLE IF NOT EXISTS "Companies" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    "hrbpId" UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_code ON "Companies"(code);
CREATE INDEX IF NOT EXISTS idx_companies_status ON "Companies"(status);
CREATE INDEX IF NOT EXISTS idx_companies_hrbp_id ON "Companies"("hrbpId");

-- Departments Table
CREATE TABLE IF NOT EXISTS "Departments" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "headId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT uk_department_company_name UNIQUE ("companyId", name)
);

CREATE INDEX IF NOT EXISTS idx_departments_company_id ON "Departments"("companyId");

-- Employees Table with self-referential hierarchy and company support
CREATE TABLE IF NOT EXISTS "Employees" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(255) NOT NULL UNIQUE,
    "companyId" UUID NOT NULL,
    "employeeId" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(50),
    "dateOfBirth" DATE,
    address TEXT,
    "jobTitle" VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    "managerId" UUID,
    "hireDate" DATE NOT NULL,
    salary DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_manager FOREIGN KEY ("managerId") REFERENCES "Employees"(id) ON DELETE SET NULL,
    CONSTRAINT uk_employee_company_id UNIQUE ("companyId", "employeeId")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON "Employees"("companyId");
CREATE INDEX IF NOT EXISTS idx_employees_company_employee_id ON "Employees"("companyId", "employeeId");
CREATE INDEX IF NOT EXISTS idx_employees_email ON "Employees"(email);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON "Employees"("userId");
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON "Employees"("managerId");
CREATE INDEX IF NOT EXISTS idx_employees_department ON "Employees"(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON "Employees"(status);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS "LeaveRequests" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "leaveType" VARCHAR(50) NOT NULL CHECK ("leaveType" IN ('annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid')),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    "approvedBy" UUID,
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_approver FOREIGN KEY ("approvedBy") REFERENCES "Employees"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leave_employee_id ON "LeaveRequests"("employeeId");
CREATE INDEX IF NOT EXISTS idx_leave_company_id ON "LeaveRequests"("companyId");
CREATE INDEX IF NOT EXISTS idx_leave_status ON "LeaveRequests"(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON "LeaveRequests"("startDate", "endDate");

-- Attendance Table
CREATE TABLE IF NOT EXISTS "Attendance" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    date DATE NOT NULL,
    "checkIn" TIMESTAMP,
    "checkOut" TIMESTAMP,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
    notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT uk_attendance_employee_date UNIQUE ("employeeId", date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON "Attendance"("employeeId");
CREATE INDEX IF NOT EXISTS idx_attendance_company_id ON "Attendance"("companyId");
CREATE INDEX IF NOT EXISTS idx_attendance_date ON "Attendance"(date);

-- Payroll Table
CREATE TABLE IF NOT EXISTS "Payroll" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    "baseSalary" DECIMAL(10, 2) NOT NULL,
    allowances DECIMAL(10, 2) DEFAULT 0,
    deductions DECIMAL(10, 2) DEFAULT 0,
    bonuses DECIMAL(10, 2) DEFAULT 0,
    "netSalary" DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_payroll_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT uk_payroll_employee_month_year UNIQUE ("employeeId", month, year)
);

CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON "Payroll"("employeeId");
CREATE INDEX IF NOT EXISTS idx_payroll_company_id ON "Payroll"("companyId");
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON "Payroll"(month, year);

-- Performance Reviews Table (moved from MongoDB to PostgreSQL)
CREATE TABLE IF NOT EXISTS "PerformanceReviews" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "reviewPeriod" VARCHAR(50) NOT NULL,
    goals JSONB,
    achievements JSONB,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_performance_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_performance_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_performance_reviewer FOREIGN KEY ("reviewerId") REFERENCES "Employees"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performance_employee_id ON "PerformanceReviews"("employeeId");
CREATE INDEX IF NOT EXISTS idx_performance_company_id ON "PerformanceReviews"("companyId");
CREATE INDEX IF NOT EXISTS idx_performance_reviewer_id ON "PerformanceReviews"("reviewerId");
CREATE INDEX IF NOT EXISTS idx_performance_period ON "PerformanceReviews"("reviewPeriod");

-- Audit Logs Table (for tracking changes)
CREATE TABLE IF NOT EXISTS "AuditLogs" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" UUID NOT NULL,
    "companyId" UUID,
    "userId" VARCHAR(255) NOT NULL,
    changes JSONB,
    metadata JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON "AuditLogs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_audit_company_id ON "AuditLogs"("companyId");
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON "AuditLogs"("userId");
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON "AuditLogs"("createdAt" DESC);

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updatedAt
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON "Companies"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON "Departments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON "Employees"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON "LeaveRequests"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON "Attendance"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON "Payroll"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON "PerformanceReviews"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

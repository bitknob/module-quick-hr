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

-- User Devices Table (Mobile Device Registration)
CREATE TABLE IF NOT EXISTS "UserDevices" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "deviceId" VARCHAR(255) NOT NULL,
    "deviceType" VARCHAR(20) NOT NULL CHECK ("deviceType" IN ('ios', 'android', 'web', 'other')),
    "deviceName" VARCHAR(255),
    "deviceModel" VARCHAR(255),
    "osVersion" VARCHAR(50),
    "appVersion" VARCHAR(50),
    "fcmToken" VARCHAR(500),
    "apnsToken" VARCHAR(500),
    "isActive" BOOLEAN DEFAULT true,
    "lastActiveAt" TIMESTAMP,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "isPrimary" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device_user FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE,
    CONSTRAINT uk_device_user_device UNIQUE ("userId", "deviceId")
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON "UserDevices"("userId");
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON "UserDevices"("deviceId");
CREATE INDEX IF NOT EXISTS idx_devices_fcm_token ON "UserDevices"("fcmToken");
CREATE INDEX IF NOT EXISTS idx_devices_active ON "UserDevices"("isActive");
CREATE INDEX IF NOT EXISTS idx_devices_primary ON "UserDevices"("userId", "isPrimary") WHERE "isPrimary" = true;

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

-- Request Logs Table (for tracking all HTTP requests)
CREATE TABLE IF NOT EXISTS "RequestLogs" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID,
    "employeeId" UUID,
    "companyId" UUID,
    method VARCHAR(10) NOT NULL,
    url VARCHAR(500) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "queryParams" JSONB,
    "requestHeaders" JSONB,
    "requestBody" JSONB,
    "responseStatus" INTEGER,
    "responseBody" JSONB,
    "responseHeaders" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "duration" INTEGER,
    "errorMessage" TEXT,
    "serviceName" VARCHAR(100),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_log_user FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE SET NULL,
    CONSTRAINT fk_request_log_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE SET NULL,
    CONSTRAINT fk_request_log_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON "RequestLogs"("userId");
CREATE INDEX IF NOT EXISTS idx_request_logs_employee_id ON "RequestLogs"("employeeId");
CREATE INDEX IF NOT EXISTS idx_request_logs_company_id ON "RequestLogs"("companyId");
CREATE INDEX IF NOT EXISTS idx_request_logs_method ON "RequestLogs"(method);
CREATE INDEX IF NOT EXISTS idx_request_logs_path ON "RequestLogs"("path");
CREATE INDEX IF NOT EXISTS idx_request_logs_status ON "RequestLogs"("responseStatus");
CREATE INDEX IF NOT EXISTS idx_request_logs_service ON "RequestLogs"("serviceName");
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON "RequestLogs"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_url ON "RequestLogs"(url);

-- Approval Requests Table (Generic approval system for all request types)
CREATE TABLE IF NOT EXISTS "ApprovalRequests" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    "requestType" VARCHAR(50) NOT NULL CHECK ("requestType" IN ('leave', 'employee_create', 'employee_update', 'employee_transfer', 'employee_promotion', 'salary_change', 'department_change', 'other')),
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" UUID,
    "requestedBy" UUID NOT NULL,
    "requestedFor" UUID,
    "requestData" JSONB NOT NULL,
    "currentStep" INTEGER DEFAULT 1,
    "totalSteps" INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    "expiresAt" TIMESTAMP,
    "approvedAt" TIMESTAMP,
    "rejectedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_requested_by FOREIGN KEY ("requestedBy") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_requested_for FOREIGN KEY ("requestedFor") REFERENCES "Employees"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_company_id ON "ApprovalRequests"("companyId");
CREATE INDEX IF NOT EXISTS idx_approval_request_type ON "ApprovalRequests"("requestType");
CREATE INDEX IF NOT EXISTS idx_approval_entity ON "ApprovalRequests"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_approval_requested_by ON "ApprovalRequests"("requestedBy");
CREATE INDEX IF NOT EXISTS idx_approval_status ON "ApprovalRequests"(status);
CREATE INDEX IF NOT EXISTS idx_approval_created_at ON "ApprovalRequests"("createdAt" DESC);

-- Approval Steps Table (Multi-level approval workflow)
CREATE TABLE IF NOT EXISTS "ApprovalSteps" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "approvalRequestId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "approverId" UUID,
    "approverRole" VARCHAR(50),
    "approverType" VARCHAR(20) NOT NULL CHECK ("approverType" IN ('specific_user', 'role_based', 'manager', 'department_head', 'hrbp', 'company_admin')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    "approvedAt" TIMESTAMP,
    "rejectedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "comments" TEXT,
    "isRequired" BOOLEAN DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_step_request FOREIGN KEY ("approvalRequestId") REFERENCES "ApprovalRequests"(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_step_approver FOREIGN KEY ("approverId") REFERENCES "Employees"(id) ON DELETE SET NULL,
    CONSTRAINT uk_approval_step_request_order UNIQUE ("approvalRequestId", "order")
);

CREATE INDEX IF NOT EXISTS idx_approval_step_request_id ON "ApprovalSteps"("approvalRequestId");
CREATE INDEX IF NOT EXISTS idx_approval_step_approver_id ON "ApprovalSteps"("approverId");
CREATE INDEX IF NOT EXISTS idx_approval_step_status ON "ApprovalSteps"(status);
CREATE INDEX IF NOT EXISTS idx_approval_step_order ON "ApprovalSteps"("approvalRequestId", "order");

-- Approval History Table (Track all approval actions)
CREATE TABLE IF NOT EXISTS "ApprovalHistory" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "approvalRequestId" UUID NOT NULL,
    "approvalStepId" UUID,
    "action" VARCHAR(20) NOT NULL CHECK ("action" IN ('created', 'approved', 'rejected', 'cancelled', 'expired', 'delegated', 'commented')),
    "performedBy" UUID NOT NULL,
    "performedByRole" VARCHAR(50),
    "comments" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_history_request FOREIGN KEY ("approvalRequestId") REFERENCES "ApprovalRequests"(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_history_step FOREIGN KEY ("approvalStepId") REFERENCES "ApprovalSteps"(id) ON DELETE SET NULL,
    CONSTRAINT fk_approval_history_performed_by FOREIGN KEY ("performedBy") REFERENCES "Employees"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_approval_history_request_id ON "ApprovalHistory"("approvalRequestId");
CREATE INDEX IF NOT EXISTS idx_approval_history_step_id ON "ApprovalHistory"("approvalStepId");
CREATE INDEX IF NOT EXISTS idx_approval_history_performed_by ON "ApprovalHistory"("performedBy");
CREATE INDEX IF NOT EXISTS idx_approval_history_action ON "ApprovalHistory"("action");
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON "ApprovalHistory"("createdAt" DESC);

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

CREATE TRIGGER update_user_devices_updated_at BEFORE UPDATE ON "UserDevices"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON "ApprovalRequests"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_steps_updated_at BEFORE UPDATE ON "ApprovalSteps"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fix RequestLogs foreign key constraints to allow NULL values for non-existent references
-- This resolves issues where request logs fail when user/employee/company IDs don't exist

-- Drop existing constraints
ALTER TABLE "RequestLogs" DROP CONSTRAINT IF EXISTS fk_request_log_user;
ALTER TABLE "RequestLogs" DROP CONSTRAINT IF EXISTS fk_request_log_employee;
ALTER TABLE "RequestLogs" DROP CONSTRAINT IF EXISTS fk_request_log_company;

-- Add constraints with ON DELETE SET NULL and NOT VALID to allow existing data
ALTER TABLE "RequestLogs" ADD CONSTRAINT fk_request_log_user 
    FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE "RequestLogs" ADD CONSTRAINT fk_request_log_employee 
    FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE "RequestLogs" ADD CONSTRAINT fk_request_log_company 
    FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE SET NULL NOT VALID;

-- Validate the constraints (this will ignore existing violations)
ALTER TABLE "RequestLogs" VALIDATE CONSTRAINT fk_request_log_user;
ALTER TABLE "RequestLogs" VALIDATE CONSTRAINT fk_request_log_employee;
ALTER TABLE "RequestLogs" VALIDATE CONSTRAINT fk_request_log_company;

-- Clean up any existing invalid references by setting them to NULL
UPDATE "RequestLogs" SET "userId" = NULL WHERE "userId" IS NOT NULL AND "userId" NOT IN (SELECT id FROM "Users");
UPDATE "RequestLogs" SET "employeeId" = NULL WHERE "employeeId" IS NOT NULL AND "employeeId" NOT IN (SELECT id FROM "Employees");
UPDATE "RequestLogs" SET "companyId" = NULL WHERE "companyId" IS NOT NULL AND "companyId" NOT IN (SELECT id FROM "Companies");

-- Now validate the constraints again
ALTER TABLE "RequestLogs" VALIDATE CONSTRAINT fk_request_log_user;
ALTER TABLE "RequestLogs" VALIDATE CONSTRAINT fk_request_log_employee;
ALTER TABLE "RequestLogs" VALIDATE CONSTRAINT fk_request_log_company;

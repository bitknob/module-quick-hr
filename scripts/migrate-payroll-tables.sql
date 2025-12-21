-- Payroll Service Tables Migration
-- Comprehensive Multi-Country Payroll System Tables
-- 
-- IMPORTANT: This system is fully database-driven with NO hardcoded tax calculations.
-- All tax rates, slabs, exemptions, and rules must be configured in the TaxConfigurations table.
-- If a tax configuration is missing or incomplete, calculations will return 0.
--
-- Key Features:
-- - Country-wise tax configuration support (IN, US, UK, etc.)
-- - Flexible JSONB-based configuration for tax slabs and exemption rules
-- - No hardcoded defaults - all values come from database
-- - Support for multiple countries per company (multi-national operations)

-- Salary Structures Table
CREATE TABLE IF NOT EXISTS "SalaryStructures" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_structure_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_salary_structures_company_id ON "SalaryStructures"("companyId");
CREATE INDEX IF NOT EXISTS idx_salary_structures_company_name ON "SalaryStructures"("companyId", name);
CREATE INDEX IF NOT EXISTS idx_salary_structures_active ON "SalaryStructures"("isActive");

-- Payroll Components Table
CREATE TABLE IF NOT EXISTS "PayrollComponents" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "salaryStructureId" UUID NOT NULL,
    "componentName" VARCHAR(255) NOT NULL,
    "componentType" VARCHAR(20) NOT NULL CHECK ("componentType" IN ('earning', 'deduction')),
    "componentCategory" VARCHAR(50) NOT NULL CHECK ("componentCategory" IN ('basic', 'hra', 'lta', 'special_allowance', 'transport_allowance', 'medical_allowance', 'bonus', 'overtime', 'incentive', 'tds', 'professional_tax', 'epf', 'esi', 'loan', 'advance', 'other')),
    "isPercentage" BOOLEAN DEFAULT false,
    value DECIMAL(10, 2) NOT NULL,
    "percentageOf" VARCHAR(50),
    "isTaxable" BOOLEAN DEFAULT true,
    "isStatutory" BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_component_structure FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructures"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payroll_components_structure_id ON "PayrollComponents"("salaryStructureId");
CREATE INDEX IF NOT EXISTS idx_payroll_components_type ON "PayrollComponents"("componentType");
CREATE INDEX IF NOT EXISTS idx_payroll_components_category ON "PayrollComponents"("componentCategory");
CREATE INDEX IF NOT EXISTS idx_payroll_components_active ON "PayrollComponents"("isActive");

-- Employee Salary Structures Table
CREATE TABLE IF NOT EXISTS "EmployeeSalaryStructures" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "salaryStructureId" UUID NOT NULL,
    ctc DECIMAL(12, 2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_salary_structure_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_salary_structure_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_salary_structure_structure FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructures"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_salary_structures_employee_id ON "EmployeeSalaryStructures"("employeeId");
CREATE INDEX IF NOT EXISTS idx_employee_salary_structures_company_id ON "EmployeeSalaryStructures"("companyId");
CREATE INDEX IF NOT EXISTS idx_employee_salary_structures_structure_id ON "EmployeeSalaryStructures"("salaryStructureId");
CREATE INDEX IF NOT EXISTS idx_employee_salary_structures_active ON "EmployeeSalaryStructures"("isActive");
CREATE INDEX IF NOT EXISTS idx_employee_salary_structures_effective ON "EmployeeSalaryStructures"("effectiveFrom", "effectiveTo");
CREATE UNIQUE INDEX IF NOT EXISTS idx_employee_salary_structures_unique_active ON "EmployeeSalaryStructures"("employeeId", "isActive") WHERE "isActive" = true;

-- Tax Configurations Table (Country-wise Configuration)
-- 
-- This table stores all tax calculation parameters for each country and financial year.
-- ALL tax calculations are driven from this table - no hardcoded values in application code.
--
-- Configuration Fields:
-- - incomeTaxSlabs: Array of tax slabs [{from: 0, to: 250000, rate: 0}, {from: 250000, to: 500000, rate: 5}, ...]
-- - professionalTaxSlabs: Array of professional tax slabs [{from: 0, to: 5000, amount: 0}, {from: 5000, to: 10000, amount: 150}, ...]
-- - localTaxSlabs: Generic local tax slabs (state/province taxes)
-- - housingAllowanceExemptionRules: JSON rules for HRA/housing allowance exemptions
-- - travelAllowanceExemptionRules: JSON rules for LTA/travel allowance exemptions
-- - taxExemptions: JSON object for additional country-specific exemptions
--
-- Example incomeTaxSlabs for India (FY 2023-24):
-- [
--   {"from": 0, "to": 250000, "rate": 0},
--   {"from": 250000, "to": 500000, "rate": 5},
--   {"from": 500000, "to": 750000, "rate": 10},
--   {"from": 750000, "to": 1000000, "rate": 15},
--   {"from": 1000000, "to": 1250000, "rate": 20},
--   {"from": 1250000, "to": 1500000, "rate": 25},
--   {"from": 1500000, "to": null, "rate": 30}
-- ]
--
-- Example housingAllowanceExemptionRules:
-- {
--   "type": "percentage_of_basic",
--   "maxPercentage": 50,
--   "minRentPercentage": 10
-- }
--
CREATE TABLE IF NOT EXISTS "TaxConfigurations" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'IN',
    state VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    "financialYear" VARCHAR(20) NOT NULL,
    "incomeTaxEnabled" BOOLEAN DEFAULT true,
    "incomeTaxSlabs" JSONB,
    "socialSecurityEnabled" BOOLEAN DEFAULT false,
    "socialSecurityEmployerRate" DECIMAL(5, 2) DEFAULT 0,
    "socialSecurityEmployeeRate" DECIMAL(5, 2) DEFAULT 0,
    "socialSecurityMaxSalary" DECIMAL(10, 2) DEFAULT 0,
    "healthInsuranceEnabled" BOOLEAN DEFAULT false,
    "healthInsuranceEmployerRate" DECIMAL(5, 2) DEFAULT 0,
    "healthInsuranceEmployeeRate" DECIMAL(5, 2) DEFAULT 0,
    "healthInsuranceMaxSalary" DECIMAL(10, 2) DEFAULT 0,
    "localTaxEnabled" BOOLEAN DEFAULT false,
    "localTaxSlabs" JSONB,
    "professionalTaxEnabled" BOOLEAN DEFAULT false,
    "professionalTaxSlabs" JSONB,
    "housingAllowanceExemptionRules" JSONB,
    "travelAllowanceExemptionRules" JSONB,
    "standardDeduction" DECIMAL(10, 2) DEFAULT 0,
    "taxExemptions" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tax_configuration_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT uk_tax_configuration_company_country_year UNIQUE ("companyId", country, "financialYear")
);

CREATE INDEX IF NOT EXISTS idx_tax_configurations_company_id ON "TaxConfigurations"("companyId");
CREATE INDEX IF NOT EXISTS idx_tax_configurations_country ON "TaxConfigurations"(country);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_state ON "TaxConfigurations"(state);

-- Payroll Runs Table
CREATE TABLE IF NOT EXISTS "PayrollRuns" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    "payrollMonth" INTEGER NOT NULL CHECK ("payrollMonth" >= 1 AND "payrollMonth" <= 12),
    "payrollYear" INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed', 'locked')),
    "processedBy" VARCHAR(255),
    "processedAt" TIMESTAMP,
    "totalEmployees" INTEGER DEFAULT 0,
    "processedEmployees" INTEGER DEFAULT 0,
    "failedEmployees" INTEGER DEFAULT 0,
    "totalGrossSalary" DECIMAL(15, 2) DEFAULT 0,
    "totalDeductions" DECIMAL(15, 2) DEFAULT 0,
    "totalNetSalary" DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    "lockedAt" TIMESTAMP,
    "lockedBy" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_run_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT uk_payroll_run_company_month_year UNIQUE ("companyId", "payrollMonth", "payrollYear")
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_id ON "PayrollRuns"("companyId");
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON "PayrollRuns"(status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_month_year ON "PayrollRuns"("payrollMonth", "payrollYear");

-- Payslips Table
CREATE TABLE IF NOT EXISTS "Payslips" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "payrollRunId" UUID NOT NULL,
    "payslipNumber" VARCHAR(255) NOT NULL UNIQUE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'approved', 'sent', 'downloaded')),
    ctc DECIMAL(12, 2) NOT NULL,
    "grossSalary" DECIMAL(12, 2) NOT NULL,
    "totalEarnings" DECIMAL(12, 2) NOT NULL,
    "totalDeductions" DECIMAL(12, 2) NOT NULL,
    "netSalary" DECIMAL(12, 2) NOT NULL,
    "earningsBreakdown" JSONB NOT NULL DEFAULT '{}',
    "deductionsBreakdown" JSONB NOT NULL DEFAULT '{}',
    "tdsAmount" DECIMAL(10, 2) DEFAULT 0,
    "professionalTaxAmount" DECIMAL(10, 2) DEFAULT 0,
    "epfEmployeeAmount" DECIMAL(10, 2) DEFAULT 0,
    "epfEmployerAmount" DECIMAL(10, 2) DEFAULT 0,
    "esiEmployeeAmount" DECIMAL(10, 2) DEFAULT 0,
    "esiEmployerAmount" DECIMAL(10, 2) DEFAULT 0,
    "workingDays" INTEGER DEFAULT 0,
    "presentDays" INTEGER DEFAULT 0,
    "absentDays" INTEGER DEFAULT 0,
    "leaveDays" INTEGER DEFAULT 0,
    "taxExemptions" JSONB,
    "taxableIncome" DECIMAL(12, 2) DEFAULT 0,
    "approvedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payslip_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_payslip_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_payslip_payroll_run FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRuns"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON "Payslips"("employeeId");
CREATE INDEX IF NOT EXISTS idx_payslips_company_id ON "Payslips"("companyId");
CREATE INDEX IF NOT EXISTS idx_payslips_payroll_run_id ON "Payslips"("payrollRunId");
CREATE INDEX IF NOT EXISTS idx_payslips_number ON "Payslips"("payslipNumber");
CREATE INDEX IF NOT EXISTS idx_payslips_employee_month_year ON "Payslips"("employeeId", month, year);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON "Payslips"(status);
CREATE INDEX IF NOT EXISTS idx_payslips_month_year ON "Payslips"(month, year);

-- ============================================================================
-- IMPORTANT NOTES FOR DATABASE-DRIVEN CONFIGURATION
-- ============================================================================
--
-- 1. Tax Configuration is MANDATORY before processing payroll
--    - Each company must have a tax configuration for each country and financial year
--    - If tax configuration is missing, payroll processing will fail
--    - All tax rates, slabs, and exemption rules must be explicitly configured
--
-- 2. Income Tax Slabs Format (JSONB):
--    [
--      {"from": <start_amount>, "to": <end_amount>, "rate": <percentage>},
--      ...
--    ]
--    - "to" can be null for the highest slab
--    - "rate" is a percentage (e.g., 5 means 5%)
--
-- 3. Professional Tax / Local Tax Slabs Format (JSONB):
--    [
--      {"from": <start_amount>, "to": <end_amount>, "amount": <fixed_amount>},
--      ...
--    ]
--
-- 4. Housing Allowance Exemption Rules Format (JSONB):
--    {
--      "type": "percentage_of_basic" | "fixed_amount" | "actual_rent",
--      "maxPercentage": <number>,      // for percentage_of_basic
--      "minRentPercentage": <number>,  // for percentage_of_basic
--      "amount": <number>              // for fixed_amount
--    }
--
-- 5. Travel Allowance Exemption Rules Format (JSONB):
--    {
--      "type": "actual_expense" | "fixed_amount" | "percentage_of_basic",
--      "amount": <number>,             // for fixed_amount
--      "percentage": <number>          // for percentage_of_basic
--    }
--
-- 6. Tax Exemptions Format (JSONB):
--    {
--      "section80C": <amount>,
--      "section80D": <amount>,
--      "section80G": <amount>,
--      ... // any other country-specific exemptions
--    }
--
-- 7. Social Security & Health Insurance:
--    - Rates are percentages (e.g., 12.0 means 12%)
--    - maxSalary: 0 means no limit, otherwise calculates on min(baseSalary, maxSalary)
--    - For health insurance: if grossSalary > maxSalary, returns 0
--
-- 8. Standard Deduction:
--    - Fixed annual amount deducted from taxable income
--    - Example: 50000 (for India FY 2023-24)
--
-- ============================================================================

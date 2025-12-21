-- Additional Complex Payroll Tables Migration
-- Enterprise-level Payroll Features

-- Variable Pay Table (Bonuses, Incentives, Overtime, etc.)
CREATE TABLE IF NOT EXISTS "PayrollVariablePay" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "payrollRunId" UUID,
    "payslipId" UUID,
    "variablePayType" VARCHAR(50) NOT NULL CHECK ("variablePayType" IN ('bonus', 'incentive', 'commission', 'overtime', 'shift_allowance', 'performance_bonus', 'retention_bonus', 'other')),
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    "calculationBasis" VARCHAR(255),
    "calculationDetails" JSONB,
    "applicableMonth" INTEGER NOT NULL CHECK ("applicableMonth" >= 1 AND "applicableMonth" <= 12),
    "applicableYear" INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'processed', 'rejected', 'cancelled')),
    "approvedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP,
    "processedAt" TIMESTAMP,
    "isTaxable" BOOLEAN DEFAULT true,
    "isRecurring" BOOLEAN DEFAULT false,
    "recurrenceRule" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variable_pay_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_variable_pay_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_variable_pay_payroll_run FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRuns"(id) ON DELETE SET NULL,
    CONSTRAINT fk_variable_pay_payslip FOREIGN KEY ("payslipId") REFERENCES "Payslips"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_variable_pay_employee_id ON "PayrollVariablePay"("employeeId");
CREATE INDEX IF NOT EXISTS idx_variable_pay_company_id ON "PayrollVariablePay"("companyId");
CREATE INDEX IF NOT EXISTS idx_variable_pay_payroll_run_id ON "PayrollVariablePay"("payrollRunId");
CREATE INDEX IF NOT EXISTS idx_variable_pay_payslip_id ON "PayrollVariablePay"("payslipId");
CREATE INDEX IF NOT EXISTS idx_variable_pay_type ON "PayrollVariablePay"("variablePayType");
CREATE INDEX IF NOT EXISTS idx_variable_pay_month_year ON "PayrollVariablePay"("applicableMonth", "applicableYear");
CREATE INDEX IF NOT EXISTS idx_variable_pay_status ON "PayrollVariablePay"(status);
CREATE INDEX IF NOT EXISTS idx_variable_pay_employee_month_year ON "PayrollVariablePay"("employeeId", "applicableMonth", "applicableYear");

-- Arrears Table (Salary Revision, Promotions, Retroactive Adjustments)
CREATE TABLE IF NOT EXISTS "PayrollArrears" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "payrollRunId" UUID,
    "payslipId" UUID,
    "arrearsType" VARCHAR(50) NOT NULL CHECK ("arrearsType" IN ('salary_revision', 'promotion', 'retroactive_adjustment', 'correction', 'bonus_arrears', 'allowance_adjustment', 'other')),
    description TEXT,
    "originalPeriodFrom" DATE NOT NULL,
    "originalPeriodTo" DATE NOT NULL,
    "adjustmentAmount" DECIMAL(12, 2) NOT NULL,
    breakdown JSONB,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'cancelled')),
    "approvedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP,
    "processedAt" TIMESTAMP,
    "applicableMonth" INTEGER NOT NULL CHECK ("applicableMonth" >= 1 AND "applicableMonth" <= 12),
    "applicableYear" INTEGER NOT NULL,
    "isTaxable" BOOLEAN DEFAULT true,
    "taxCalculationBasis" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_arrears_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_arrears_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_arrears_payroll_run FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRuns"(id) ON DELETE SET NULL,
    CONSTRAINT fk_arrears_payslip FOREIGN KEY ("payslipId") REFERENCES "Payslips"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_arrears_employee_id ON "PayrollArrears"("employeeId");
CREATE INDEX IF NOT EXISTS idx_arrears_company_id ON "PayrollArrears"("companyId");
CREATE INDEX IF NOT EXISTS idx_arrears_payroll_run_id ON "PayrollArrears"("payrollRunId");
CREATE INDEX IF NOT EXISTS idx_arrears_payslip_id ON "PayrollArrears"("payslipId");
CREATE INDEX IF NOT EXISTS idx_arrears_type ON "PayrollArrears"("arrearsType");
CREATE INDEX IF NOT EXISTS idx_arrears_status ON "PayrollArrears"(status);
CREATE INDEX IF NOT EXISTS idx_arrears_month_year ON "PayrollArrears"("applicableMonth", "applicableYear");
CREATE INDEX IF NOT EXISTS idx_arrears_employee_status ON "PayrollArrears"("employeeId", status);

-- Loans Table (Employee Loans and Advances)
CREATE TABLE IF NOT EXISTS "PayrollLoans" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "loanType" VARCHAR(50) NOT NULL CHECK ("loanType" IN ('personal_loan', 'advance_salary', 'home_loan', 'vehicle_loan', 'education_loan', 'medical_loan', 'other')),
    "loanName" VARCHAR(255),
    "principalAmount" DECIMAL(12, 2) NOT NULL,
    "interestRate" DECIMAL(5, 2) NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "emiAmount" DECIMAL(10, 2) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled', 'suspended')),
    "outstandingPrincipal" DECIMAL(12, 2) DEFAULT 0,
    "totalInterestPaid" DECIMAL(12, 2) DEFAULT 0,
    "totalAmountPaid" DECIMAL(12, 2) DEFAULT 0,
    "deductionStartMonth" INTEGER NOT NULL CHECK ("deductionStartMonth" >= 1 AND "deductionStartMonth" <= 12),
    "deductionStartYear" INTEGER NOT NULL,
    "repaymentSchedule" JSONB,
    "loanTerms" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_loans_employee_id ON "PayrollLoans"("employeeId");
CREATE INDEX IF NOT EXISTS idx_loans_company_id ON "PayrollLoans"("companyId");
CREATE INDEX IF NOT EXISTS idx_loans_type ON "PayrollLoans"("loanType");
CREATE INDEX IF NOT EXISTS idx_loans_status ON "PayrollLoans"(status);
CREATE INDEX IF NOT EXISTS idx_loans_dates ON "PayrollLoans"("startDate", "endDate");

-- Loan Deductions Table (EMI Deductions per Payslip)
CREATE TABLE IF NOT EXISTS "PayrollLoanDeductions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "loanId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "payrollRunId" UUID NOT NULL,
    "payslipId" UUID NOT NULL,
    "emiAmount" DECIMAL(10, 2) NOT NULL,
    "principalComponent" DECIMAL(10, 2) NOT NULL,
    "interestComponent" DECIMAL(10, 2) NOT NULL,
    "deductionMonth" INTEGER NOT NULL CHECK ("deductionMonth" >= 1 AND "deductionMonth" <= 12),
    "deductionYear" INTEGER NOT NULL,
    "outstandingBalance" DECIMAL(12, 2) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_deduction_loan FOREIGN KEY ("loanId") REFERENCES "PayrollLoans"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_deduction_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_deduction_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_deduction_payroll_run FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRuns"(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_deduction_payslip FOREIGN KEY ("payslipId") REFERENCES "Payslips"(id) ON DELETE CASCADE,
    CONSTRAINT uk_loan_deduction_loan_month_year UNIQUE ("loanId", "deductionMonth", "deductionYear")
);

CREATE INDEX IF NOT EXISTS idx_loan_deductions_loan_id ON "PayrollLoanDeductions"("loanId");
CREATE INDEX IF NOT EXISTS idx_loan_deductions_employee_id ON "PayrollLoanDeductions"("employeeId");
CREATE INDEX IF NOT EXISTS idx_loan_deductions_company_id ON "PayrollLoanDeductions"("companyId");
CREATE INDEX IF NOT EXISTS idx_loan_deductions_payroll_run_id ON "PayrollLoanDeductions"("payrollRunId");
CREATE INDEX IF NOT EXISTS idx_loan_deductions_payslip_id ON "PayrollLoanDeductions"("payslipId");
CREATE INDEX IF NOT EXISTS idx_loan_deductions_month_year ON "PayrollLoanDeductions"("deductionMonth", "deductionYear");

-- Reimbursements Table (Travel, Medical, Meal, etc.)
CREATE TABLE IF NOT EXISTS "PayrollReimbursements" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "payrollRunId" UUID,
    "payslipId" UUID,
    "reimbursementType" VARCHAR(50) NOT NULL CHECK ("reimbursementType" IN ('travel', 'medical', 'meal', 'telephone', 'internet', 'fuel', 'conveyance', 'other')),
    description TEXT,
    "claimAmount" DECIMAL(12, 2) NOT NULL,
    "approvedAmount" DECIMAL(12, 2) DEFAULT 0,
    "claimDate" DATE NOT NULL,
    documents TEXT[],
    "expenseBreakdown" JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'processed', 'cancelled')),
    "approvedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP,
    "processedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "applicableMonth" INTEGER NOT NULL CHECK ("applicableMonth" >= 1 AND "applicableMonth" <= 12),
    "applicableYear" INTEGER NOT NULL,
    "isTaxable" BOOLEAN DEFAULT false,
    "taxExemptionLimit" DECIMAL(10, 2),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reimbursement_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_reimbursement_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_reimbursement_payroll_run FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRuns"(id) ON DELETE SET NULL,
    CONSTRAINT fk_reimbursement_payslip FOREIGN KEY ("payslipId") REFERENCES "Payslips"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reimbursements_employee_id ON "PayrollReimbursements"("employeeId");
CREATE INDEX IF NOT EXISTS idx_reimbursements_company_id ON "PayrollReimbursements"("companyId");
CREATE INDEX IF NOT EXISTS idx_reimbursements_payroll_run_id ON "PayrollReimbursements"("payrollRunId");
CREATE INDEX IF NOT EXISTS idx_reimbursements_payslip_id ON "PayrollReimbursements"("payslipId");
CREATE INDEX IF NOT EXISTS idx_reimbursements_type ON "PayrollReimbursements"("reimbursementType");
CREATE INDEX IF NOT EXISTS idx_reimbursements_status ON "PayrollReimbursements"(status);
CREATE INDEX IF NOT EXISTS idx_reimbursements_month_year ON "PayrollReimbursements"("applicableMonth", "applicableYear");
CREATE INDEX IF NOT EXISTS idx_reimbursements_employee_status ON "PayrollReimbursements"("employeeId", status);

-- Employee Tax Declarations Table
CREATE TABLE IF NOT EXISTS "EmployeeTaxDeclarations" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "financialYear" VARCHAR(20) NOT NULL,
    declarations JSONB NOT NULL DEFAULT '{}',
    "totalDeclaredAmount" DECIMAL(12, 2) DEFAULT 0,
    "verifiedAmount" DECIMAL(12, 2),
    "verificationStatus" VARCHAR(20) DEFAULT 'pending' CHECK ("verificationStatus" IN ('pending', 'partial', 'verified', 'rejected')),
    "verifiedBy" VARCHAR(255),
    "verifiedAt" TIMESTAMP,
    documents TEXT[],
    notes TEXT,
    "submittedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tax_declaration_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_tax_declaration_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT uk_tax_declaration_employee_year UNIQUE ("employeeId", "financialYear")
);

CREATE INDEX IF NOT EXISTS idx_tax_declarations_employee_id ON "EmployeeTaxDeclarations"("employeeId");
CREATE INDEX IF NOT EXISTS idx_tax_declarations_company_id ON "EmployeeTaxDeclarations"("companyId");
CREATE INDEX IF NOT EXISTS idx_tax_declarations_financial_year ON "EmployeeTaxDeclarations"("financialYear");
CREATE INDEX IF NOT EXISTS idx_tax_declarations_verification_status ON "EmployeeTaxDeclarations"("verificationStatus");

-- Update Payslips table to add new complex fields
ALTER TABLE "Payslips" 
ADD COLUMN IF NOT EXISTS "variablePayTotal" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "arrearsTotal" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "reimbursementTotal" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "loanDeductionTotal" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "proRataDays" DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "proRataFactor" DECIMAL(5, 4) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS "lossOfPayDays" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lossOfPayAmount" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "variablePayBreakdown" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "arrearsBreakdown" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "reimbursementBreakdown" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "loanDeductionBreakdown" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "ytdGrossSalary" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "ytdDeductions" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "ytdNetSalary" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "ytdTaxDeducted" DECIMAL(12, 2) DEFAULT 0;


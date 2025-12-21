-- Payslip Generation and Template Tables Migration
-- Enterprise-level Payslip Generation Features

-- Payslip Templates Table
CREATE TABLE IF NOT EXISTS "PayslipTemplates" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    "templateName" VARCHAR(255) NOT NULL,
    "templateType" VARCHAR(50) NOT NULL CHECK ("templateType" IN ('standard', 'minimal', 'detailed', 'custom')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    "headerConfiguration" JSONB NOT NULL DEFAULT '{}',
    "footerConfiguration" JSONB NOT NULL DEFAULT '{}',
    "bodyConfiguration" JSONB NOT NULL DEFAULT '{}',
    "stylingConfiguration" JSONB NOT NULL DEFAULT '{}',
    "sectionsConfiguration" JSONB NOT NULL DEFAULT '{}',
    "watermarkSettings" JSONB,
    "brandingSettings" JSONB,
    "isDefault" BOOLEAN DEFAULT false,
    "createdBy" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_template_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_templates_company_id ON "PayslipTemplates"("companyId");
CREATE INDEX IF NOT EXISTS idx_templates_status ON "PayslipTemplates"(status);
CREATE INDEX IF NOT EXISTS idx_templates_type ON "PayslipTemplates"("templateType");
CREATE INDEX IF NOT EXISTS idx_templates_default ON "PayslipTemplates"("isDefault");
CREATE INDEX IF NOT EXISTS idx_templates_company_status ON "PayslipTemplates"("companyId", status);

-- Payslip Generation Schedules Table
CREATE TABLE IF NOT EXISTS "PayslipGenerationSchedules" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    "scheduleName" VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('monthly', 'biweekly', 'weekly', 'custom')),
    "generationDay" INTEGER NOT NULL,
    "generationTime" VARCHAR(5) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    "triggerType" VARCHAR(20) DEFAULT 'scheduled' CHECK ("triggerType" IN ('automatic', 'manual', 'scheduled')),
    "autoApprove" BOOLEAN DEFAULT false,
    "autoSend" BOOLEAN DEFAULT false,
    "emailConfiguration" JSONB,
    "notificationConfiguration" JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
    "lastRunAt" TIMESTAMP,
    "nextRunAt" TIMESTAMP,
    "lastRunStatus" VARCHAR(50),
    "lastRunError" TEXT,
    "customScheduleRule" JSONB,
    "enabledMonths" INTEGER[],
    "enabledYears" INTEGER[],
    "excludedDates" DATE[],
    "createdBy" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_schedules_company_id ON "PayslipGenerationSchedules"("companyId");
CREATE INDEX IF NOT EXISTS idx_schedules_status ON "PayslipGenerationSchedules"(status);
CREATE INDEX IF NOT EXISTS idx_schedules_frequency ON "PayslipGenerationSchedules"(frequency);
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON "PayslipGenerationSchedules"("nextRunAt");
CREATE INDEX IF NOT EXISTS idx_schedules_company_status ON "PayslipGenerationSchedules"("companyId", status);

-- Payslip Generation Logs Table
CREATE TABLE IF NOT EXISTS "PayslipGenerationLogs" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    "scheduleId" UUID,
    "payrollRunId" UUID,
    "generationSource" VARCHAR(20) NOT NULL CHECK ("generationSource" IN ('manual', 'scheduled', 'api', 'bulk')),
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'processing', 'completed', 'failed', 'cancelled')),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    "totalEmployees" INTEGER DEFAULT 0,
    "successfulGenerations" INTEGER DEFAULT 0,
    "failedGenerations" INTEGER DEFAULT 0,
    "skippedGenerations" INTEGER DEFAULT 0,
    "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "errorDetails" JSONB,
    "generationConfig" JSONB,
    "templateId" UUID,
    "initiatedBy" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_schedule FOREIGN KEY ("scheduleId") REFERENCES "PayslipGenerationSchedules"(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_payroll_run FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRuns"(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_template FOREIGN KEY ("templateId") REFERENCES "PayslipTemplates"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_company_id ON "PayslipGenerationLogs"("companyId");
CREATE INDEX IF NOT EXISTS idx_logs_schedule_id ON "PayslipGenerationLogs"("scheduleId");
CREATE INDEX IF NOT EXISTS idx_logs_payroll_run_id ON "PayslipGenerationLogs"("payrollRunId");
CREATE INDEX IF NOT EXISTS idx_logs_status ON "PayslipGenerationLogs"(status);
CREATE INDEX IF NOT EXISTS idx_logs_month_year ON "PayslipGenerationLogs"(month, year);
CREATE INDEX IF NOT EXISTS idx_logs_source ON "PayslipGenerationLogs"("generationSource");
CREATE INDEX IF NOT EXISTS idx_logs_started_at ON "PayslipGenerationLogs"("startedAt");

-- Update Payslips table to add generation fields
ALTER TABLE "Payslips" 
ADD COLUMN IF NOT EXISTS "templateId" UUID REFERENCES "PayslipTemplates"(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "generatedPdfPath" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "generatedPdfUrl" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "pdfGeneratedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_payslips_template_id ON "Payslips"("templateId");
CREATE INDEX IF NOT EXISTS idx_payslips_pdf_generated ON "Payslips"("pdfGeneratedAt");


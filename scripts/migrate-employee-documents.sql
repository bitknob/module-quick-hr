-- Employee Documents Table
CREATE TABLE IF NOT EXISTS "EmployeeDocuments" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "documentType" VARCHAR(50) NOT NULL CHECK ("documentType" IN (
        'id_proof', 'address_proof', 'pan_card', 'aadhaar_card', 'passport',
        'driving_license', 'educational_certificate', 'experience_certificate',
        'offer_letter', 'appointment_letter', 'relieving_letter', 'salary_slip',
        'bank_statement', 'form_16', 'other'
    )),
    "documentName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "expiryDate" DATE,
    notes TEXT,
    "uploadedBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_verifier FOREIGN KEY ("verifiedBy") REFERENCES "Employees"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON "EmployeeDocuments"("employeeId");
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON "EmployeeDocuments"("companyId");
CREATE INDEX IF NOT EXISTS idx_documents_type ON "EmployeeDocuments"("documentType");
CREATE INDEX IF NOT EXISTS idx_documents_status ON "EmployeeDocuments"(status);
CREATE INDEX IF NOT EXISTS idx_documents_employee_type ON "EmployeeDocuments"("employeeId", "documentType");

-- Employee Details Table
CREATE TABLE IF NOT EXISTS "EmployeeDetails" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL UNIQUE,
    "companyId" UUID NOT NULL,
    "emergencyContactName" VARCHAR(255),
    "emergencyContactPhone" VARCHAR(50),
    "emergencyContactRelation" VARCHAR(100),
    "bankAccountNumber" VARCHAR(50),
    "bankName" VARCHAR(255),
    "bankBranch" VARCHAR(255),
    "bankIFSC" VARCHAR(20),
    "panNumber" VARCHAR(20),
    "aadhaarNumber" VARCHAR(20),
    "passportNumber" VARCHAR(50),
    "drivingLicenseNumber" VARCHAR(50),
    "bloodGroup" VARCHAR(10),
    "maritalStatus" VARCHAR(20) CHECK ("maritalStatus" IN ('single', 'married', 'divorced', 'widowed')),
    "spouseName" VARCHAR(255),
    "fatherName" VARCHAR(255),
    "motherName" VARCHAR(255),
    "permanentAddress" TEXT,
    "currentAddress" TEXT,
    "previousEmployer" VARCHAR(255),
    "previousDesignation" VARCHAR(255),
    "previousSalary" DECIMAL(10, 2),
    "noticePeriod" INTEGER,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    "additionalInfo" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_detail_employee FOREIGN KEY ("employeeId") REFERENCES "Employees"(id) ON DELETE CASCADE,
    CONSTRAINT fk_detail_company FOREIGN KEY ("companyId") REFERENCES "Companies"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_details_employee_id ON "EmployeeDetails"("employeeId");
CREATE INDEX IF NOT EXISTS idx_details_company_id ON "EmployeeDetails"("companyId");
CREATE INDEX IF NOT EXISTS idx_details_pan ON "EmployeeDetails"("panNumber");
CREATE INDEX IF NOT EXISTS idx_details_aadhaar ON "EmployeeDetails"("aadhaarNumber");

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_employee_documents_updated_at ON "EmployeeDocuments";
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON "EmployeeDocuments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_details_updated_at ON "EmployeeDetails";
CREATE TRIGGER update_employee_details_updated_at BEFORE UPDATE ON "EmployeeDetails"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


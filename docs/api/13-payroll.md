# Payroll Service API

Base Path: `/api/payroll`

The Payroll Service provides comprehensive payroll management with country-wise tax configuration. **All tax calculations are database-driven with no hardcoded values.**

## Overview

The payroll system supports:
- Multi-country payroll processing
- Flexible salary structure management
- Country-wise tax configuration
- Automated payslip generation
- Batch payroll processing
- Statutory compliance (income tax, social security, health insurance, local taxes)

**Important**: All tax rates, slabs, and exemption rules must be configured in the database. The system does not use any hardcoded tax calculations.

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Access Control

Payroll management requires one of the following roles:
- `SUPER_ADMIN`
- `PROVIDER_ADMIN`
- `PROVIDER_HR_STAFF`
- `HRBP`
- `COMPANY_ADMIN`

Employees can view their own payslips with role `EMPLOYEE`.

---

## Salary Structure Management

### Create Salary Structure

**POST** `/api/payroll/salary-structures`

Create a new salary structure template for a company.

**Request Body:**
```json
{
  "companyId": "uuid",
  "name": "Standard Salary Structure",
  "description": "Standard structure for all employees",
  "components": [
    {
      "componentName": "Basic Salary",
      "componentType": "earning",
      "componentCategory": "basic",
      "isPercentage": true,
      "value": 40,
      "percentageOf": "ctc",
      "isTaxable": true,
      "isStatutory": false,
      "priority": 1
    },
    {
      "componentName": "HRA",
      "componentType": "earning",
      "componentCategory": "hra",
      "isPercentage": true,
      "value": 20,
      "percentageOf": "ctc",
      "isTaxable": true,
      "isStatutory": false,
      "priority": 2
    },
    {
      "componentName": "Special Allowance",
      "componentType": "earning",
      "componentCategory": "special_allowance",
      "isPercentage": true,
      "value": 40,
      "percentageOf": "ctc",
      "isTaxable": true,
      "isStatutory": false,
      "priority": 3
    }
  ]
}
```

**Response:**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Salary structure created successfully"
  },
  "response": {
    "id": "uuid",
    "companyId": "uuid",
    "name": "Standard Salary Structure",
    "description": "Standard structure for all employees",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Salary Structure

**GET** `/api/payroll/salary-structures/:id`

Retrieve a salary structure by ID with all its components.

### Get Salary Structures by Company

**GET** `/api/payroll/salary-structures/company/:companyId`

Retrieve all salary structures for a company.

### Update Salary Structure

**PUT** `/api/payroll/salary-structures/:id`

Update salary structure details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": true
}
```

### Add Component to Salary Structure

**POST** `/api/payroll/salary-structures/:id/components`

Add a new component to an existing salary structure.

### Update Component

**PUT** `/api/payroll/salary-structures/components/:id`

Update a payroll component.

### Delete Component

**DELETE** `/api/payroll/salary-structures/components/:id`

Soft delete a component (sets isActive to false).

### Assign Salary Structure to Employee

**POST** `/api/payroll/salary-structures/assign`

Assign a salary structure to an employee.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "companyId": "uuid",
  "salaryStructureId": "uuid",
  "ctc": 1200000,
  "effectiveFrom": "2024-01-01T00:00:00.000Z",
  "effectiveTo": null
}
```

### Get Employee Salary Structure

**GET** `/api/payroll/salary-structures/employee/:employeeId`

Get the current active salary structure for an employee.

---

## Tax Configuration Management

### Create Tax Configuration

**POST** `/api/payroll/tax-configurations`

Create a tax configuration for a company, country, and financial year.

**Request Body:**
```json
{
  "companyId": "uuid",
  "country": "IN",
  "state": "Maharashtra",
  "province": null,
  "financialYear": "2024-2025",
  "incomeTaxEnabled": true,
  "incomeTaxSlabs": [
    {"from": 0, "to": 250000, "rate": 0},
    {"from": 250000, "to": 500000, "rate": 5},
    {"from": 500000, "to": 750000, "rate": 10},
    {"from": 750000, "to": 1000000, "rate": 15},
    {"from": 1000000, "to": 1250000, "rate": 20},
    {"from": 1250000, "to": 1500000, "rate": 25},
    {"from": 1500000, "to": null, "rate": 30}
  ],
  "socialSecurityEnabled": true,
  "socialSecurityEmployerRate": 12.0,
  "socialSecurityEmployeeRate": 12.0,
  "socialSecurityMaxSalary": 15000,
  "healthInsuranceEnabled": true,
  "healthInsuranceEmployerRate": 3.25,
  "healthInsuranceEmployeeRate": 0.75,
  "healthInsuranceMaxSalary": 21000,
  "professionalTaxEnabled": true,
  "professionalTaxSlabs": [
    {"from": 0, "to": 5000, "amount": 0},
    {"from": 5000, "to": 10000, "amount": 150},
    {"from": 10000, "to": null, "amount": 200}
  ],
  "housingAllowanceExemptionRules": {
    "type": "percentage_of_basic",
    "maxPercentage": 50,
    "minRentPercentage": 10
  },
  "travelAllowanceExemptionRules": {
    "type": "actual_expense"
  },
  "standardDeduction": 50000,
  "taxExemptions": {
    "section80C": 150000,
    "section80D": 25000
  }
}
```

**Note**: All fields except `companyId`, `country`, `state`, and `financialYear` are optional. The system will use the configured values for calculations. If a field is missing, the corresponding calculation will return 0.

### Get Tax Configuration

**GET** `/api/payroll/tax-configurations/:id`

Retrieve a tax configuration by ID.

### Get Tax Configuration by Company, Country, and Year

**GET** `/api/payroll/tax-configurations/company/:companyId/country/:country/year/:financialYear`

Retrieve tax configuration for a specific company, country, and financial year.

### Get Tax Configurations by Company

**GET** `/api/payroll/tax-configurations/company/:companyId`

Get all tax configurations for a company.

### Update Tax Configuration

**PUT** `/api/payroll/tax-configurations/:id`

Update an existing tax configuration.

---

## Payroll Processing

### Create Payroll Run

**POST** `/api/payroll/runs`

Create a new payroll run for a company, month, and year.

**Request Body:**
```json
{
  "companyId": "uuid",
  "payrollMonth": 1,
  "payrollYear": 2024,
  "processedBy": "user-uid"
}
```

**Response:**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Payroll run created successfully"
  },
  "response": {
    "id": "uuid",
    "companyId": "uuid",
    "payrollMonth": 1,
    "payrollYear": 2024,
    "status": "draft",
    "totalEmployees": 0,
    "processedEmployees": 0,
    "failedEmployees": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Process Payroll Run

**POST** `/api/payroll/runs/:id/process`

Process a payroll run. This will:
1. Retrieve all active employees for the company
2. Generate payslips for each employee
3. Calculate all taxes based on tax configuration
4. Update payroll run status and statistics

**Request Body:**
```json
{
  "processedBy": "user-uid"
}
```

**Note**: A tax configuration must exist for the company and financial year before processing payroll.

### Get Payroll Run

**GET** `/api/payroll/runs/:id`

Get payroll run details by ID.

### Get Payroll Runs by Company

**GET** `/api/payroll/runs/company/:companyId?page=1&limit=20`

Get paginated list of payroll runs for a company.

### Lock Payroll Run

**POST** `/api/payroll/runs/:id/lock`

Lock a completed payroll run to prevent modifications.

---

## Payslip Management

### Get Payslip

**GET** `/api/payroll/payslips/:id`

Retrieve a payslip by ID with full details.

**Response:**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Payslip retrieved successfully"
  },
  "response": {
    "id": "uuid",
    "employeeId": "uuid",
    "companyId": "uuid",
    "payrollRunId": "uuid",
    "payslipNumber": "PSL-COMP-EMP-202401",
    "month": 1,
    "year": 2024,
    "status": "generated",
    "ctc": 1200000,
    "grossSalary": 100000,
    "totalEarnings": 100000,
    "totalDeductions": 25000,
    "netSalary": 75000,
    "earningsBreakdown": {
      "Basic Salary": 40000,
      "HRA": 20000,
      "Special Allowance": 40000
    },
    "deductionsBreakdown": {
      "Income Tax": 5000,
      "Local Tax": 200,
      "Social Security (Employee)": 4800,
      "Health Insurance (Employee)": 750
    },
    "tdsAmount": 5000,
    "professionalTaxAmount": 200,
    "epfEmployeeAmount": 4800,
    "epfEmployerAmount": 4800,
    "esiEmployeeAmount": 750,
    "esiEmployerAmount": 3250,
    "taxExemptions": {
      "housingAllowanceExemption": 15000,
      "travelAllowanceExemption": 0,
      "standardDeduction": 50000,
      "totalExemptions": 65000
    },
    "taxableIncome": 835000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Payslips by Employee

**GET** `/api/payroll/payslips/employee/:employeeId?page=1&limit=20`

Get paginated list of payslips for an employee.

### Get Payslips by Payroll Run

**GET** `/api/payroll/payslips/run/:payrollRunId?page=1&limit=100`

Get all payslips generated for a payroll run.

---

## Tax Configuration Format Reference

### Income Tax Slabs

Array of objects with:
- `from` (number): Start of income range
- `to` (number|null): End of income range (null for highest slab)
- `rate` (number): Tax rate percentage

Example:
```json
[
  {"from": 0, "to": 250000, "rate": 0},
  {"from": 250000, "to": 500000, "rate": 5},
  {"from": 500000, "to": null, "rate": 30}
]
```

### Professional Tax / Local Tax Slabs

Array of objects with:
- `from` (number): Start of salary range
- `to` (number|null): End of salary range
- `amount` (number): Fixed tax amount for this range

Example:
```json
[
  {"from": 0, "to": 5000, "amount": 0},
  {"from": 5000, "to": 10000, "amount": 150},
  {"from": 10000, "to": null, "amount": 200}
]
```

### Housing Allowance Exemption Rules

Object with:
- `type` (string): One of `"percentage_of_basic"`, `"fixed_amount"`, or `"actual_rent"`
- `maxPercentage` (number, optional): Maximum percentage of basic for `percentage_of_basic`
- `minRentPercentage` (number, optional): Minimum rent percentage for `percentage_of_basic`
- `amount` (number, optional): Fixed amount for `fixed_amount`

Example:
```json
{
  "type": "percentage_of_basic",
  "maxPercentage": 50,
  "minRentPercentage": 10
}
```

### Travel Allowance Exemption Rules

Object with:
- `type` (string): One of `"actual_expense"`, `"fixed_amount"`, or `"percentage_of_basic"`
- `amount` (number, optional): Fixed amount for `fixed_amount`
- `percentage` (number, optional): Percentage for `percentage_of_basic`

Example:
```json
{
  "type": "actual_expense"
}
```

### Tax Exemptions

Object with country-specific exemption sections:
```json
{
  "section80C": 150000,
  "section80D": 25000,
  "section80G": 10000
}
```

---

## Error Responses

### Tax Configuration Missing

**Status Code:** 404

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Tax configuration for this financial year",
    "responseDetail": ""
  },
  "response": null
}
```

This error occurs when trying to process payroll without a tax configuration for the company and financial year.

### Payroll Run Already Exists

**Status Code:** 409

```json
{
  "header": {
    "responseCode": 409,
    "responseMessage": "Payroll run already exists for this month and year",
    "responseDetail": ""
  },
  "response": null
}
```

### Insufficient Permissions

**Status Code:** 403

```json
{
  "header": {
    "responseCode": 403,
    "responseMessage": "Insufficient permissions to create payroll run",
    "responseDetail": ""
  },
  "response": null
}
```

---

## Important Notes

1. **Database-Driven Configuration**: All tax calculations use only values from the `TaxConfigurations` table. No hardcoded defaults are used.

2. **Tax Configuration is Mandatory**: Before processing payroll, ensure a tax configuration exists for:
   - Company ID
   - Country code
   - Financial year

3. **Multi-Country Support**: A company can have multiple tax configurations for different countries. The system automatically selects the appropriate configuration based on the company's country.

4. **Financial Year Format**: Use format `YYYY-YYYY` (e.g., `2024-2025`) or `YYYY` depending on country requirements.

5. **Country Codes**: Use ISO 3166-1 alpha-2 codes (e.g., `IN`, `US`, `UK`).

6. **Salary Structure Priority**: Components are processed in priority order (lower number = higher priority).

7. **Payroll Locking**: Once a payroll run is locked, it cannot be modified or reprocessed.

---

## Payslip Template Management

Payslip templates allow companies to customize the appearance and content of generated payslips. Templates are fully database-driven and configurable.

### Create Payslip Template

**POST** `/api/payroll/payslip-templates`

Create a new customizable payslip template.

**Request Body:**
```json
{
  "companyId": "uuid",
  "templateName": "Company Standard Template",
  "templateType": "detailed",
  "description": "Standard payslip template with all sections",
  "headerConfiguration": {
    "showCompanyLogo": true,
    "showCompanyName": true,
    "showEmployeeInfo": true,
    "showPayslipNumber": true,
    "showPeriod": true
  },
  "footerConfiguration": {
    "showDisclaimer": true,
    "disclaimerText": "This is a system-generated payslip.",
    "showSignature": true
  },
  "bodyConfiguration": {
    "layout": "standard"
  },
  "stylingConfiguration": {
    "primaryColor": "#2563eb",
    "secondaryColor": "#1e40af",
    "fontFamily": "Arial, sans-serif",
    "fontSize": "12px"
  },
  "sectionsConfiguration": {
    "showEarnings": true,
    "showDeductions": true,
    "showTaxDetails": true,
    "showSummary": true,
    "showYTD": true,
    "showAttendance": true,
    "showVariablePay": true,
    "showArrears": true,
    "showLoans": true
  },
  "watermarkSettings": {
    "enabled": false,
    "text": "CONFIDENTIAL",
    "opacity": 0.1
  },
  "brandingSettings": {
    "companyName": "Company Name",
    "logoUrl": "https://example.com/logo.png"
  },
  "isDefault": false
}
```

**Response:** Template object with all configuration

### Get Template

**GET** `/api/payroll/payslip-templates/:id?companyId=uuid`

Retrieve a specific template by ID.

### Get Templates by Company

**GET** `/api/payroll/payslip-templates/company/:companyId?status=active`

Get all templates for a company, optionally filtered by status.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `active`, `inactive`)

### Update Template

**PUT** `/api/payroll/payslip-templates/:id`

Update an existing template.

**Request Body:** Same as create, all fields optional

### Set Default Template

**POST** `/api/payroll/payslip-templates/:id/set-default`

Set a template as the default template for the company. The previous default will be unset.

**Request Body:**
```json
{
  "companyId": "uuid"
}
```

### Generate Payslip PDF

**POST** `/api/payroll/payslip-templates/generate-pdf/:id`

Generate a PDF for a specific payslip using a template.

**Request Body:**
```json
{
  "templateId": "uuid (optional)",
  "format": "pdf",
  "includeWatermark": true,
  "includeLogo": true,
  "language": "en",
  "currency": "INR",
  "customStyles": "/* Custom CSS */"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filePath": "/path/to/payslip.pdf",
    "fileUrl": "/api/payroll/payslips/{id}/pdf"
  },
  "message": "Payslip PDF generated successfully"
}
```

---

## Payslip Generation Scheduling

Automate payslip generation with flexible scheduling options. All schedules are database-driven and configurable.

### Create Generation Schedule

**POST** `/api/payroll/payslip-schedules`

Create a new payslip generation schedule.

**Request Body:**
```json
{
  "companyId": "uuid",
  "scheduleName": "Monthly Payslip Generation",
  "description": "Generate payslips on the 5th of every month",
  "frequency": "monthly",
  "generationDay": 5,
  "generationTime": "09:00",
  "timezone": "Asia/Kolkata",
  "triggerType": "scheduled",
  "autoApprove": false,
  "autoSend": false,
  "emailConfiguration": {
    "sendToEmployees": true,
    "sendToHR": true,
    "ccEmails": ["hr@company.com"]
  },
  "notificationConfiguration": {
    "sendNotifications": true,
    "notificationChannels": ["email", "sms"]
  },
  "enabledMonths": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "enabledYears": [2024, 2025],
  "excludedDates": ["2024-12-25T00:00:00Z"]
}
```

**Frequency Options:**
- `monthly`: Generate on a specific day of the month (1-31)
- `biweekly`: Generate every 2 weeks on a specific day (1-14)
- `weekly`: Generate on a specific day of the week (1-7, where 1=Monday, 7=Sunday)
- `custom`: Use customScheduleRule for advanced scheduling

**Response:** Schedule object with calculated `nextRunAt`

### Get Schedule

**GET** `/api/payroll/payslip-schedules/:id?companyId=uuid`

Retrieve a specific schedule by ID.

### Get Schedules by Company

**GET** `/api/payroll/payslip-schedules/company/:companyId?status=active`

Get all schedules for a company, optionally filtered by status.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `paused`)

### Update Schedule

**PUT** `/api/payroll/payslip-schedules/:id`

Update an existing schedule. The `nextRunAt` will be recalculated automatically.

**Request Body:** Same as create, all fields optional

### Get Generation Logs

**GET** `/api/payroll/payslip-schedules/company/:companyId/logs?page=1&limit=20`

Get generation logs for a company showing all payslip generation runs.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## Complex Payroll Features

### Variable Pay Management

Variable pay includes bonuses, incentives, overtime, commissions, and other variable compensation components.

#### Create Variable Pay

**POST** `/api/payroll/variable-pay`

Create a variable pay record for an employee.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "companyId": "uuid",
  "variablePayType": "bonus",
  "description": "Annual Performance Bonus",
  "amount": 50000,
  "calculationBasis": "performance_rating",
  "calculationDetails": {
    "rating": 4.5,
    "multiplier": 1.2
  },
  "applicableMonth": 12,
  "applicableYear": 2024,
  "isTaxable": true,
  "isRecurring": false
}
```

**Variable Pay Types:**
- `bonus`: Performance bonus, annual bonus
- `incentive`: Sales incentive, target-based incentive
- `commission`: Sales commission
- `overtime`: Overtime pay
- `shift_allowance`: Night shift allowance, holiday allowance
- `performance_bonus`: Performance-linked bonus
- `retention_bonus`: Employee retention bonus
- `other`: Other variable pay types

#### Approve Variable Pay

**POST** `/api/payroll/variable-pay/:id/approve`

Approve a variable pay record. Only approved variable pays are included in payroll calculations.

### Arrears Management

Arrears handle salary revisions, promotions, and retroactive adjustments.

#### Create Arrears

**POST** `/api/payroll/arrears`

Create an arrears record.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "companyId": "uuid",
  "arrearsType": "salary_revision",
  "description": "Salary revision arrears",
  "originalPeriodFrom": "2024-04-01T00:00:00Z",
  "originalPeriodTo": "2024-06-30T00:00:00Z",
  "adjustmentAmount": 15000,
  "breakdown": {
    "basic": 10000,
    "hra": 3000,
    "allowances": 2000
  },
  "reason": "Annual salary revision",
  "applicableMonth": 7,
  "applicableYear": 2024,
  "isTaxable": true,
  "taxCalculationBasis": "original_period"
}
```

**Arrears Types:**
- `salary_revision`: Salary revision arrears
- `promotion`: Promotion-related arrears
- `retroactive_adjustment`: Retroactive salary adjustment
- `correction`: Correction of previous payroll
- `bonus_arrears`: Bonus arrears
- `allowance_adjustment`: Allowance adjustment arrears
- `other`: Other arrears

### Loan Management

#### Create Loan

**POST** `/api/payroll/loans`

Create an employee loan record.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "companyId": "uuid",
  "loanType": "personal_loan",
  "loanName": "Personal Loan - Home Renovation",
  "principalAmount": 500000,
  "interestRate": 12.5,
  "tenureMonths": 36,
  "startDate": "2024-01-01T00:00:00Z",
  "deductionStartMonth": 2,
  "deductionStartYear": 2024,
  "loanTerms": {
    "prepaymentAllowed": true,
    "prepaymentPenalty": 0
  }
}
```

**Loan Types:**
- `personal_loan`: Personal loan
- `advance_salary`: Salary advance
- `home_loan`: Home loan
- `vehicle_loan`: Vehicle loan
- `education_loan`: Education loan
- `medical_loan`: Medical loan
- `other`: Other loan types

**Response:** Loan object with calculated EMI and repayment schedule

#### Calculate EMI

**GET** `/api/payroll/loans/calculate-emi?principalAmount=500000&interestRate=12.5&tenureMonths=36`

Calculate EMI and view repayment schedule without creating a loan.

**Response:**
```json
{
  "success": true,
  "data": {
    "emiAmount": 16750,
    "totalAmount": 603000,
    "totalInterest": 103000,
    "repaymentSchedule": [...]
  }
}
```

#### Get Active Loans

**GET** `/api/payroll/loans/employee/:employeeId/active`

Get all active loans for an employee.

### Reimbursement Management

#### Create Reimbursement

**POST** `/api/payroll/reimbursements`

Create a reimbursement claim.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "companyId": "uuid",
  "reimbursementType": "travel",
  "description": "Client visit - Mumbai",
  "claimAmount": 15000,
  "claimDate": "2024-11-15T00:00:00Z",
  "documents": ["receipt1.pdf", "receipt2.pdf"],
  "expenseBreakdown": {
    "flight": 8000,
    "hotel": 5000,
    "food": 2000
  },
  "applicableMonth": 11,
  "applicableYear": 2024,
  "isTaxable": false,
  "taxExemptionLimit": 15000
}
```

**Reimbursement Types:**
- `travel`: Travel expenses
- `medical`: Medical expenses
- `meal`: Meal expenses
- `telephone`: Telephone expenses
- `internet`: Internet expenses
- `fuel`: Fuel expenses
- `conveyance`: Conveyance expenses
- `other`: Other expenses

#### Submit Reimbursement

**POST** `/api/payroll/reimbursements/:id/submit`

Submit a reimbursement for approval.

#### Approve Reimbursement

**POST** `/api/payroll/reimbursements/:id/approve`

Approve a reimbursement claim.

**Request Body:**
```json
{
  "approvedAmount": 15000
}
```

#### Reject Reimbursement

**POST** `/api/payroll/reimbursements/:id/reject`

Reject a reimbursement claim.

**Request Body:**
```json
{
  "rejectionReason": "Incomplete documentation"
}
```

### Tax Declaration Management

#### Create or Update Tax Declaration

**POST** `/api/payroll/tax-declarations`

Create or update employee tax-saving declarations.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "companyId": "uuid",
  "financialYear": "2024-2025",
  "declarations": {
    "section80C": {
      "ppf": 150000,
      "elss": 50000,
      "insurance": 100000
    },
    "section80D": {
      "healthInsurance": 25000
    },
    "section80G": {
      "donations": 10000
    },
    "section24": {
      "homeLoanInterest": 200000
    }
  }
}
```

#### Submit Tax Declaration

**POST** `/api/payroll/tax-declarations/:id/submit`

Submit a tax declaration for verification.

#### Verify Tax Declaration

**POST** `/api/payroll/tax-declarations/:id/verify`

Verify an employee's tax declaration.

**Request Body:**
```json
{
  "verifiedAmount": 285000,
  "notes": "All documents verified"
}
```

**Response:** Updated declaration with verification status

---

## Notes and Best Practices

1. **Template Configuration**: All template settings are stored in JSONB fields, allowing maximum flexibility for customization.

2. **Schedule Timing**: Generation time is in 24-hour format (HH:MM). Timezone should be specified using IANA timezone database names (e.g., `Asia/Kolkata`, `America/New_York`).

3. **Default Template**: Only one template can be default per company. Setting a new default automatically unsets the previous one.

4. **PDF Generation**: PDF generation requires Puppeteer. Ensure the service has necessary system dependencies installed.

5. **Variable Pay Approval**: Variable pay must be approved before it's included in payroll calculations.

6. **Loan EMI Calculation**: EMI is calculated using standard reducing balance method. The repayment schedule is generated automatically.

7. **Reimbursement Approval**: Only approved reimbursements are included in payroll. Approved amount can be less than or equal to claimed amount.

8. **Tax Declarations**: Tax declarations should be submitted before the financial year ends. Verified amounts are used in tax calculations.

9. **Generation Logs**: All payslip generation activities are logged for audit purposes.

10. **Pro-Rata Calculations**: The system automatically calculates pro-rata salary based on attendance data and approved leaves.


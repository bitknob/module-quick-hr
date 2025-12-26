# Employee Details Management API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/employee-details`

The Employee Details Management API provides comprehensive management of additional employee information including emergency contacts, bank details, government IDs, personal information, and more.

## Overview

The employee details system supports:
- Emergency contact information
- Bank account details
- Government ID numbers (PAN, Aadhaar, Passport, Driving License)
- Personal information (blood group, marital status, family details)
- Address information (permanent and current)
- Previous employment details
- Skills and languages
- Custom additional information (JSONB)

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Access Control

- **Create/Update Details:** All authenticated employees (for their own details) or admins/managers (for their employees)
- **View Details:** All authenticated users (with company-based filtering)

---

## Endpoints

### 1. Create or Update Employee Details

**Method:** `POST`  
**URL:** `/api/employee-details/:employeeId/:companyId`  
**Full URL:** `http://localhost:9400/api/employee-details/{employee_id}/{company_id}`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID

**Request Body:**
```json
{
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567890",
  "emergencyContactRelation": "Spouse",
  "bankAccountNumber": "1234567890",
  "bankName": "ABC Bank",
  "bankBranch": "Main Branch",
  "bankIFSC": "ABCD0123456",
  "panNumber": "ABCDE1234F",
  "aadhaarNumber": "1234 5678 9012",
  "passportNumber": "A12345678",
  "drivingLicenseNumber": "DL1234567890",
  "bloodGroup": "O+",
  "maritalStatus": "married",
  "spouseName": "Jane Doe",
  "fatherName": "John Senior",
  "motherName": "Mary Doe",
  "permanentAddress": "123 Main St, City, State, ZIP",
  "currentAddress": "456 Current St, City, State, ZIP",
  "previousEmployer": "Previous Company",
  "previousDesignation": "Senior Developer",
  "previousSalary": 80000.00,
  "noticePeriod": 30,
  "skills": ["JavaScript", "TypeScript", "Node.js", "React"],
  "languages": ["English", "Hindi", "Spanish"],
  "additionalInfo": {
    "customField1": "value1",
    "customField2": "value2"
  }
}
```

**Field Descriptions:**
- `emergencyContactName` (string, optional) - Emergency contact person name
- `emergencyContactPhone` (string, optional) - Emergency contact phone number
- `emergencyContactRelation` (string, optional) - Relationship to employee
- `bankAccountNumber` (string, optional) - Bank account number
- `bankName` (string, optional) - Bank name
- `bankBranch` (string, optional) - Bank branch name
- `bankIFSC` (string, optional) - Bank IFSC code
- `panNumber` (string, optional) - PAN card number
- `aadhaarNumber` (string, optional) - Aadhaar card number
- `passportNumber` (string, optional) - Passport number
- `drivingLicenseNumber` (string, optional) - Driving license number
- `bloodGroup` (string, optional) - Blood group
- `maritalStatus` (string, optional) - Marital status: `single`, `married`, `divorced`, `widowed`
- `spouseName` (string, optional) - Spouse name
- `fatherName` (string, optional) - Father's name
- `motherName` (string, optional) - Mother's name
- `permanentAddress` (string, optional) - Permanent address
- `currentAddress` (string, optional) - Current address
- `previousEmployer` (string, optional) - Previous employer name
- `previousDesignation` (string, optional) - Previous job designation
- `previousSalary` (number, optional) - Previous salary
- `noticePeriod` (number, optional) - Notice period in days
- `skills` (array of strings, optional) - List of skills
- `languages` (array of strings, optional) - List of languages spoken
- `additionalInfo` (object, optional) - Custom additional information (JSONB)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee detail saved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1234567890",
    "emergencyContactRelation": "Spouse",
    "bankAccountNumber": "1234567890",
    "bankName": "ABC Bank",
    "bankBranch": "Main Branch",
    "bankIFSC": "ABCD0123456",
    "panNumber": "ABCDE1234F",
    "aadhaarNumber": "1234 5678 9012",
    "passportNumber": "A12345678",
    "drivingLicenseNumber": "DL1234567890",
    "bloodGroup": "O+",
    "maritalStatus": "married",
    "spouseName": "Jane Doe",
    "fatherName": "John Senior",
    "motherName": "Mary Doe",
    "permanentAddress": "123 Main St, City, State, ZIP",
    "currentAddress": "456 Current St, City, State, ZIP",
    "previousEmployer": "Previous Company",
    "previousDesignation": "Senior Developer",
    "previousSalary": 80000.00,
    "noticePeriod": 30,
    "skills": ["JavaScript", "TypeScript", "Node.js", "React"],
    "languages": ["English", "Hindi", "Spanish"],
    "additionalInfo": {
      "customField1": "value1",
      "customField2": "value2"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/employee-details/{employee_id}/{company_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1234567890",
    "bankAccountNumber": "1234567890",
    "bankName": "ABC Bank",
    "panNumber": "ABCDE1234F"
  }'
```

**Notes:**
- This endpoint creates a new detail record if it doesn't exist, or updates the existing one
- All fields are optional - you can provide only the fields you want to set/update
- Partial updates are supported

---

### 2. Get Employee Details

**Method:** `GET`  
**URL:** `/api/employee-details/:employeeId`  
**Full URL:** `http://localhost:9400/api/employee-details/{employee_id}?companyId=company_uuid`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee detail retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1234567890",
    "emergencyContactRelation": "Spouse",
    "bankAccountNumber": "1234567890",
    "bankName": "ABC Bank",
    "bankBranch": "Main Branch",
    "bankIFSC": "ABCD0123456",
    "panNumber": "ABCDE1234F",
    "aadhaarNumber": "1234 5678 9012",
    "passportNumber": "A12345678",
    "drivingLicenseNumber": "DL1234567890",
    "bloodGroup": "O+",
    "maritalStatus": "married",
    "spouseName": "Jane Doe",
    "fatherName": "John Senior",
    "motherName": "Mary Doe",
    "permanentAddress": "123 Main St, City, State, ZIP",
    "currentAddress": "456 Current St, City, State, ZIP",
    "previousEmployer": "Previous Company",
    "previousDesignation": "Senior Developer",
    "previousSalary": 80000.00,
    "noticePeriod": 30,
    "skills": ["JavaScript", "TypeScript", "Node.js", "React"],
    "languages": ["English", "Hindi", "Spanish"],
    "additionalInfo": {
      "customField1": "value1",
      "customField2": "value2"
    },
    "employee": {
      "id": "employee_uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "employeeId": "EMP001"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/employee-details/{employee_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404 Not Found` - Employee detail not found

---

### 3. Update Employee Details

**Method:** `PUT`  
**URL:** `/api/employee-details/:employeeId/:companyId`  
**Full URL:** `http://localhost:9400/api/employee-details/{employee_id}/{company_id}`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID

**Request Body:**
```json
{
  "emergencyContactPhone": "+1987654321",
  "bankIFSC": "ABCD0987654",
  "skills": ["JavaScript", "TypeScript", "Node.js", "React", "Vue.js"],
  "additionalInfo": {
    "customField1": "updated_value1",
    "newField": "new_value"
  }
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee detail updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "emergencyContactPhone": "+1987654321",
    "bankIFSC": "ABCD0987654",
    "skills": ["JavaScript", "TypeScript", "Node.js", "React", "Vue.js"],
    "additionalInfo": {
      "customField1": "updated_value1",
      "newField": "new_value"
    },
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/employee-details/{employee_id}/{company_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emergencyContactPhone": "+1987654321",
    "skills": ["JavaScript", "TypeScript", "Node.js", "React", "Vue.js"]
  }'
```

**Notes:**
- Partial updates are supported - only provide fields you want to update
- If detail record doesn't exist, it will be created
- Arrays (skills, languages) are replaced entirely, not merged

---

### 4. Get All Employee Details by Company

**Method:** `GET`  
**URL:** `/api/employee-details/company/:companyId`  
**Full URL:** `http://localhost:9400/api/employee-details/company/{company_id}`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string, required) - Company UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee details retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "panNumber": "ABCDE1234F",
      "aadhaarNumber": "1234 5678 9012",
      "bankAccountNumber": "1234567890",
      "bankName": "ABC Bank",
      "employee": {
        "id": "employee_uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "employeeId": "EMP001"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/employee-details/company/{company_id} \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Returns all employee details for the specified company
- Useful for bulk operations and reporting

---

## Data Structure

### Emergency Contact Information
- `emergencyContactName` - Name of emergency contact
- `emergencyContactPhone` - Phone number
- `emergencyContactRelation` - Relationship (e.g., "Spouse", "Parent", "Sibling")

### Bank Details
- `bankAccountNumber` - Bank account number
- `bankName` - Name of the bank
- `bankBranch` - Branch name
- `bankIFSC` - IFSC code

### Government IDs
- `panNumber` - PAN card number
- `aadhaarNumber` - Aadhaar card number
- `passportNumber` - Passport number
- `drivingLicenseNumber` - Driving license number

### Personal Information
- `bloodGroup` - Blood group
- `maritalStatus` - Marital status (single, married, divorced, widowed)
- `spouseName` - Spouse name
- `fatherName` - Father's name
- `motherName` - Mother's name

### Address Information
- `permanentAddress` - Permanent address
- `currentAddress` - Current address

### Employment History
- `previousEmployer` - Previous employer name
- `previousDesignation` - Previous job designation
- `previousSalary` - Previous salary amount
- `noticePeriod` - Notice period in days

### Skills and Languages
- `skills` - Array of skill names
- `languages` - Array of language names

### Additional Information
- `additionalInfo` - JSONB field for custom data storage

## Integration Notes

- Employee details are linked to employees and companies for proper access control
- Details can be used for payroll processing (bank details)
- Government IDs can be cross-referenced with uploaded documents
- Emergency contacts are useful for HR operations
- Skills and languages can be used for talent management and matching

## Menu Structure

The Employee Details menu is available under the **Employees** menu:

- **Employees** (Main Menu)
  - **All Employees** - View all employees
  - **Create Employee** - Create new employee
  - **Employee Documents** - Manage employee documents
  - **Employee Details** - Manage employee details (all roles)

Employee details can be accessed from the employee profile page or through the dedicated Employee Details menu item.


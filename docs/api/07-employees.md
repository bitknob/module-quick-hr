# Employee Service Endpoints

[← Back to API Documentation Index](./README.md)

Base Path: `/api/employees`

All employee endpoints require authentication.

### 1. Get Current Employee

**Method:** `GET`  
**URL:** `/api/employees/me`  
**Full URL:** `http://localhost:9400/api/employees/me`  
**Authentication:** Required

**Enhanced Email Lookup:**
The endpoint now supports finding employee records using either personal email (`userEmail`) or company email (`userCompEmail`). This allows users who login with company email to access their employee profile seamlessly.

**Access Control:**

- **Regular Users:** Returns the employee record associated with the authenticated user. The system automatically finds the employee record using either personal or company email.
- **Super Admins / Provider Admins / Provider HR Staff:** If no employee record exists, returns user information indicating they are a Super Admin without an employee record (instead of 404).

**Response (200) - With Employee Record:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Current employee retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "userEmail": "john.doe@example.com",
    "companyId": "company_uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "userCompEmail": "john.doe@company.com",
    "phoneNumber": "+1234567890",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "managerId": "manager_uuid",
    "hireDate": "2024-01-01",
    "salary": 75000.0,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (200) - Super Admin Without Employee Record:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User information retrieved successfully (no employee record)",
    "responseDetail": ""
  },
  "response": {
    "id": "user_uuid",
    "userEmail": "admin@quickhr.com",
    "email": "admin@quickhr.com",
    "role": "super_admin",
    "isSuperAdmin": true,
    "hasEmployeeRecord": false
  }
}
```

**Response (200) - Regular User Without Employee Record:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee profile not found",
    "responseDetail": "Your employee profile has not been set up yet. Please contact your administrator."
  },
  "response": {
    "id": "user_uuid",
    "userEmail": "user@company.com",
    "email": "user@company.com",
    "role": "employee",
    "hasEmployeeRecord": false,
    "error": "Employee profile not found"
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:9400/api/employees/me \
  -H "Authorization: Bearer <access_token>"
```

**Enhanced Features:**

- **Smart Email Resolution:** Automatically finds employee records using either personal email or company email
- **Consistent Response Format:** Always returns 200 status with clear indicators about employee record existence
- **User-Friendly Error Messages:** Provides helpful guidance when employee records are not found
- **JWT Token Compatibility:** Uses `userId` field from JWT token for proper user identification

**Notes:**

- Super Admins, Provider Admins, and Provider HR Staff can access this endpoint even without an employee record
- The response for Super Admins without employee records includes `isSuperAdmin: true` and `hasEmployeeRecord: false` to help frontend applications adjust the UI accordingly
- Regular users (employees, managers, etc.) will receive a 200 response with `hasEmployeeRecord: false` if they don't have an employee record, allowing frontend applications to handle this gracefully
- The enhanced email lookup ensures users who login with company email can still access their employee profile

---

### 2. Get Current Employee Documents

**Method:** `GET`  
**URL:** `/api/employees/documents`  
**Full URL:** `http://localhost:9400/api/employees/documents?documentType=pan_card&status=verified`  
**Authentication:** Required

**Query Parameters:**

- `companyId` (string, optional) - Company ID for access control
- `documentType` (string, optional) - Filter by document type (see [Employee Documents API](./16-employee-documents.md) for available types)
- `status` (string, optional) - Filter by status: `pending`, `verified`, `rejected`, `expired`

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Documents retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "documentType": "pan_card",
      "documentName": "PAN Card",
      "fileUrl": "https://quick-hr.s3.ap-south-1.amazonaws.com/documents/pan_card.pdf",
      "status": "verified",
      "verifiedAt": "2024-01-16T14:00:00.000Z",
      "verifier": {
        "id": "verifier_uuid",
        "firstName": "Manager",
        "lastName": "Name",
        "employeeId": "MGR001"
      }
    }
  ]
}
```

**Response (200) - No Employee Record:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Documents retrieved successfully (no employee record)",
    "responseDetail": ""
  },
  "response": []
}
```

**cURL:**

```bash
curl -X GET "http://localhost:9400/api/employees/documents?documentType=pan_card&status=verified" \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**

- Returns documents for the authenticated user's employee record
- If the user doesn't have an employee record, returns an empty array
- For more information about document types and operations, see [Employee Documents API](./16-employee-documents.md)

---

### 3. Get Current Employee Details

**Method:** `GET`  
**URL:** `/api/employees/details`  
**Full URL:** `http://localhost:9400/api/employees/details?companyId=company_uuid`  
**Authentication:** Required

**Query Parameters:**

- `companyId` (string, optional) - Company ID for access control

**Response (200) - Success with Data:**

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
    "previousSalary": 80000.0,
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
      "userCompEmail": "john.doe@example.com",
      "employeeId": "EMP001"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response (200) - No Employee Record:**

> **Note:** Returns HTTP 200 with responseCode 404 in body to prevent UI error pages

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Employee record not found",
    "responseDetail": "Please create an employee profile to access this information."
  },
  "response": null
}
```

**HTTP Status:** `200 OK`

**Response (200) - No Employee Details:**

> **Note:** Returns HTTP 200 with responseCode 404 in body to prevent UI error pages

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Employee detail not found",
    "responseDetail": "No additional details have been added for this employee yet."
  },
  "response": null
}
```

**HTTP Status:** `200 OK`

**cURL:**

```bash
curl -X GET "http://localhost:9400/api/employees/details?companyId=company_uuid" \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**

- Returns employee details for the authenticated user's employee record
- **Always returns HTTP 200** - check `responseCode` in the response body for actual status
- If the user doesn't have an employee record, returns HTTP 200 with `responseCode: 404` in body
- If the employee record exists but details haven't been created, returns HTTP 200 with `responseCode: 404` in body
- This pattern prevents UI error pages from showing when data simply doesn't exist yet
- Frontend should check `response.header.responseCode` to determine if data was found
- For more information about employee details fields and operations, see [Employee Details API](./17-employee-details.md)

**Frontend Handling Example:**

```javascript
const response = await fetch('/api/employees/details', {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await response.json();

if (data.header.responseCode === 200) {
  // Data found - display it
  displayEmployeeDetails(data.response);
} else if (data.header.responseCode === 404) {
  // No data yet - show empty state or prompt to add details
  showEmptyState(data.header.responseMessage);
}
```

---

### 4. Create Employee

**Method:** `POST`  
**URL:** `/api/employees`  
**Full URL:** `http://localhost:9400/api/employees`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Request Body:**

**Request Body:**

```json
{
  "userEmail": "jane.smith@example.com",
  "companyId": "company_uuid",
  "companyName": "Acme Corp",
  "employeeId": "EMP002",
  "firstName": "Jane",
  "lastName": "Smith",
  "userCompEmail": "jane.smith@company.com",
  "phoneNumber": "+1234567891",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "jobTitle": "Senior Developer",
  "department": "Engineering",
  "managerId": "manager_uuid",
  "hireDate": "2024-01-15",
  "salary": 90000.0
}
```

**Response (201) - Success with User Account Created:**

```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Employee created successfully",
    "responseDetail": "User account created. Employee must change password on first login."
  },
  "response": {
    "employee": {
      "id": "uuid",
      "userEmail": "jane.smith@example.com",
      "companyId": "company_uuid",
      "employeeId": "EMP002",
      "firstName": "Jane",
      "lastName": "Smith",
      "userCompEmail": "jane.smith@company.com",
      "jobTitle": "Senior Developer",
      "department": "Engineering",
      "status": "active",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    "userCredentials": {
      "email": "jane.smith@example.com",
      "temporaryPassword": "Xy9@mK2pL5qR",
      "mustChangePassword": true
    }
  }
}
```

**Response (201) - Success but User Account Already Exists:**

```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Employee created successfully",
    "responseDetail": "Employee created. User account may already exist."
  },
  "response": {
    "employee": {
      "id": "uuid",
      "userEmail": "jane.smith@example.com",
      "companyId": "company_uuid",
      "employeeId": "EMP002",
      "firstName": "Jane",
      "lastName": "Smith",
      "userCompEmail": "jane.smith@company.com",
      "jobTitle": "Senior Developer",
      "department": "Engineering",
      "status": "active",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    "userCredentials": null
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:9400/api/employees \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "jane.smith@example.com",
    "companyId": "company_uuid",
    "companyName": "Acme Corp",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "userCompEmail": "jane.smith@company.com",
    "jobTitle": "Senior Developer",
    "department": "Engineering",
    "hireDate": "2024-01-15"
  }'
```

**Important Notes:**

- **Automatic User Account Creation:** When an employee is created, the system automatically creates a user account with a temporary password and sends a welcome email containing the company name and login credentials.
- **Login Credentials:** The response includes `userCredentials` with the email and temporary password that the employee can use to login.
- **First Login Password Change:** The `mustChangePassword` flag is set to `true`, requiring the employee to change their password on first login.
- **Security:** The temporary password is randomly generated with 12 characters including uppercase, lowercase, numbers, and special characters.
- **Existing Users:** If a user account already exists for the email, `userCredentials` will be `null` and the employee can use their existing credentials.
- **Welcome Email:** If email service is enabled, the system automatically sends a welcome email to the user with their credentials and the company name.

**Workflow:**

1. Admin creates employee record via this API (providing `companyName`).
2. System creates/checks user account:
   - If new user: Creates account with temporary password and sends welcome email.
   - If existing user: Links to existing account.
3. System creates employee record in database.
4. Response includes employee data and login credentials (if new user).
5. Employee receives welcome email with credentials.
6. Employee logs in with provided credentials.
7. System detects `mustChangePassword: true` and prompts for password change.
8. Employee sets their own password and can then access the system normally.

---

### 5. Get Employee by ID

**Method:** `GET`  
**URL:** `/api/employees/:id`  
**Full URL:** `http://localhost:9400/api/employees/{employee_id}`  
**Authentication:** Required  
**Access Control:** Based on role and hierarchy

**Path Parameters:**

- `id` (string, required) - Employee UUID

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "userId": "user_uuid",
    "companyId": "company_uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "userCompEmail": "john.doe@example.com",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "manager": {
      "id": "manager_uuid",
      "firstName": "Manager",
      "lastName": "Name",
      "userCompEmail": "manager@example.com",
      "jobTitle": "Engineering Manager"
    },
    "status": "active"
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:9400/api/employees/{employee_id} \
  -H "Authorization: Bearer <access_token>"
```

---

### 6. Update Employee

**Method:** `PUT`  
**URL:** `/api/employees/:id`  
**Full URL:** `http://localhost:9400/api/employees/{employee_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`  
**Access Control:** Based on role and hierarchy

**Path Parameters:**

- `id` (string, required) - Employee UUID

**Request Body:**

```json
{
  "firstName": "John Updated",
  "phoneNumber": "+1234567899",
  "jobTitle": "Senior Software Engineer",
  "salary": 85000.0
}
```

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "firstName": "John Updated",
    "phoneNumber": "+1234567899",
    "jobTitle": "Senior Software Engineer",
    "salary": 85000.0,
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**cURL:**

```bash
curl -X PUT http://localhost:9400/api/employees/{employee_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John Updated",
    "jobTitle": "Senior Software Engineer"
  }'
```

---

### 7. Delete Employee

**Method:** `DELETE`  
**URL:** `/api/employees/:id`  
**Full URL:** `http://localhost:9400/api/employees/{employee_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`  
**Access Control:** Based on role and hierarchy

**Path Parameters:**

- `id` (string, required) - Employee UUID

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**

```bash
curl -X DELETE http://localhost:9400/api/employees/{employee_id} \
  -H "Authorization: Bearer <access_token>"
```

---

### 8. Search Employees

**Method:** `GET`  
**URL:** `/api/employees/search`  
**Full URL:** `http://localhost:9400/api/employees/search?page=1&limit=20&searchTerm=john&department=Engineering`  
**Authentication:** Required

**Query Parameters:**

- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)
- `searchTerm` (string, optional) - Search in name, email, employeeId
- `department` (string, optional) - Filter by department
- `jobTitle` (string, optional) - Filter by job title
- `status` (string, optional) - Filter by status (active/inactive/terminated)
- `companyId` (string, optional) - Filter by company (for provider roles)

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employees retrieved successfully",
    "responseDetail": "Total: 50, Page: 1, Limit: 20, Total Pages: 3"
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "userCompEmail": "john.doe@example.com",
      "jobTitle": "Software Engineer",
      "department": "Engineering",
      "status": "active"
    }
  ]
}
```

**cURL:**

```bash
curl -X GET "http://localhost:9400/api/employees/search?page=1&limit=20&searchTerm=john&department=Engineering" \
  -H "Authorization: Bearer <access_token>"
```

---

### 9. Get Hierarchy Tree

**Method:** `GET`  
**URL:** `/api/employees/hierarchy`  
**Full URL:** `http://localhost:9400/api/employees/hierarchy?rootId=root_employee_id`  
**Authentication:** Required

**Query Parameters:**

- `rootId` (string, optional) - Root employee ID (default: top-level employees)
- `companyId` (string, optional) - Filter by company

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Hierarchy tree retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "employeeId": "uuid",
      "managerId": "manager_uuid",
      "level": 0,
      "path": ["uuid"]
    }
  ]
}
```

**cURL:**

```bash
curl -X GET "http://localhost:9400/api/employees/hierarchy?rootId=root_employee_id" \
  -H "Authorization: Bearer <access_token>"
```

---

### 10. Get Direct Reports

**Method:** `GET`  
**URL:** `/api/employees/manager/:managerId/direct-reports`  
**Full URL:** `http://localhost:9400/api/employees/manager/{manager_id}/direct-reports`  
**Authentication:** Required

**Path Parameters:**

- `managerId` (string, required) - Manager employee UUID

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Direct reports retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "EMP002",
      "firstName": "Jane",
      "lastName": "Smith",
      "userCompEmail": "jane.smith@example.com",
      "jobTitle": "Developer"
    }
  ]
}
```

**cURL:**

```bash
curl -X GET http://localhost:9400/api/employees/manager/{manager_id}/direct-reports \
  -H "Authorization: Bearer <access_token>"
```

---

### 11. Get All Subordinates

**Method:** `GET`  
**URL:** `/api/employees/manager/:managerId/subordinates`  
**Full URL:** `http://localhost:9400/api/employees/manager/{manager_id}/subordinates`  
**Authentication:** Required

**Path Parameters:**

- `managerId` (string, required) - Manager employee UUID

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "All subordinates retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "EMP002",
      "firstName": "Jane",
      "lastName": "Smith",
      "userCompEmail": "jane.smith@example.com",
      "jobTitle": "Developer",
      "department": "Engineering",
      "status": "active"
    }
  ]
}
```

**cURL:**

```bash
curl -X GET http://localhost:9400/api/employees/manager/{manager_id}/subordinates \
  -H "Authorization: Bearer <access_token>"
```

---

### 12. Transfer Employee

**Method:** `PUT`  
**URL:** `/api/employees/:id/transfer`  
**Full URL:** `http://localhost:9400/api/employees/{employee_id}/transfer`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`  
**Access Control:** Based on role and hierarchy

**Path Parameters:**

- `id` (string, required) - Employee UUID

**Request Body:**

```json
{
  "newManagerId": "new_manager_uuid"
}
```

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Employee transferred successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "managerId": "new_manager_uuid",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**cURL:**

```bash
curl -X PUT http://localhost:9400/api/employees/{employee_id}/transfer \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "newManagerId": "new_manager_uuid"
  }'
```

---

### 13. Bulk Assign Manager

**Method:** `POST`  
**URL:** `/api/employees/bulk-assign-manager`  
**Full URL:** `http://localhost:9400/api/employees/bulk-assign-manager`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Description:**
Assigns a manager to multiple employees simultaneously. The system validates hierarchy integrity to ensure no cycles are created (e.g., A reports to B, B reports to A).

**Request Body:**

```json
{
  "employeeIds": ["uuid_1", "uuid_2", "uuid_3"],
  "newManagerId": "manager_uuid"
}
```

**Request Body Parameters:**

- `employeeIds` (array of strings, required) - List of Employee IDs to be assigned
- `newManagerId` (string, required) - The ID of the manager to assign

**Response (200) - Success:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "All employees assigned successfully",
    "responseDetail": ""
  },
  "response": {
    "successCount": 3
  }
}
```

**Response (200) - Partial Success:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Partial success in assigning managers",
    "responseDetail": ""
  },
  "response": {
    "successCount": 2,
    "failureCount": 1,
    "errors": [
      {
        "employeeId": "uuid_3",
        "error": "Cannot assign manager: would create a cycle"
      }
    ]
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:9400/api/employees/bulk-assign-manager \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeIds": ["uuid_1", "uuid_2"],
    "newManagerId": "manager_uuid"
  }'
```

---

### 14. Get Potential Managers

**Method:** `GET`  
**URL:** `/api/employees/:id/potential-managers`  
**Full URL:** `http://localhost:9400/api/employees/{employee_id}/potential-managers?searchTerm=John`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Description:**
Retrieves a list of eligible managers for a specific employee. It automatically filters out the employee themselves and all their subordinates (recursively) to prevent hierarchy cycles.

**Query Parameters:**

- `searchTerm` (string, optional) - Filter by name, email, or employee ID
- `companyId` (string, optional) - Filter by company (for super/provider admins)

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Potential managers retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "manager_uuid_1",
      "firstName": "Alice",
      "lastName": "Manager",
      "email": "alice@company.com",
      "jobTitle": "Engineering Manager",
      "employeeId": "MGR001"
    },
    {
      "id": "manager_uuid_2",
      "firstName": "Bob",
      "lastName": "Director",
      "email": "bob@company.com",
      "jobTitle": "Director of Engineering",
      "employeeId": "DIR001"
    }
  ]
}
```

**cURL:**

```bash
curl -X GET "http://localhost:9400/api/employees/{employee_id}/potential-managers?searchTerm=John" \
  -H "Authorization: Bearer <access_token>"
```

---

## Related APIs

- [Employee Documents](./16-employee-documents.md) - Document upload and verification
- [Employee Details](./17-employee-details.md) - Additional employee information management

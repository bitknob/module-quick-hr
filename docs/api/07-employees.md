# Employee Service Endpoints

[← Back to API Documentation Index](./README.md)


Base Path: `/api/employees`

All employee endpoints require authentication.

### 1. Get Current Employee

**Method:** `GET`  
**URL:** `/api/employees/me`  
**Full URL:** `http://localhost:9400/api/employees/me`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Returns the employee record associated with the authenticated user. Returns 404 if no employee record exists.
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
    "userId": "user_uuid",
    "companyId": "company_uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "managerId": "manager_uuid",
    "hireDate": "2024-01-01",
    "salary": 75000.00,
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
    "id": null,
    "userId": "user_uuid",
    "email": "admin@quickhr.com",
    "role": "super_admin",
    "isSuperAdmin": true,
    "hasEmployeeRecord": false
  }
}
```

**Response (404) - Regular User Without Employee Record:**
```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Employee not found",
    "responseDetail": "Employee not found"
  },
  "response": null
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/employees/me \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Super Admins, Provider Admins, and Provider HR Staff can access this endpoint even without an employee record
- The response for Super Admins without employee records includes `isSuperAdmin: true` and `hasEmployeeRecord: false` to help frontend applications adjust the UI accordingly
- Regular users (employees, managers, etc.) will receive a 404 error if they don't have an employee record

---

### 2. Create Employee

**Method:** `POST`  
**URL:** `/api/employees`  
**Full URL:** `http://localhost:9400/api/employees`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Request Body:**
```json
{
  "userId": "user_uuid",
  "companyId": "company_uuid",
  "employeeId": "EMP002",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+1234567891",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "jobTitle": "Senior Developer",
  "department": "Engineering",
  "managerId": "manager_uuid",
  "hireDate": "2024-01-15",
  "salary": 90000.00
}
```

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Employee created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "userId": "user_uuid",
    "companyId": "company_uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "jobTitle": "Senior Developer",
    "department": "Engineering",
    "status": "active",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/employees \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_uuid",
    "companyId": "company_uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "jobTitle": "Senior Developer",
    "department": "Engineering",
    "hireDate": "2024-01-15"
  }'
```

---

### 3. Get Employee by ID

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
    "email": "john.doe@example.com",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "manager": {
      "id": "manager_uuid",
      "firstName": "Manager",
      "lastName": "Name",
      "email": "manager@example.com",
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

### 4. Update Employee

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
  "salary": 85000.00
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
    "salary": 85000.00,
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

### 5. Delete Employee

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

### 6. Search Employees

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
      "email": "john.doe@example.com",
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

### 7. Get Hierarchy Tree

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

### 8. Get Direct Reports

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
      "email": "jane.smith@example.com",
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

### 9. Get All Subordinates

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
      "email": "jane.smith@example.com",
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

### 10. Transfer Employee

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

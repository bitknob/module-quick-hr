# API Documentation

Base URL: `http://localhost:9400` (API Gateway)

All endpoints return a standardized response format:

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Success message",
    "responseDetail": "Additional details"
  },
  "response": {} // object or [] // array
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Auth Service Endpoints

Base Path: `/api/auth`

### 1. User Signup

**Method:** `POST`  
**URL:** `/api/auth/signup`  
**Full URL:** `http://localhost:9400/api/auth/signup`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "role": "employee"
}
```

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Account created successfully. Please check your email for verification.",
    "responseDetail": ""
  },
  "response": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "employee",
      "emailVerified": false
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890",
    "role": "employee"
  }'
```

---

### 2. User Login

**Method:** `POST`  
**URL:** `/api/auth/login`  
**Full URL:** `http://localhost:9400/api/auth/login`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Login successful",
    "responseDetail": ""
  },
  "response": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "employee",
      "emailVerified": true
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

---

### 3. Verify Email

**Method:** `GET`  
**URL:** `/api/auth/verify-email`  
**Full URL:** `http://localhost:9400/api/auth/verify-email?token=verification_token`  
**Authentication:** Not required

**Query Parameters:**
- `token` (string, required) - Email verification token

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Email verified successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/auth/verify-email?token=verification_token"
```

---

### 4. Resend Verification Email

**Method:** `POST`  
**URL:** `/api/auth/resend-verification`  
**Full URL:** `http://localhost:9400/api/auth/resend-verification`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Verification email sent successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### 5. Forgot Password

**Method:** `POST`  
**URL:** `/api/auth/forgot-password`  
**Full URL:** `http://localhost:9400/api/auth/forgot-password`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "If an account exists with this email, a password reset link has been sent.",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### 6. Reset Password

**Method:** `POST`  
**URL:** `/api/auth/reset-password`  
**Full URL:** `http://localhost:9400/api/auth/reset-password`  
**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Password reset successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token",
    "newPassword": "NewSecurePass123!"
  }'
```

---

### 7. Refresh Token

**Method:** `POST`  
**URL:** `/api/auth/refresh-token`  
**Full URL:** `http://localhost:9400/api/auth/refresh-token`  
**Authentication:** Not required

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Token refreshed successfully",
    "responseDetail": ""
  },
  "response": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_token"
  }'
```

---

### 8. Get Current User

**Method:** `GET`  
**URL:** `/api/auth/me`  
**Full URL:** `http://localhost:9400/api/auth/me`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "role": "employee",
    "emailVerified": true,
    "phoneVerified": false,
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

### 9. Change Password

**Method:** `POST`  
**URL:** `/api/auth/change-password`  
**Full URL:** `http://localhost:9400/api/auth/change-password`  
**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Password changed successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!"
  }'
```

---

## Employee Service Endpoints

Base Path: `/api/employees`

All employee endpoints require authentication.

### 1. Get Current Employee

**Method:** `GET`  
**URL:** `/api/employees/me`  
**Full URL:** `http://localhost:9400/api/employees/me`  
**Authentication:** Required

**Response (200):**
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

**cURL:**
```bash
curl -X GET http://localhost:9400/api/employees/me \
  -H "Authorization: Bearer <access_token>"
```

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

## Health Check Endpoints

### API Gateway Health

**Method:** `GET`  
**URL:** `/health`  
**Full URL:** `http://localhost:9400/health`  
**Authentication:** Not required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "API Gateway is healthy",
    "responseDetail": ""
  },
  "response": {
    "status": "ok",
    "service": "api-gateway",
    "services": {
      "auth": "http://localhost:9401",
      "employee": "http://localhost:9402"
    }
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/health
```

---

## Error Responses

All errors follow the standard response format:

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Error message",
    "responseDetail": "Detailed error information"
  },
  "response": null
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## Authentication Flow

1. **Signup/Login** → Receive `accessToken` and `refreshToken`
2. **Include token** in all authenticated requests: `Authorization: Bearer <accessToken>`
3. **Token expires** → Use `refreshToken` to get new tokens
4. **Email verification** required for full access

---

## Access Control Rules

- **Super Admin / Provider Admin / Provider HR Staff**: Access to all companies
- **HRBP / Company Admin**: Access to assigned company only
- **Department Head / Manager**: Access to their team and below (hierarchy-based)
- **Employee**: Access to own data only

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- UUIDs are used for all IDs
- Pagination starts at page 1
- Default limit is 20 items per page
- All timestamps are in UTC


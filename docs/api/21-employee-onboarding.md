# Employee Onboarding API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/employees`

All employee onboarding endpoints require authentication and admin privileges.

## Overview

The Employee Onboarding API provides a streamlined way to onboard new employees by combining user account creation, role assignment, and employee record creation into a single atomic operation. This simplifies the onboarding process and ensures data consistency.

## Endpoints

### 1. Onboard New Employee

Create a new user account, assign a role, and create an employee record with company association in a single API call.

**Method:** `POST`  
**URL:** `/api/employees/onboard`  
**Full URL:** `http://localhost:9400/api/employees/onboard`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Request Body:**

```json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "role": "employee",
  "companyId": "company-uuid",
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St, City, State, ZIP",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "managerId": "manager-uuid",
  "hireDate": "2024-01-15",
  "salary": 75000.0
}
```

**Request Body Parameters:**

**User Account Fields:**

- `email` (string, required) - User email address (must be unique)
- `password` (string, required) - User password (min 8 chars, must contain uppercase, lowercase, number, and special character)
- `phoneNumber` (string, optional) - User phone number
- `role` (string, optional) - User role. Default: `employee`. Options: `employee`, `manager`, `department_head`, `company_admin`, `hrbp`, `provider_hr_staff`, `provider_admin`, `super_admin`

**Employee Record Fields:**

- `companyId` (string, required) - Company UUID
- `employeeId` (string, required) - Employee ID (must be unique within company)
- `firstName` (string, required) - Employee first name
- `lastName` (string, required) - Employee last name
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD)
- `address` (string, optional) - Employee address
- `jobTitle` (string, required) - Job title
- `department` (string, required) - Department name
- `managerId` (string, optional) - Manager employee UUID
- `hireDate` (string, required) - Hire date (YYYY-MM-DD)
- `salary` (number, optional) - Employee salary

**Response (201):**

```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Employee onboarded successfully",
    "responseDetail": "User account created, role assigned, and employee record created"
  },
  "response": {
    "user": {
      "id": "user-uuid",
      "email": "john.doe@company.com",
      "phoneNumber": "+1234567890",
      "role": "employee",
      "emailVerified": false,
      "phoneVerified": false,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "employee": {
      "id": "employee-uuid",
      "userId": "user-uuid",
      "companyId": "company-uuid",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15",
      "address": "123 Main St, City, State, ZIP",
      "jobTitle": "Software Engineer",
      "department": "Engineering",
      "managerId": "manager-uuid",
      "hireDate": "2024-01-15",
      "salary": 75000.0,
      "status": "active",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**400 - Validation Error:**

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Invalid email address",
    "responseDetail": ""
  },
  "response": null
}
```

**400 - Password Requirements:**

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "responseDetail": ""
  },
  "response": null
}
```

**403 - Insufficient Permissions:**

```json
{
  "header": {
    "responseCode": 403,
    "responseMessage": "Insufficient permissions to onboard employees",
    "responseDetail": ""
  },
  "response": null
}
```

**409 - Email Already Exists:**

```json
{
  "header": {
    "responseCode": 409,
    "responseMessage": "Email already registered",
    "responseDetail": ""
  },
  "response": null
}
```

**409 - Employee ID Already Exists:**

```json
{
  "header": {
    "responseCode": 409,
    "responseMessage": "Employee ID already exists in this company",
    "responseDetail": ""
  },
  "response": null
}
```

**404 - Company Not Found:**

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Company not found",
    "responseDetail": ""
  },
  "response": null
}
```

**404 - Manager Not Found:**

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Manager not found",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**

```bash
curl -X POST http://localhost:9400/api/employees/onboard \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890",
    "role": "employee",
    "companyId": "company-uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "hireDate": "2024-01-15",
    "salary": 75000.00
  }'
```

**Notes:**

- This endpoint performs an **atomic operation** - either all steps succeed or all fail
- Creates user account, assigns role, and creates employee record in a single transaction
- Returns both user and employee data along with authentication tokens
- The new user will receive a verification email (if email sending is enabled)
- Password must meet security requirements: min 8 characters, uppercase, lowercase, number, and special character
- Only administrators can onboard new employees
- The `employeeId` must be unique within the company
- If `role` is not specified, defaults to `employee`
- Super admin role can only be assigned by existing super admins

---

### 2. Onboard Existing User as Employee

Associate an existing user account with a company by creating an employee record. Use this when a user account already exists but needs to be added to a company.

**Method:** `POST`  
**URL:** `/api/employees/onboard-existing`  
**Full URL:** `http://localhost:9400/api/employees/onboard-existing`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Request Body:**

```json
{
  "userId": "existing-user-uuid",
  "companyId": "company-uuid",
  "employeeId": "EMP002",
  "firstName": "Jane",
  "lastName": "Smith",
  "jobTitle": "Senior Developer",
  "department": "Engineering",
  "managerId": "manager-uuid",
  "hireDate": "2024-01-15",
  "salary": 90000.0
}
```

**Request Body Parameters:**

- `userId` (string, required) - Existing user UUID
- `companyId` (string, required) - Company UUID
- `employeeId` (string, required) - Employee ID (must be unique within company)
- `firstName` (string, required) - Employee first name
- `lastName` (string, required) - Employee last name
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD)
- `address` (string, optional) - Employee address
- `jobTitle` (string, required) - Job title
- `department` (string, required) - Department name
- `managerId` (string, optional) - Manager employee UUID
- `hireDate` (string, required) - Hire date (YYYY-MM-DD)
- `salary` (number, optional) - Employee salary

**Response (201):**

```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Employee record created successfully",
    "responseDetail": "Existing user associated with company"
  },
  "response": {
    "id": "employee-uuid",
    "userId": "existing-user-uuid",
    "companyId": "company-uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "jobTitle": "Senior Developer",
    "department": "Engineering",
    "managerId": "manager-uuid",
    "hireDate": "2024-01-15",
    "salary": 90000.0,
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - User Already Has Employee Record:**

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "User already has an employee record",
    "responseDetail": "This user is already associated with a company"
  },
  "response": null
}
```

**404 - User Not Found:**

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "User not found",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**

```bash
curl -X POST http://localhost:9400/api/employees/onboard-existing \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "existing-user-uuid",
    "companyId": "company-uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "jobTitle": "Senior Developer",
    "department": "Engineering",
    "hireDate": "2024-01-15"
  }'
```

**Notes:**

- Use this endpoint when a user account already exists (e.g., they signed up independently)
- Only creates the employee record - does not modify user account or role
- The user must exist in the auth system before calling this endpoint
- A user can only have one employee record (one company association)
- To change a user's role, use the [User Role Assignment API](./20-user-role-assignment.md)

---

## Common Use Cases

### Use Case 1: Onboarding a Brand New Employee

When hiring someone who has never used the system:

```bash
# Single API call to create everything
curl -X POST http://localhost:9400/api/employees/onboard \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemployee@company.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890",
    "role": "employee",
    "companyId": "company-uuid",
    "employeeId": "EMP001",
    "firstName": "New",
    "lastName": "Employee",
    "jobTitle": "Junior Developer",
    "department": "Engineering",
    "hireDate": "2024-01-15"
  }'
```

### Use Case 2: Onboarding a Manager

When hiring a manager with elevated permissions:

```bash
curl -X POST http://localhost:9400/api/employees/onboard \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@company.com",
    "password": "SecurePass123!",
    "role": "manager",
    "companyId": "company-uuid",
    "employeeId": "MGR001",
    "firstName": "John",
    "lastName": "Manager",
    "jobTitle": "Engineering Manager",
    "department": "Engineering",
    "hireDate": "2024-01-15"
  }'
```

### Use Case 3: Adding Existing User to Company

When someone already has a user account but needs to join a company:

```bash
# First, get the user's ID (search by email)
curl -X GET "http://localhost:9400/api/auth/users/email/existing@company.com/role" \
  -H "Authorization: Bearer <admin_token>"

# Then create employee record
curl -X POST http://localhost:9400/api/employees/onboard-existing \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-from-search",
    "companyId": "company-uuid",
    "employeeId": "EMP003",
    "firstName": "Existing",
    "lastName": "User",
    "jobTitle": "Developer",
    "department": "Engineering",
    "hireDate": "2024-01-15"
  }'
```

---

## Comparison with Traditional Flow

### Traditional Approach (3 API Calls)

```bash
# Step 1: Create user account
POST /api/auth/signup
{
  "email": "user@company.com",
  "password": "SecurePass123!"
}

# Step 2: Assign role
POST /api/auth/assign-role
{
  "userId": "user-uuid",
  "role": "employee"
}

# Step 3: Create employee record
POST /api/employees
{
  "userId": "user-uuid",
  "companyId": "company-uuid",
  "employeeId": "EMP001",
  ...
}
```

### Onboarding API (1 API Call)

```bash
# Single call does everything
POST /api/employees/onboard
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "role": "employee",
  "companyId": "company-uuid",
  "employeeId": "EMP001",
  ...
}
```

**Benefits:**

- ✅ Single API call instead of 3
- ✅ Atomic operation (all or nothing)
- ✅ Simpler frontend code
- ✅ Reduced risk of partial completion
- ✅ Better error handling

---

## Security Considerations

### Authentication

- All endpoints require a valid JWT access token
- Tokens must be included in the `Authorization` header as `Bearer <token>`

### Authorization

- Only administrators can onboard employees
- Roles: `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`
- Super admin role can only be assigned by existing super admins

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

### Data Validation

- Email must be unique across the system
- Employee ID must be unique within the company
- Company must exist
- Manager (if specified) must exist and belong to the same company

---

## Related APIs

- [Auth Service](./02-auth.md) - User authentication and account management
- [Employee Service](./07-employees.md) - Employee records and management
- [User Role Assignment](./20-user-role-assignment.md) - Assign and manage user roles
- [Company Service](./05-companies.md) - Company management
- [Department Service](./06-departments.md) - Department management

---

## Troubleshooting

### Common Issues

**Issue: "Email already registered"**

- **Cause**: A user account with this email already exists
- **Solution**: Use the `onboard-existing` endpoint instead, or use a different email

**Issue: "Employee ID already exists in this company"**

- **Cause**: The employee ID is already in use within the company
- **Solution**: Use a different employee ID

**Issue: "Password must contain..."**

- **Cause**: Password doesn't meet security requirements
- **Solution**: Ensure password has min 8 chars, uppercase, lowercase, number, and special character

**Issue: "Company not found"**

- **Cause**: The specified company UUID doesn't exist
- **Solution**: Verify the company ID is correct and the company exists

**Issue: "Insufficient permissions to onboard employees"**

- **Cause**: Current user doesn't have admin privileges
- **Solution**: Ensure you're authenticated as an admin role

### Getting Help

If you encounter issues not covered here:

1. Check the application logs for detailed error messages
2. Verify your authentication token is valid
3. Ensure all required fields are provided
4. Contact your system administrator for assistance

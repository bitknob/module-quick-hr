# User Role Assignment API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/auth`

All role assignment endpoints require authentication.

## Overview

The User Role Assignment API allows administrators to assign and manage user roles within the system. This is essential for controlling access permissions and defining what actions users can perform.

## Available Roles

The system supports the following roles (in hierarchical order):

1. **super_admin** - Full system access
2. **provider_admin** - Provider-level administration
3. **provider_hr_staff** - Provider HR operations
4. **hrbp** - HR Business Partner
5. **company_admin** - Company-level administration
6. **department_head** - Department management
7. **manager** - Team management
8. **employee** - Basic employee access

---

## Endpoints

### 1. Assign Role to User/Employee

Assign a specific role to a user. This updates the user's permissions across the entire system.

**Method:** `POST`  
**URL:** `/api/auth/assign-role`  
**Full URL:** `http://localhost:9400/api/auth/assign-role`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

**Request Body:**

```json
{
  "userId": "user-uuid-here",
  "role": "company_admin"
}
```

**Request Body Parameters:**

- `userId` (string, required) - UUID of the user to assign the role to
- `role` (string, required) - Role to assign. Must be one of: `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`, `employee`

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Role assigned successfully",
    "responseDetail": "User role updated to company_admin"
  },
  "response": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "role": "company_admin",
    "emailVerified": true,
    "phoneVerified": false,
    "updatedAt": "2026-01-11T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid Request:**

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Invalid user ID format",
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
    "responseMessage": "Insufficient permissions to assign roles",
    "responseDetail": ""
  },
  "response": null
}
```

**403 - Cannot Assign Super Admin (for non-super-admins):**

```json
{
  "header": {
    "responseCode": 403,
    "responseMessage": "Only super admins can assign super admin role",
    "responseDetail": ""
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
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "role": "company_admin"
  }'
```

**Notes:**

- Only `super_admin` and `provider_admin` can assign roles
- Only `super_admin` can assign the `super_admin` role
- The role change is logged for audit purposes
- Changing a user's role immediately affects their permissions system-wide

---

### 2. Get User Role by User ID

Retrieve role information for a specific user by their user ID.

**Method:** `GET`  
**URL:** `/api/auth/users/:userId/role`  
**Full URL:** `http://localhost:9400/api/auth/users/{user_id}/role`  
**Authentication:** Required  
**Access Control:** Users can view their own role; admins can view any user's role

**Path Parameters:**

- `userId` (string, required) - User UUID

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User role retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "role": "company_admin",
    "emailVerified": true,
    "phoneVerified": false,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-11T10:30:00.000Z"
  }
}
```

**Error Responses:**

**403 - Insufficient Permissions:**

```json
{
  "header": {
    "responseCode": 403,
    "responseMessage": "Insufficient permissions to view this user role",
    "responseDetail": ""
  },
  "response": null
}
```

**User Not Found (HTTP 200 with responseCode 404):**

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "User not found",
    "responseDetail": "No user found with ID: {userId}"
  },
  "response": null
}
```

**HTTP Status:** `200 OK`

**Note:** This endpoint returns HTTP 200 even when the user is not found. Check the `responseCode` field in the response body to determine if the user exists. This prevents frontend error pages for normal "user not found" scenarios.

**cURL:**

```bash
curl -X GET http://localhost:9400/api/auth/users/{user_id}/role \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**

- Users can always view their own role information
- `super_admin`, `provider_admin`, and `provider_hr_staff` can view any user's role
- Returns comprehensive user information including verification status
- Returns HTTP 200 with `responseCode: 404` when user not found (see note above)
- Frontend should check `responseCode` field to determine if user exists

---

### 3. Get User Role by Email

Retrieve role information for a specific user by their email address.

**Method:** `GET`  
**URL:** `/api/auth/users/email/:email/role`  
**Full URL:** `http://localhost:9400/api/auth/users/email/{email}/role`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`

**Path Parameters:**

- `email` (string, required) - User email address

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User role retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "role": "company_admin",
    "emailVerified": true,
    "phoneVerified": false,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-11T10:30:00.000Z"
  }
}
```

**Error Responses:**

**403 - Insufficient Permissions:**

```json
{
  "header": {
    "responseCode": 403,
    "responseMessage": "Insufficient permissions to search users by email",
    "responseDetail": ""
  },
  "response": null
}
```

**User Not Found (HTTP 200 with responseCode 404):**

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "User not found",
    "responseDetail": "No user found with email: {email}"
  },
  "response": null
}
```

**HTTP Status:** `200 OK`

**Note:** This endpoint returns HTTP 200 even when the user is not found. Check the `responseCode` field in the response body to determine if the user exists. This prevents frontend error pages for normal "user not found" scenarios.

**cURL:**

```bash
curl -X GET http://localhost:9400/api/auth/users/email/user@example.com/role \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**

- Only administrators can search for users by email
- Email search is case-insensitive
- Useful for looking up users before assigning roles
- Returns HTTP 200 with `responseCode: 404` when user not found (see note above)
- Frontend should check `responseCode` field to determine if user exists

---

## Common Use Cases

### Assigning a Role to a New Employee

1. First, create a user account (via signup or admin creation)
2. Use the assign role endpoint to set their appropriate role
3. The employee can then log in with their assigned permissions

**Example Flow:**

```bash
# Step 1: Create user (if not already created)
# User signs up or admin creates account

# Step 2: Assign role
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "new-employee-uuid",
    "role": "employee"
  }'
```

### Promoting an Employee to Manager

```bash
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "employee-uuid",
    "role": "manager"
  }'
```

### Checking Current Role Before Making Changes

```bash
# Get current role
curl -X GET http://localhost:9400/api/auth/users/{user_id}/role \
  -H "Authorization: Bearer <admin_token>"

# Then assign new role if needed
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "role": "department_head"
  }'
```

---

## Role Assignment Rules

### Permission Requirements

| Action                               | Required Role                                        |
| ------------------------------------ | ---------------------------------------------------- |
| Assign any role (except super_admin) | `provider_admin`                                     |
| Assign super_admin role              | `super_admin`                                        |
| View own role                        | Any authenticated user                               |
| View other user's role               | `super_admin`, `provider_admin`, `provider_hr_staff` |
| Search user by email                 | `super_admin`, `provider_admin`, `provider_hr_staff` |

### Role Hierarchy

When assigning roles, consider the hierarchy:

- `super_admin` > `provider_admin` > `provider_hr_staff` > `hrbp` > `company_admin` > `department_head` > `manager` > `employee`

### Best Practices

1. **Principle of Least Privilege**: Assign the minimum role necessary for the user to perform their job
2. **Regular Audits**: Periodically review user roles to ensure they're still appropriate
3. **Document Changes**: The system automatically logs role changes for audit purposes
4. **Test Permissions**: After assigning a role, verify the user has the expected permissions
5. **Avoid Over-Privileging**: Don't assign admin roles unless absolutely necessary

---

## Integration with Employee Records

### Understanding the Relationship

- **User Account**: Created in the auth service, contains authentication and role information
- **Employee Record**: Created in the employee service, contains employment details

### Typical Workflow

1. **Create User Account** (Auth Service)

   - User signs up or admin creates account
   - Default role: `employee`

2. **Assign Appropriate Role** (Auth Service - This API)

   - Use `/api/auth/assign-role` to set the correct role
   - Role determines system-wide permissions

3. **Create Employee Record** (Employee Service)
   - Link to user account via `userId`
   - Contains job details, department, manager, etc.

### Example: Onboarding a New Manager

```bash
# Step 1: User signs up (or admin creates account)
curl -X POST http://localhost:9400/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.manager@company.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890"
  }'

# Step 2: Assign manager role
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-from-step-1",
    "role": "manager"
  }'

# Step 3: Create employee record
curl -X POST http://localhost:9400/api/employees \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-from-step-1",
    "companyId": "company-uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "new.manager@company.com",
    "jobTitle": "Engineering Manager",
    "department": "Engineering",
    "hireDate": "2026-01-11"
  }'
```

---

## Security Considerations

### Authentication

- All endpoints require a valid JWT access token
- Tokens must be included in the `Authorization` header as `Bearer <token>`

### Authorization

- Role assignment is restricted to administrators
- Super admin role can only be assigned by existing super admins
- Users can only view their own role unless they have admin privileges

### Audit Logging

- All role changes are automatically logged
- Logs include: user ID, old role, new role, who made the change, and timestamp
- Logs are stored for compliance and security auditing

### Rate Limiting

- Consider implementing rate limiting on role assignment endpoints
- Prevents abuse and unauthorized role escalation attempts

---

## Related APIs

- [Auth Service](./02-auth.md) - User authentication and account management
- [Employee Service](./07-employees.md) - Employee records and management
- [Role Management](./11-roles.md) - Custom role creation and hierarchy

---

## Troubleshooting

### Common Issues

**Issue: "Insufficient permissions to assign roles"**

- **Cause**: Current user doesn't have admin privileges
- **Solution**: Ensure you're authenticated as `super_admin` or `provider_admin`

**Issue: "Only super admins can assign super admin role"**

- **Cause**: Attempting to assign super_admin role without being a super admin
- **Solution**: Only super admins can create other super admins

**Issue: "User not found"**

- **Cause**: Invalid user ID or user doesn't exist
- **Solution**: Verify the user ID is correct and the user account exists

**Issue: "Invalid role specified"**

- **Cause**: Role name is misspelled or not a valid role
- **Solution**: Use one of the valid roles: `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`, `employee`

### Getting Help

If you encounter issues not covered here:

1. Check the application logs for detailed error messages
2. Verify your authentication token is valid
3. Ensure the user account exists before assigning a role
4. Contact your system administrator for assistance

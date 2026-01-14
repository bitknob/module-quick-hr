# User Role Assignment Implementation Summary

## Overview

This document summarizes the implementation of the User Role Assignment API for the Quick HR system.

## What Was Created

### 1. Backend Service Methods

**File:** `/services/auth-service/src/services/auth.service.ts`

Added three new methods to the `AuthService` class:

- **`assignUserRole(userId, role, assignedBy)`** - Assigns a role to a user

  - Validates user exists
  - Validates role is valid
  - Updates user's role
  - Logs the change for audit purposes

- **`getUserWithRole(userId)`** - Retrieves user with role information

  - Returns user details including role
  - Excludes sensitive information (password)

- **`getUserByEmailWithRole(email)`** - Retrieves user by email with role information
  - Case-insensitive email search
  - Returns user details including role

### 2. Controller Functions

**File:** `/services/auth-service/src/controllers/auth.controller.ts`

Added three new controller functions:

- **`assignUserRole`** - POST endpoint handler

  - Validates request body
  - Checks permissions (only super_admin and provider_admin can assign roles)
  - Prevents non-super-admins from assigning super_admin role
  - Returns updated user information

- **`getUserRole`** - GET endpoint handler

  - Retrieves user role by user ID
  - Users can view their own role
  - Admins can view any user's role

- **`getUserRoleByEmail`** - GET endpoint handler
  - Retrieves user role by email
  - Admin-only access
  - Case-insensitive email search

### 3. API Routes

**File:** `/services/auth-service/src/routes/auth.routes.ts`

Added three new routes:

- **`POST /api/auth/assign-role`** - Assign role to user
  - Requires authentication
  - Requires super_admin or provider_admin role
- **`GET /api/auth/users/:userId/role`** - Get user role by ID

  - Requires authentication
  - Users can view own role, admins can view any

- **`GET /api/auth/users/email/:email/role`** - Get user role by email
  - Requires authentication
  - Admin-only access

### 4. API Documentation

**File:** `/docs/api/20-user-role-assignment.md`

Comprehensive documentation including:

- Overview of available roles
- Detailed endpoint documentation with examples
- Request/response formats
- Error responses
- cURL examples
- Common use cases
- Integration with employee records
- Security considerations
- Troubleshooting guide

**Updated Files:**

- `/docs/api/README.md` - Added link to new documentation
- `/API_DOCUMENTATION.md` - Added reference to new documentation

## API Endpoints

### 1. Assign Role to User

```
POST /api/auth/assign-role
```

**Request:**

```json
{
  "userId": "user-uuid",
  "role": "company_admin"
}
```

**Response:**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Role assigned successfully",
    "responseDetail": "User role updated to company_admin"
  },
  "response": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "company_admin",
    ...
  }
}
```

### 2. Get User Role by ID

```
GET /api/auth/users/:userId/role
```

### 3. Get User Role by Email

```
GET /api/auth/users/email/:email/role
```

## Available Roles

1. **super_admin** - Full system access
2. **provider_admin** - Provider-level administration
3. **provider_hr_staff** - Provider HR operations
4. **hrbp** - HR Business Partner
5. **company_admin** - Company-level administration
6. **department_head** - Department management
7. **manager** - Team management
8. **employee** - Basic employee access

## Permission Matrix

| Action                               | Required Role                                  |
| ------------------------------------ | ---------------------------------------------- |
| Assign any role (except super_admin) | provider_admin                                 |
| Assign super_admin role              | super_admin                                    |
| View own role                        | Any authenticated user                         |
| View other user's role               | super_admin, provider_admin, provider_hr_staff |
| Search user by email                 | super_admin, provider_admin, provider_hr_staff |

## Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **Role-Based Authorization** - Only admins can assign roles
3. **Super Admin Protection** - Only super admins can assign super admin role
4. **Audit Logging** - All role changes are logged with timestamp and who made the change
5. **Input Validation** - Request data is validated using Zod schemas

## Integration Example

### Onboarding a New Manager

```bash
# Step 1: User signs up
curl -X POST http://localhost:9400/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@company.com",
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
    "email": "manager@company.com",
    "jobTitle": "Engineering Manager",
    "department": "Engineering",
    "hireDate": "2026-01-11"
  }'
```

## Testing the API

### Test 1: Assign Role

```bash
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-uuid",
    "role": "manager"
  }'
```

### Test 2: Get User Role

```bash
curl -X GET http://localhost:9400/api/auth/users/test-user-uuid/role \
  -H "Authorization: Bearer <token>"
```

### Test 3: Search by Email

```bash
curl -X GET http://localhost:9400/api/auth/users/email/user@example.com/role \
  -H "Authorization: Bearer <admin_token>"
```

## Files Modified

1. `/services/auth-service/src/services/auth.service.ts` - Added service methods
2. `/services/auth-service/src/controllers/auth.controller.ts` - Added controller functions
3. `/services/auth-service/src/routes/auth.routes.ts` - Added API routes
4. `/docs/api/20-user-role-assignment.md` - Created comprehensive documentation
5. `/docs/api/README.md` - Updated index
6. `/API_DOCUMENTATION.md` - Updated main documentation

## Next Steps

1. **Test the API** - Use the cURL examples to test the endpoints
2. **Review Documentation** - Check `/docs/api/20-user-role-assignment.md` for detailed usage
3. **Integrate with Frontend** - Use these endpoints in your frontend application
4. **Set Up Monitoring** - Monitor role assignment logs for security auditing

## Notes

- The API is fully integrated with the existing auth service
- All changes follow the existing code patterns and conventions
- Documentation follows the same format as other API docs
- Security best practices are implemented
- Audit logging is automatic for all role changes

## Support

For questions or issues:

1. Check the troubleshooting section in the documentation
2. Review the API examples
3. Check application logs for detailed error messages

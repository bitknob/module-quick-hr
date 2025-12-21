# User Module Management Service Endpoints

[← Back to API Documentation Index](./README.md)

Base Path: `/api/user-modules`

All user module management endpoints require authentication and are restricted to **Super Admin** and **Provider Admin** roles, unless otherwise specified.

## Overview

The User Module Management API provides the ability to assign specific modules to users at hierarchy levels 2, 3, and 4. This allows multiple users at the same level to handle different parts of the system. For example, one user at level 2 can handle employee management while another handles payroll.

### Supported Hierarchy Levels

Module assignments are only available for:
- **Level 2** - Provider Admin
- **Level 3** - Provider HR Staff
- **Level 4** - HRBP

### Available Modules

The following modules can be assigned to users:

- `employees` - Employee Management
- `payroll` - Payroll Management
- `leave` - Leave Management
- `attendance` - Attendance Management
- `approvals` - Approval Management
- `departments` - Department Management
- `companies` - Company Management
- `reports` - Reports & Analytics
- `settings` - Settings Management

### Use Cases

1. **Multiple Provider Admins (Level 2)**: Different admins can handle different modules
   - Admin A: Handles employees and departments
   - Admin B: Handles payroll and reports

2. **Provider HR Staff (Level 3)**: Specialized staff for different functions
   - Staff A: Handles leave and attendance
   - Staff B: Handles approvals and reports

3. **HRBP (Level 4)**: Company-specific HR partners with module specialization
   - HRBP A: Handles employees and leave for Company X
   - HRBP B: Handles payroll and attendance for Company X

---

## 1. Assign Module to User

**Method:** `POST`  
**URL:** `/api/user-modules`  
**Full URL:** `http://localhost:9401/api/user-modules`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Assigns a specific module to a user at level 2, 3, or 4.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "moduleKey": "employees",
  "moduleName": "Employee Management"
}
```

**Required Fields:**
- `userId` (string, required) - UUID of the user (must be at level 2, 3, or 4)
- `moduleKey` (string, required) - Module key (must be one of the valid module keys)

**Optional Fields:**
- `moduleName` (string, optional) - Display name for the module (defaults to standard name if not provided)

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Module assigned successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "user-module-uuid",
    "userId": "user-uuid",
    "moduleKey": "employees",
    "moduleName": "Employee Management",
    "isActive": true,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9401/api/user-modules \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "moduleKey": "employees"
  }'
```

**Validation Rules:**
- User must exist and be at hierarchy level 2, 3, or 4
- Module key must be valid
- User cannot have duplicate module assignments

**Error Responses:**
- `400` - Bad Request (invalid user level, invalid module key, or missing required fields)
- `404` - Not Found (user not found)
- `409` - Conflict (module already assigned to user)
- `403` - Insufficient permissions

---

## 2. Get User Modules

**Method:** `GET`  
**URL:** `/api/user-modules/user/:userId`  
**Full URL:** `http://localhost:9401/api/user-modules/user/{user_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`

Retrieves all modules assigned to a specific user.

**Path Parameters:**
- `userId` (string, required) - User UUID

**Query Parameters:**
- `isActive` (boolean, optional) - Filter by active status (true/false)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User modules retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "user-module-uuid-1",
      "userId": "user-uuid",
      "moduleKey": "employees",
      "moduleName": "Employee Management",
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "id": "user-module-uuid-2",
      "userId": "user-uuid",
      "moduleKey": "payroll",
      "moduleName": "Payroll Management",
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
# Get all modules for a user
curl -X GET http://localhost:9401/api/user-modules/user/{user_id} \
  -H "Authorization: Bearer <access_token>"

# Get only active modules
curl -X GET "http://localhost:9401/api/user-modules/user/{user_id}?isActive=true" \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (user not found)
- `403` - Insufficient permissions

---

## 3. Get All User Modules

**Method:** `GET`  
**URL:** `/api/user-modules`  
**Full URL:** `http://localhost:9401/api/user-modules`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`

Retrieves all user module assignments with optional filtering.

**Query Parameters:**
- `userId` (string, optional) - Filter by user ID
- `isActive` (boolean, optional) - Filter by active status (true/false)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User modules retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "user-module-uuid-1",
      "userId": "user-uuid-1",
      "moduleKey": "employees",
      "moduleName": "Employee Management",
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "id": "user-module-uuid-2",
      "userId": "user-uuid-2",
      "moduleKey": "payroll",
      "moduleName": "Payroll Management",
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
# Get all user modules
curl -X GET http://localhost:9401/api/user-modules \
  -H "Authorization: Bearer <access_token>"

# Filter by user
curl -X GET "http://localhost:9401/api/user-modules?userId=user-uuid" \
  -H "Authorization: Bearer <access_token>"

# Filter by active status
curl -X GET "http://localhost:9401/api/user-modules?isActive=true" \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Results are ordered by module name (ascending)
- All filter parameters can be combined

---

## 4. Get User Module by ID

**Method:** `GET`  
**URL:** `/api/user-modules/:id`  
**Full URL:** `http://localhost:9401/api/user-modules/{user_module_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`

Retrieves a specific user module assignment by its ID.

**Path Parameters:**
- `id` (string, required) - User Module UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User module retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "user-module-uuid",
    "userId": "user-uuid",
    "moduleKey": "employees",
    "moduleName": "Employee Management",
    "isActive": true,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9401/api/user-modules/{user_module_id} \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (user module not found)

---

## 5. Update User Module

**Method:** `PUT`  
**URL:** `/api/user-modules/:id`  
**Full URL:** `http://localhost:9401/api/user-modules/{user_module_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Updates an existing user module assignment.

**Path Parameters:**
- `id` (string, required) - User Module UUID

**Request Body:**
```json
{
  "moduleName": "Updated Module Name",
  "isActive": false
}
```

**All Fields are Optional:**
- `moduleName` (string, optional) - Updated display name for the module
- `isActive` (boolean, optional) - Active status of the module assignment

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User module updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "user-module-uuid",
    "userId": "user-uuid",
    "moduleKey": "employees",
    "moduleName": "Updated Module Name",
    "isActive": false,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T11:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9401/api/user-modules/{user_module_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Error Responses:**
- `404` - Not Found (user module not found)
- `403` - Insufficient permissions

---

## 6. Remove User Module

**Method:** `DELETE`  
**URL:** `/api/user-modules/:id`  
**Full URL:** `http://localhost:9401/api/user-modules/{user_module_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Removes a module assignment from a user.

**Path Parameters:**
- `id` (string, required) - User Module UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User module removed successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9401/api/user-modules/{user_module_id} \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (user module not found)
- `403` - Insufficient permissions

---

## 7. Get Valid Module Keys

**Method:** `GET`  
**URL:** `/api/user-modules/valid-keys`  
**Full URL:** `http://localhost:9401/api/user-modules/valid-keys`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`

Retrieves the list of valid module keys and their display names.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Valid module keys retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "moduleKeys": [
      "employees",
      "payroll",
      "leave",
      "attendance",
      "approvals",
      "departments",
      "companies",
      "reports",
      "settings"
    ],
    "moduleNames": {
      "employees": "Employee Management",
      "payroll": "Payroll Management",
      "leave": "Leave Management",
      "attendance": "Attendance Management",
      "approvals": "Approval Management",
      "departments": "Department Management",
      "companies": "Company Management",
      "reports": "Reports & Analytics",
      "settings": "Settings Management"
    }
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9401/api/user-modules/valid-keys \
  -H "Authorization: Bearer <access_token>"
```

---

## Access Control Summary

### Who Can Manage User Modules

- **Super Admin**: Full access to all user module management operations
- **Provider Admin**: Full access to all user module management operations
- **Provider HR Staff**: Can view user modules only (read-only access)
- **All other roles**: No access to user module management endpoints

### Module Assignment Rules

- Module assignments are only allowed for users at hierarchy levels 2, 3, and 4
- A user can have multiple module assignments
- Each user-module combination must be unique
- Module assignments can be activated or deactivated without deletion

---

## Best Practices

1. **Module Assignment**: Assign modules based on user responsibilities and expertise
2. **Multiple Modules**: Users can have multiple modules assigned to them
3. **Deactivation**: Use `isActive: false` to temporarily disable a module assignment instead of deleting it
4. **Level Restriction**: Only assign modules to users at levels 2, 3, and 4
5. **Module Keys**: Always use the standard module keys from the valid keys list

---

## Error Handling

All endpoints follow the standard error response format:

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

Common error scenarios:
- **400 Bad Request**: Validation errors, invalid user level, invalid module key
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: User or user module not found
- **409 Conflict**: Module already assigned to user
- **500 Internal Server Error**: Server-side errors


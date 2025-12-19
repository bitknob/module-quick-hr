# Role Management Service Endpoints

[← Back to API Documentation Index](./README.md)

Base Path: `/api/roles`

All role management endpoints require authentication and are restricted to **Super Admin** and **Provider Admin** roles, unless otherwise specified.

## Overview

The Role Management API provides comprehensive role management capabilities with hierarchical support. Roles can be organized in a hierarchy (levels 1-8) and can be assigned to specific companies or be system-wide.

### Role Hierarchy Levels

1. **Level 1** - Super Admin (Full system access)
2. **Level 2** - Provider Admin (Manages provider HR team)
3. **Level 3** - Provider HR Staff (Shared services)
4. **Level 4** - HRBP (Dedicated HR Business Partner)
5. **Level 5** - Company Admin (Local admin)
6. **Level 6** - Department Head (Top-level manager)
7. **Level 7** - Manager (Direct reporting manager)
8. **Level 8** - Employee (Base level)

### System Roles

The system includes 8 predefined system roles that are automatically initialized:
- `super_admin` - Super Admin
- `provider_admin` - Provider Admin
- `provider_hr_staff` - Provider HR Staff
- `hrbp` - HRBP
- `company_admin` - Company Admin
- `department_head` - Department Head
- `manager` - Manager
- `employee` - Employee

System roles cannot be modified or deleted.

---

## User Roles and Hierarchy Diagram

### Visual Hierarchy Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROLE HIERARCHY (Level 1-8)                       │
└─────────────────────────────────────────────────────────────────────────┘

Level 1: ┌──────────────────────────────────────────────────────────────┐
         │  SUPER ADMIN                                                   │
         │  • Full system access                                         │
         │  • Can manage all companies                                   │
         │  • Unrestricted access to all data                            │
         │  • Can override approval workflows                            │
         │  • View/edit any employee records                             │
         │  • Configure system-wide settings                              │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 2: ┌──────────────────────────────────────────────────────────────┐
         │  PROVIDER ADMIN                                               │
         │  • Manages provider HR team                                  │
         │  • Access to all companies                                   │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 3: ┌──────────────────────────────────────────────────────────────┐
         │  PROVIDER HR STAFF                                            │
         │  • Handles shared services                                   │
         │  • Access to multiple/all companies                          │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 4: ┌──────────────────────────────────────────────────────────────┐
         │  HRBP (HR Business Partner)                                   │
         │  • Dedicated HR Business Partner                             │
         │  • Assigned to one company                                   │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 5: ┌──────────────────────────────────────────────────────────────┐
         │  COMPANY ADMIN                                                │
         │  • Local admin within one company                             │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 6: ┌──────────────────────────────────────────────────────────────┐
         │  DEPARTMENT HEAD                                              │
         │  • Top-level manager within company                           │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 7: ┌──────────────────────────────────────────────────────────────┐
         │  MANAGER                                                      │
         │  • Direct reporting manager                                  │
         └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Level 8: ┌──────────────────────────────────────────────────────────────┐
         │  EMPLOYEE                                                     │
         │  • Base level, self-service only                             │
         └──────────────────────────────────────────────────────────────┘
```

### Role Hierarchy Table

| Level | Role Key | Role Name | Description | Access Scope | Key Capabilities |
|-------|----------|-----------|-------------|--------------|------------------|
| **1** | `super_admin` | **Super Admin** | Full system access, can manage all companies. Has unrestricted access to all data and can override approval workflows, view/edit any employee records, and configure system-wide settings across all companies. | All Companies | • Manage all companies<br>• Override approvals<br>• System-wide configuration<br>• Full data access |
| **2** | `provider_admin` | **Provider Admin** | Manages provider HR team, access to all companies | All Companies | • Manage provider HR staff<br>• Access all companies<br>• Manage employees across companies |
| **3** | `provider_hr_staff` | **Provider HR Staff** | Handles shared services, access to multiple/all companies | Multiple/All Companies | • Shared HR services<br>• Cross-company access<br>• Employee management |
| **4** | `hrbp` | **HRBP** | Dedicated HR Business Partner, assigned to one company | Single Company | • Company-specific HR support<br>• Employee management<br>• Approval workflows |
| **5** | `company_admin` | **Company Admin** | Local admin within one company | Single Company | • Company administration<br>• Employee management<br>• Department management |
| **6** | `department_head` | **Department Head** | Top-level manager within company | Single Company (Department) | • Department oversight<br>• Team management<br>• Approval authority |
| **7** | `manager` | **Manager** | Direct reporting manager | Single Company (Team) | • Direct team management<br>• Approval authority<br>• Team oversight |
| **8** | `employee` | **Employee** | Base level, self-service only | Self Only | • Self-service access<br>• Own data access<br>• Request submissions |

### Access Control Matrix

| Role | All Companies | Multiple Companies | Single Company | Own Data | Manage Employees | Approve Leaves | View Payroll | System Settings |
|------|---------------|-------------------|----------------|----------|------------------|---------------|--------------|-----------------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Provider Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Provider HR Staff** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **HRBP** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Company Admin** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Department Head** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Manager** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Employee** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Hierarchy Flow Diagram

```
                    ┌─────────────────┐
                    │  SUPER ADMIN     │  Level 1
                    │  (System-wide)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ PROVIDER ADMIN    │  Level 2
                    │ (All Companies)   │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │ PROVIDER HR STAFF │  Level 3
                    │ (Multi-Company)    │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │      HRBP         │  Level 4
                    │  (One Company)    │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │  COMPANY ADMIN    │  Level 5
                    │  (One Company)    │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │ DEPARTMENT HEAD   │  Level 6
                    │  (Department)     │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │     MANAGER       │  Level 7
                    │   (Direct Team)   │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │     EMPLOYEE      │  Level 8
                    │   (Self Only)     │
                    └───────────────────┘
```

### Role Permissions Summary

**Provider Level Roles (Levels 1-3):**
- Access to multiple or all companies
- System-wide or cross-company operations
- Higher-level administrative functions

**Company Level Roles (Levels 4-5):**
- Restricted to a single company
- Company-specific administration
- Full employee management within company

**Department/Team Level Roles (Levels 6-7):**
- Restricted to specific departments or teams
- Team management and approvals
- Limited to their organizational unit

**Individual Level (Level 8):**
- Self-service only
- Access to own data and requests
- No management capabilities

---

## 1. Initialize System Roles

**Method:** `GET`  
**URL:** `/api/roles/initialize`  
**Full URL:** `http://localhost:9400/api/roles/initialize`  
**Authentication:** Required  
**Required Role:** `super_admin` only

Initializes all system roles in the database. This is typically run automatically on service startup, but can be manually triggered if needed.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "System roles initialized successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/roles/initialize \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Only Super Admin can initialize system roles
- This operation is idempotent - running it multiple times is safe
- System roles are created with predefined permissions and hierarchy levels

---

## 2. Create Role

**Method:** `POST`  
**URL:** `/api/roles`  
**Full URL:** `http://localhost:9400/api/roles`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Creates a new custom role with specified hierarchy level, permissions, and menu access.

**Request Body:**
```json
{
  "roleKey": "custom_manager",
  "name": "Custom Manager",
  "description": "Custom manager role with specific permissions",
  "hierarchyLevel": 7,
  "parentRoleId": "uuid-of-parent-role",
  "companyId": "uuid-of-company",
  "permissions": {
    "canViewReports": true,
    "canExportData": false
  },
  "menuAccess": ["dashboard", "employees", "reports"],
  "canAccessAllCompanies": false,
  "canAccessMultipleCompanies": false,
  "canAccessSingleCompany": true,
  "canManageCompanies": false,
  "canCreateCompanies": false,
  "canManageProviderStaff": false,
  "canManageEmployees": true,
  "canApproveLeaves": true,
  "canViewPayroll": false
}
```

**Required Fields:**
- `roleKey` (string, max 50 chars, unique) - Unique identifier for the role
- `name` (string) - Display name of the role
- `hierarchyLevel` (integer, 1-8) - Hierarchy level of the role

**Optional Fields:**
- `description` (string) - Description of the role
- `parentRoleId` (UUID) - ID of parent role in hierarchy
- `companyId` (UUID) - Company this role is assigned to (null for system-wide)
- `permissions` (object) - Custom permissions object
- `menuAccess` (array of strings) - Menu items this role can access
- All `can*` boolean fields for access control

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Role created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "roleKey": "custom_manager",
    "name": "Custom Manager",
    "description": "Custom manager role with specific permissions",
    "hierarchyLevel": 7,
    "parentRoleId": "uuid-of-parent-role",
    "companyId": "uuid-of-company",
    "isSystemRole": false,
    "isActive": true,
    "permissions": {
      "canViewReports": true,
      "canExportData": false
    },
    "menuAccess": ["dashboard", "employees", "reports"],
    "canAccessAllCompanies": false,
    "canAccessMultipleCompanies": false,
    "canAccessSingleCompany": true,
    "canManageCompanies": false,
    "canCreateCompanies": false,
    "canManageProviderStaff": false,
    "canManageEmployees": true,
    "canApproveLeaves": true,
    "canViewPayroll": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/roles \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roleKey": "custom_manager",
    "name": "Custom Manager",
    "description": "Custom manager role with specific permissions",
    "hierarchyLevel": 7,
    "canAccessSingleCompany": true,
    "canManageEmployees": true,
    "canApproveLeaves": true
  }'
```

**Validation Rules:**
- `hierarchyLevel` must be between 1 and 8
- `roleKey` must be unique
- If `parentRoleId` is provided, parent role must exist and have a lower hierarchy level
- Parent role hierarchy level must be lower than child role

**Error Responses:**
- `400` - Validation error (invalid hierarchy level, duplicate roleKey, invalid parent)
- `403` - Insufficient permissions

---

## 3. Get All Roles

**Method:** `GET`  
**URL:** `/api/roles`  
**Full URL:** `http://localhost:9400/api/roles`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`

Retrieves all roles with optional filtering.

**Query Parameters:**
- `companyId` (UUID, optional) - Filter by company ID
- `isSystemRole` (boolean, optional) - Filter by system role flag
- `isActive` (boolean, optional) - Filter by active status
- `hierarchyLevel` (integer, optional) - Filter by hierarchy level

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Roles retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "roleKey": "super_admin",
      "name": "Super Admin",
      "description": "Full system access, can manage all companies...",
      "hierarchyLevel": 1,
      "parentRoleId": null,
      "companyId": null,
      "isSystemRole": true,
      "isActive": true,
      "permissions": {},
      "menuAccess": [],
      "canAccessAllCompanies": true,
      "canAccessMultipleCompanies": true,
      "canAccessSingleCompany": false,
      "canManageCompanies": true,
      "canCreateCompanies": true,
      "canManageProviderStaff": true,
      "canManageEmployees": true,
      "canApproveLeaves": true,
      "canViewPayroll": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
# Get all roles
curl -X GET http://localhost:9400/api/roles \
  -H "Authorization: Bearer <access_token>"

# Get only system roles
curl -X GET "http://localhost:9400/api/roles?isSystemRole=true" \
  -H "Authorization: Bearer <access_token>"

# Get roles for a specific company
curl -X GET "http://localhost:9400/api/roles?companyId=uuid" \
  -H "Authorization: Bearer <access_token>"

# Get roles at a specific hierarchy level
curl -X GET "http://localhost:9400/api/roles?hierarchyLevel=7" \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Results are ordered by hierarchy level (ascending) and then by name (ascending)
- All filter parameters can be combined

---

## 4. Get Role by ID

**Method:** `GET`  
**URL:** `/api/roles/:id`  
**Full URL:** `http://localhost:9400/api/roles/:id`  
**Authentication:** Required

Retrieves a specific role by its ID.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Role retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "roleKey": "custom_manager",
    "name": "Custom Manager",
    "description": "Custom manager role with specific permissions",
    "hierarchyLevel": 7,
    "parentRoleId": "uuid-of-parent-role",
    "companyId": "uuid-of-company",
    "isSystemRole": false,
    "isActive": true,
    "permissions": {
      "canViewReports": true
    },
    "menuAccess": ["dashboard", "employees"],
    "canAccessAllCompanies": false,
    "canAccessMultipleCompanies": false,
    "canAccessSingleCompany": true,
    "canManageCompanies": false,
    "canCreateCompanies": false,
    "canManageProviderStaff": false,
    "canManageEmployees": true,
    "canApproveLeaves": true,
    "canViewPayroll": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/roles/uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Role not found

---

## 5. Update Role

**Method:** `PUT`  
**URL:** `/api/roles/:id`  
**Full URL:** `http://localhost:9400/api/roles/:id`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Updates an existing role. System roles cannot be updated.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Request Body:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description",
  "hierarchyLevel": 6,
  "parentRoleId": "uuid-of-new-parent",
  "permissions": {
    "canViewReports": true,
    "canExportData": true
  },
  "menuAccess": ["dashboard", "employees", "reports", "analytics"],
  "canAccessSingleCompany": true,
  "canManageEmployees": true,
  "canApproveLeaves": true,
  "isActive": true
}
```

All fields are optional. Only provided fields will be updated.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Role updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "roleKey": "custom_manager",
    "name": "Updated Role Name",
    "description": "Updated description",
    "hierarchyLevel": 6,
    "parentRoleId": "uuid-of-new-parent",
    "companyId": "uuid-of-company",
    "isSystemRole": false,
    "isActive": true,
    "permissions": {
      "canViewReports": true,
      "canExportData": true
    },
    "menuAccess": ["dashboard", "employees", "reports", "analytics"],
    "canAccessAllCompanies": false,
    "canAccessMultipleCompanies": false,
    "canAccessSingleCompany": true,
    "canManageCompanies": false,
    "canCreateCompanies": false,
    "canManageProviderStaff": false,
    "canManageEmployees": true,
    "canApproveLeaves": true,
    "canViewPayroll": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/roles/uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Role Name",
    "canManageEmployees": true
  }'
```

**Validation Rules:**
- System roles cannot be updated
- `hierarchyLevel` must be between 1 and 8
- If `parentRoleId` is provided, it must be different from the role's own ID
- Parent role must have a lower hierarchy level than the child
- Circular references in hierarchy are not allowed

**Error Responses:**
- `400` - Validation error (invalid hierarchy, circular reference, etc.)
- `403` - Insufficient permissions or attempting to update system role
- `404` - Role not found

---

## 6. Delete Role

**Method:** `DELETE`  
**URL:** `/api/roles/:id`  
**Full URL:** `http://localhost:9400/api/roles/:id`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Deletes a custom role. System roles cannot be deleted. Roles with child roles cannot be deleted.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Role deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/roles/uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400` - Role has child roles (must delete or reassign children first)
- `403` - Insufficient permissions or attempting to delete system role
- `404` - Role not found

**Notes:**
- Before deleting a role, ensure no child roles exist or reassign them to other parent roles
- System roles are protected and cannot be deleted

---

## 7. Get Role Hierarchy

**Method:** `GET`  
**URL:** `/api/roles/:id/hierarchy`  
**Full URL:** `http://localhost:9400/api/roles/:id/hierarchy`  
**Authentication:** Required

Retrieves the complete hierarchy for a role, including all parent roles and child roles.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Role hierarchy retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid-parent-1",
      "roleKey": "super_admin",
      "name": "Super Admin",
      "hierarchyLevel": 1,
      "parentRoleId": null,
      "isSystemRole": true,
      "isActive": true
    },
    {
      "id": "uuid-parent-2",
      "roleKey": "provider_admin",
      "name": "Provider Admin",
      "hierarchyLevel": 2,
      "parentRoleId": "uuid-parent-1",
      "isSystemRole": true,
      "isActive": true
    },
    {
      "id": "uuid",
      "roleKey": "custom_manager",
      "name": "Custom Manager",
      "hierarchyLevel": 7,
      "parentRoleId": "uuid-parent-2",
      "isSystemRole": false,
      "isActive": true
    },
    {
      "id": "uuid-child-1",
      "roleKey": "custom_employee",
      "name": "Custom Employee",
      "hierarchyLevel": 8,
      "parentRoleId": "uuid",
      "isSystemRole": false,
      "isActive": true
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/roles/uuid/hierarchy \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- The response includes the role itself, all parent roles (ordered from top to bottom), and all child roles
- Parent roles are listed first, followed by the role itself, then child roles

---

## 8. Get Roles by Hierarchy Level

**Method:** `GET`  
**URL:** `/api/roles/hierarchy-level/:level`  
**Full URL:** `http://localhost:9400/api/roles/hierarchy-level/:level`  
**Authentication:** Required

Retrieves all active roles at a specific hierarchy level.

**Path Parameters:**
- `level` (integer, 1-8, required) - Hierarchy level

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Roles retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid-1",
      "roleKey": "manager",
      "name": "Manager",
      "description": "Direct reporting manager",
      "hierarchyLevel": 7,
      "parentRoleId": "uuid-parent",
      "companyId": null,
      "isSystemRole": true,
      "isActive": true
    },
    {
      "id": "uuid-2",
      "roleKey": "custom_manager",
      "name": "Custom Manager",
      "description": "Custom manager role",
      "hierarchyLevel": 7,
      "parentRoleId": "uuid-parent",
      "companyId": "uuid-company",
      "isSystemRole": false,
      "isActive": true
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/roles/hierarchy-level/7 \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400` - Invalid hierarchy level (must be between 1 and 8)

---

## 9. Get Child Roles

**Method:** `GET`  
**URL:** `/api/roles/:id/children`  
**Full URL:** `http://localhost:9400/api/roles/:id/children`  
**Authentication:** Required

Retrieves all direct child roles of a specific role.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Child roles retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid-child-1",
      "roleKey": "custom_employee",
      "name": "Custom Employee",
      "description": "Custom employee role",
      "hierarchyLevel": 8,
      "parentRoleId": "uuid",
      "companyId": "uuid-company",
      "isSystemRole": false,
      "isActive": true
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/roles/uuid/children \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Returns only direct children, not grandchildren
- Results are ordered by hierarchy level and name

---

## 10. Get Parent Roles

**Method:** `GET`  
**URL:** `/api/roles/:id/parents`  
**Full URL:** `http://localhost:9400/api/roles/:id/parents`  
**Authentication:** Required

Retrieves all parent roles in the hierarchy chain for a specific role.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Parent roles retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid-parent-1",
      "roleKey": "super_admin",
      "name": "Super Admin",
      "hierarchyLevel": 1,
      "parentRoleId": null,
      "isSystemRole": true,
      "isActive": true
    },
    {
      "id": "uuid-parent-2",
      "roleKey": "provider_admin",
      "name": "Provider Admin",
      "hierarchyLevel": 2,
      "parentRoleId": "uuid-parent-1",
      "isSystemRole": true,
      "isActive": true
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/roles/uuid/parents \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Returns all ancestors in the hierarchy chain, ordered from top to bottom
- If a role has no parent, returns an empty array

---

## 11. Assign Menu Access

**Method:** `POST`  
**URL:** `/api/roles/:id/menu-access`  
**Full URL:** `http://localhost:9400/api/roles/:id/menu-access`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Assigns menu access permissions to a role by specifying menu item IDs.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Request Body:**
```json
{
  "menuIds": ["dashboard", "employees", "departments", "approvals", "leave", "attendance", "profile"]
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Menu access assigned successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "menuAccess": ["dashboard", "employees", "departments", "approvals", "leave", "attendance", "profile"]
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/roles/uuid/menu-access \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "menuIds": ["dashboard", "employees", "departments"]
  }'
```

**Available Menu IDs:**
- `dashboard` - Dashboard
- `companies` - Companies
- `employees` - Employees
- `departments` - Departments
- `approvals` - Approvals
- `leave` - Leave Management
- `attendance` - Attendance
- `profile` - Profile
- `settings` - Settings
- `roles` - Role Management

**Error Responses:**
- `400` - Invalid request (menuIds must be an array)
- `403` - Insufficient permissions
- `404` - Role not found

---

## 12. Update Permissions

**Method:** `PUT`  
**URL:** `/api/roles/:id/permissions`  
**Full URL:** `http://localhost:9400/api/roles/:id/permissions`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

Updates custom permissions for a role. Permissions are stored as a JSON object and can contain any custom permission flags.

**Path Parameters:**
- `id` (UUID, required) - Role ID

**Request Body:**
```json
{
  "permissions": {
    "canViewReports": true,
    "canExportData": true,
    "canManageSettings": false,
    "canAccessAnalytics": true,
    "customPermission1": true,
    "customPermission2": false
  }
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Permissions updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "permissions": {
      "canViewReports": true,
      "canExportData": true,
      "canManageSettings": false,
      "canAccessAnalytics": true,
      "customPermission1": true,
      "customPermission2": false
    }
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/roles/uuid/permissions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "canViewReports": true,
      "canExportData": true
    }
  }'
```

**Notes:**
- Permissions object can contain any custom permission flags
- This is separate from the built-in `can*` boolean fields (canAccessAllCompanies, etc.)
- Permissions are stored as JSONB in the database, allowing flexible permission structures

**Error Responses:**
- `400` - Invalid request (permissions must be an object)
- `403` - Insufficient permissions
- `404` - Role not found

---

## Access Control Summary

### Who Can Manage Roles

- **Super Admin**: Full access to all role management operations
- **Provider Admin**: Full access to all role management operations
- **Provider HR Staff**: Can view roles only (read-only access)
- **All other roles**: No access to role management endpoints

### System Roles Protection

- System roles (the 8 predefined roles) cannot be:
  - Modified (name, permissions, hierarchy, etc.)
  - Deleted
- System roles are automatically initialized on service startup
- Custom roles can be fully managed (created, updated, deleted)

### Hierarchy Rules

- Hierarchy levels must be between 1 and 8
- Parent role must have a lower hierarchy level than child role
- Circular references in hierarchy are not allowed
- A role cannot be its own parent
- Roles with child roles cannot be deleted (must delete or reassign children first)

---

## Best Practices

1. **Role Design**: Design roles with clear hierarchy levels that reflect organizational structure
2. **Permissions**: Use the `permissions` JSONB field for custom application-specific permissions
3. **Menu Access**: Keep menu access lists synchronized with actual menu items in the application
4. **Company Roles**: Use `companyId` to create company-specific roles when needed
5. **System Roles**: Don't attempt to modify system roles - create custom roles instead
6. **Hierarchy**: Maintain logical hierarchy relationships (parent roles should have broader access)

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
- **400 Bad Request**: Validation errors, invalid hierarchy, circular references
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions or attempting to modify system roles
- **404 Not Found**: Role not found
- **500 Internal Server Error**: Server-side errors


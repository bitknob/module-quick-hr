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

## Request Logging

All HTTP requests and responses are automatically logged to the database for auditing, debugging, and analysis purposes. The logging system captures:

- **Request Details**: Method, URL, path, query parameters, headers (sanitized), body (sanitized)
- **Response Details**: Status code, response body, response headers
- **User Context**: User ID, Employee ID, Company ID (when available)
- **Metadata**: IP address, User-Agent, request duration, service name, timestamp

**Note**: Sensitive data (passwords, tokens, API keys) is automatically sanitized before logging. Logging is non-blocking and does not affect API performance.

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
  "password": "SecurePass123!",
  "deviceId": "unique-device-id-12345",
  "deviceType": "ios",
  "deviceName": "iPhone 14 Pro",
  "deviceModel": "iPhone",
  "osVersion": "17.0",
  "appVersion": "1.0.0",
  "fcmToken": "firebase-cloud-messaging-token",
  "apnsToken": "apple-push-notification-token",
  "isPrimary": true
}
```

**Note:** All device fields are optional. If provided, the device will be automatically registered.

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
    "refreshToken": "refresh_token",
    "device": {
      "id": "device-uuid",
      "deviceId": "unique-device-id-12345",
      "deviceType": "ios",
      "isPrimary": true
    }
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro"
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

### 10. Get Menu (Role-Based)

**Method:** `GET`  
**URL:** `/api/auth/menu`  
**Full URL:** `http://localhost:9400/api/auth/menu`  
**Authentication:** Required

Returns a dynamic menu structure based on the authenticated user's role. Each menu item includes navigation paths and icons suitable for frontend rendering.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Menu retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "path": "/dashboard",
      "icon": "home",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager", "employee"]
    },
    {
      "id": "companies",
      "label": "Companies",
      "path": "/dashboard/companies",
      "icon": "building",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff"]
    },
    {
      "id": "employees",
      "label": "Employees",
      "path": "/dashboard/employees",
      "icon": "users",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin"],
      "children": [
        {
          "id": "employees-list",
          "label": "All Employees",
          "path": "/dashboard/employees",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin"]
        },
        {
          "id": "employees-create",
          "label": "Create Employee",
          "path": "/dashboard/employees/create",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin"]
        }
      ]
    },
    {
      "id": "departments",
      "label": "Departments",
      "path": "/dashboard/departments",
      "icon": "sitemap",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager"]
    },
    {
      "id": "approvals",
      "label": "Approvals",
      "path": "/dashboard/approvals",
      "icon": "check-circle",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager"],
      "children": [
        {
          "id": "approvals-pending",
          "label": "Pending Approvals",
          "path": "/dashboard/approvals/pending",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager"]
        },
        {
          "id": "approvals-all",
          "label": "All Approvals",
          "path": "/dashboard/approvals",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin"]
        }
      ]
    },
    {
      "id": "leave",
      "label": "Leave",
      "path": "/dashboard/leave",
      "icon": "calendar",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager", "employee"],
      "children": [
        {
          "id": "leave-requests",
          "label": "My Leave Requests",
          "path": "/dashboard/leave/requests",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager", "employee"]
        },
        {
          "id": "leave-create",
          "label": "Request Leave",
          "path": "/dashboard/leave/create",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager", "employee"]
        }
      ]
    },
    {
      "id": "attendance",
      "label": "Attendance",
      "path": "/dashboard/attendance",
      "icon": "clock",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager", "employee"]
    },
    {
      "id": "profile",
      "label": "Profile",
      "path": "/dashboard/profile",
      "icon": "user",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin", "department_head", "manager", "employee"]
    },
    {
      "id": "settings",
      "label": "Settings",
      "path": "/dashboard/settings",
      "icon": "settings",
      "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin"],
      "children": [
        {
          "id": "settings-general",
          "label": "General",
          "path": "/dashboard/settings/general",
          "roles": ["super_admin", "provider_admin", "provider_hr_staff", "hrbp", "company_admin"]
        },
        {
          "id": "settings-users",
          "label": "Users",
          "path": "/dashboard/settings/users",
          "roles": ["super_admin", "provider_admin"]
        }
      ]
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/auth/menu \
  -H "Authorization: Bearer <access_token>"
```

**Menu Structure:**
- Each menu item includes:
  - `id`: Unique identifier for the menu item
  - `label`: Display text for the menu item
  - `path`: Frontend route path
  - `icon`: Icon identifier (optional, for frontend icon rendering)
  - `children`: Nested menu items (optional)
  - `roles`: List of roles that can access this menu item (for reference)

**Role-Based Filtering:**
The API automatically filters menu items based on the authenticated user's role. Only menu items that the user's role has access to are returned.

**Available Menu Items by Role:**
- **Super Admin / Provider Admin / Provider HR Staff**: All menu items including Companies, Employees, Departments, Approvals, Leave, Attendance, Profile, Settings
- **HRBP / Company Admin**: Employees, Departments, Approvals, Leave, Attendance, Profile, Settings (no Companies)
- **Department Head / Manager**: Departments, Approvals, Leave, Attendance, Profile (no Companies, Employees, Settings)
- **Employee**: Dashboard, Leave, Attendance, Profile (basic self-service items only)

---

## Device Management Endpoints

Base Path: `/api/devices`

All device endpoints require authentication.

### 1. Register Device

**Method:** `POST`  
**URL:** `/api/devices/register`  
**Full URL:** `http://localhost:9400/api/devices/register`  
**Authentication:** Required

**Request Body:**
```json
{
  "deviceId": "unique-device-id-12345",
  "deviceType": "ios",
  "deviceName": "iPhone 14 Pro",
  "deviceModel": "iPhone",
  "osVersion": "17.0",
  "appVersion": "1.0.0",
  "fcmToken": "firebase-cloud-messaging-token",
  "apnsToken": "apple-push-notification-token",
  "isPrimary": true
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device registered successfully",
    "responseDetail": "Device iPhone 14 Pro has been registered"
  },
  "response": {
    "id": "device-uuid",
    "userId": "user-uuid",
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro",
    "deviceModel": "iPhone",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "fcmToken": "firebase-cloud-messaging-token",
    "apnsToken": "apple-push-notification-token",
    "isActive": true,
    "isPrimary": true,
    "lastActiveAt": "2025-01-14T10:30:00Z",
    "createdAt": "2025-01-14T10:30:00Z",
    "updatedAt": "2025-01-14T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/devices/register \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro",
    "fcmToken": "firebase-token"
  }'
```

---

### 2. Get All Devices

**Method:** `GET`  
**URL:** `/api/devices`  
**Full URL:** `http://localhost:9400/api/devices`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Devices retrieved successfully",
    "responseDetail": "Found 2 device(s)"
  },
  "response": [
    {
      "id": "device-uuid-1",
      "deviceId": "unique-device-id-12345",
      "deviceType": "ios",
      "deviceName": "iPhone 14 Pro",
      "isPrimary": true,
      "isActive": true,
      "lastActiveAt": "2025-01-14T10:30:00Z"
    },
    {
      "id": "device-uuid-2",
      "deviceId": "unique-device-id-67890",
      "deviceType": "android",
      "deviceName": "Samsung Galaxy S23",
      "isPrimary": false,
      "isActive": true,
      "lastActiveAt": "2025-01-13T15:20:00Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/devices \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. Get Device by ID

**Method:** `GET`  
**URL:** `/api/devices/:id`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "device-uuid",
    "userId": "user-uuid",
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro",
    "deviceModel": "iPhone",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "isActive": true,
    "isPrimary": true,
    "lastActiveAt": "2025-01-14T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/devices/device-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

### 4. Update Device

**Method:** `PUT`  
**URL:** `/api/devices/:id`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid`  
**Authentication:** Required

**Request Body:**
```json
{
  "fcmToken": "updated-firebase-token",
  "apnsToken": "updated-apple-token",
  "deviceName": "iPhone 15 Pro",
  "isPrimary": true,
  "isActive": true
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "device-uuid",
    "fcmToken": "updated-firebase-token",
    "apnsToken": "updated-apple-token",
    "deviceName": "iPhone 15 Pro",
    "isPrimary": true,
    "isActive": true
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/devices/device-uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "updated-firebase-token",
    "isPrimary": true
  }'
```

---

### 5. Deactivate Device

**Method:** `POST`  
**URL:** `/api/devices/:id/deactivate`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid/deactivate`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device deactivated successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/devices/device-uuid/deactivate \
  -H "Authorization: Bearer <access_token>"
```

---

### 6. Delete Device

**Method:** `DELETE`  
**URL:** `/api/devices/:id`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/devices/device-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

## Approval System Endpoints

Base Path: `/api/approvals`

All approval endpoints require authentication and employee context.

### 1. Create Approval Request

**Method:** `POST`  
**URL:** `/api/approvals`  
**Full URL:** `http://localhost:9400/api/approvals`  
**Authentication:** Required

**Request Body:**
```json
{
  "requestType": "leave",
  "entityType": "LeaveRequest",
  "entityId": "leave-request-uuid",
  "requestedFor": "employee-uuid",
  "requestData": {
    "leaveType": "annual",
    "startDate": "2025-02-01",
    "endDate": "2025-02-05",
    "reason": "Family vacation"
  },
  "priority": "normal",
  "expiresAt": "2025-01-31T23:59:59Z",
  "approvers": [
    {
      "approverType": "manager",
      "isRequired": true
    },
    {
      "approverType": "department_head",
      "isRequired": true
    }
  ]
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Approval request created successfully",
    "responseDetail": "Approval request uuid has been created and is pending approval"
  },
  "response": {
    "id": "approval-request-uuid",
    "companyId": "company-uuid",
    "requestType": "leave",
    "entityType": "LeaveRequest",
    "entityId": "leave-request-uuid",
    "requestedBy": "employee-uuid",
    "requestedFor": "employee-uuid",
    "requestData": {
      "leaveType": "annual",
      "startDate": "2025-02-01",
      "endDate": "2025-02-05",
      "reason": "Family vacation"
    },
    "currentStep": 1,
    "totalSteps": 2,
    "status": "pending",
    "priority": "normal",
    "createdAt": "2025-01-14T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/approvals \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requestType": "leave",
    "entityType": "LeaveRequest",
    "requestData": {
      "leaveType": "annual",
      "startDate": "2025-02-01",
      "endDate": "2025-02-05"
    }
  }'
```

---

### 2. Get Approval Request

**Method:** `GET`  
**URL:** `/api/approvals/:id`  
**Full URL:** `http://localhost:9400/api/approvals/approval-request-uuid`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Can only view approval requests from their own company
- **Super Admins:** Can view any approval request across all companies (no company restriction)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Approval request retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "approval-request-uuid",
    "requestType": "leave",
    "status": "pending",
    "currentStep": 1,
    "totalSteps": 2,
    "steps": [
      {
        "id": "step-uuid-1",
        "stepNumber": 1,
        "approverId": "manager-uuid",
        "approverType": "manager",
        "status": "pending",
        "order": 1
      },
      {
        "id": "step-uuid-2",
        "stepNumber": 2,
        "approverId": "dept-head-uuid",
        "approverType": "department_head",
        "status": "pending",
        "order": 2
      }
    ],
    "history": [
      {
        "id": "history-uuid",
        "action": "created",
        "performedBy": "employee-uuid",
        "createdAt": "2025-01-14T10:30:00Z"
      }
    ]
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/approvals/approval-request-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. Get Approval Requests

**Method:** `GET`  
**URL:** `/api/approvals`  
**Full URL:** `http://localhost:9400/api/approvals?page=1&limit=10&status=pending`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Can only view approval requests from their own company
- **Super Admins:** Can view all approval requests across all companies (no company restriction)

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `requestType` (string, optional) - Filter by request type (leave, employee_create, etc.)
- `status` (string, optional) - Filter by status (pending, approved, rejected, etc.)
- `requestedBy` (string, optional) - Filter by requester UUID
- `requestedFor` (string, optional) - Filter by target employee UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Approval requests retrieved successfully",
    "responseDetail": "Total: 15, Page: 1, Limit: 10, Total Pages: 2"
  },
  "response": [
    {
      "id": "approval-request-uuid-1",
      "requestType": "leave",
      "status": "pending",
      "priority": "normal",
      "requestedBy": "employee-uuid",
      "createdAt": "2025-01-14T10:30:00Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/approvals?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer <access_token>"
```

---

### 4. Get Pending Approvals

**Method:** `GET`  
**URL:** `/api/approvals/pending`  
**Full URL:** `http://localhost:9400/api/approvals/pending`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Returns approval requests pending action from the current user (where they are assigned as approver)
- **Super Admins:** Returns all pending approval requests across all companies (no employee context required)

Returns all approval requests pending action from the current user.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pending approvals retrieved successfully",
    "responseDetail": "Found 3 pending approval(s)"
  },
  "response": [
    {
      "id": "approval-request-uuid",
      "requestType": "leave",
      "status": "pending",
      "currentStep": 1,
      "requestedBy": "employee-uuid",
      "createdAt": "2025-01-14T10:30:00Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/approvals/pending \
  -H "Authorization: Bearer <access_token>"
```

---

### 5. Approve Request

**Method:** `POST`  
**URL:** `/api/approvals/:id/approve`  
**Full URL:** `http://localhost:9400/api/approvals/approval-request-uuid/approve`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Can only approve requests where they are assigned as the approver for the current step
- **Super Admins:** Can approve any pending approval request, even if not assigned as approver (bypasses authorization check)

**Request Body:**
```json
{
  "comments": "Approved. Enjoy your vacation!"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Request approved successfully",
    "responseDetail": "Approval request approval-request-uuid has been approved"
  },
  "response": {
    "id": "approval-request-uuid",
    "status": "approved",
    "currentStep": 2,
    "approvedAt": "2025-01-14T11:00:00Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/approvals/approval-request-uuid/approve \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Approved. Enjoy your vacation!"
  }'
```

---

### 6. Reject Request

**Method:** `POST`  
**URL:** `/api/approvals/:id/reject`  
**Full URL:** `http://localhost:9400/api/approvals/approval-request-uuid/reject`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Can only reject requests where they are assigned as the approver for the current step
- **Super Admins:** Can reject any pending approval request, even if not assigned as approver (bypasses authorization check)

**Request Body:**
```json
{
  "rejectionReason": "Insufficient leave balance",
  "comments": "You have only 2 days of leave remaining."
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Request rejected successfully",
    "responseDetail": "Approval request approval-request-uuid has been rejected: Insufficient leave balance"
  },
  "response": {
    "id": "approval-request-uuid",
    "status": "rejected",
    "rejectedAt": "2025-01-14T11:00:00Z",
    "rejectionReason": "Insufficient leave balance"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/approvals/approval-request-uuid/reject \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Insufficient leave balance",
    "comments": "You have only 2 days of leave remaining."
  }'
```

---

### 7. Cancel Request

**Method:** `POST`  
**URL:** `/api/approvals/:id/cancel`  
**Full URL:** `http://localhost:9400/api/approvals/approval-request-uuid/cancel`  
**Authentication:** Required

**Access Control:**
- **Regular Users:** Can only cancel requests they created (must be the requester)
- **Super Admins:** Can cancel any pending approval request, regardless of who created it (bypasses requester restriction)

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Request cancelled successfully",
    "responseDetail": "Approval request approval-request-uuid has been cancelled"
  },
  "response": {
    "id": "approval-request-uuid",
    "status": "cancelled"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/approvals/approval-request-uuid/cancel \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "No longer needed"
  }'
```

---

## Company Service Endpoints

Base Path: `/api/companies`

All company endpoints require authentication.

### 1. Get All Companies

**Method:** `GET`  
**URL:** `/api/companies`  
**Full URL:** `http://localhost:9400/api/companies`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Companies retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "company-uuid-1",
      "name": "Acme Corporation",
      "code": "ACME001",
      "description": "A leading technology company",
      "profileImageUrl": "https://firebase-storage-url/companies/company-uuid-1/image.jpg",
      "hrbpId": "hrbp-uuid",
      "status": "active",
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "id": "company-uuid-2",
      "name": "Tech Solutions Inc",
      "code": "TECH001",
      "description": "Technology consulting firm",
      "profileImageUrl": null,
      "hrbpId": null,
      "status": "active",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/companies \
  -H "Authorization: Bearer <access_token>"
```

---

### 2. Get Company by ID

**Method:** `GET`  
**URL:** `/api/companies/:id`  
**Full URL:** `http://localhost:9400/api/companies/{company_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`  
**Access Control:** Company-scoped users can only access their own company

**Path Parameters:**
- `id` (string, required) - Company UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Company retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "company-uuid",
    "name": "Acme Corporation",
    "code": "ACME001",
    "description": "A leading technology company",
    "profileImageUrl": "https://firebase-storage-url/companies/company-uuid/image.jpg",
    "hrbpId": "hrbp-uuid",
    "status": "active",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/companies/{company_id} \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (company not found)
- `403` - Forbidden (insufficient permissions or cannot access different company)

---

### 3. Create Company

**Method:** `POST`  
**URL:** `/api/companies`  
**Full URL:** `http://localhost:9400/api/companies`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "code": "ACME001",
  "description": "A leading technology company",
  "hrbpId": "hrbp-uuid"
}
```

**Required Fields:**
- `name` (string, required) - Company name
- `code` (string, required) - Unique company code (must be unique across all companies)

**Optional Fields:**
- `description` (string, optional) - Company description
- `hrbpId` (string, optional) - UUID of the HR Business Partner assigned to the company

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Company created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "company-uuid",
    "name": "Acme Corporation",
    "code": "ACME001",
    "description": "A leading technology company",
    "profileImageUrl": null,
    "hrbpId": "hrbp-uuid",
    "status": "active",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/companies \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "code": "ACME001",
    "description": "A leading technology company"
  }'
```

**Error Responses:**
- `400` - Bad Request (missing required fields: name or code)
- `409` - Conflict (company code already exists)
- `403` - Forbidden (insufficient permissions - not super_admin or provider_admin)

---

### 4. Update Company

**Method:** `PUT`  
**URL:** `/api/companies/:id`  
**Full URL:** `http://localhost:9400/api/companies/{company_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

**Path Parameters:**
- `id` (string, required) - Company UUID

**Request Body:**
```json
{
  "name": "Acme Corporation Updated",
  "code": "ACME001",
  "description": "Updated company description",
  "hrbpId": "new-hrbp-uuid",
  "status": "active"
}
```

**All Fields are Optional:**
- `name` (string, optional) - Company name
- `code` (string, optional) - Unique company code (must be unique if provided)
- `description` (string, optional) - Company description
- `hrbpId` (string, optional) - UUID of the HR Business Partner assigned to the company
- `status` (string, optional) - Company status (`active` or `inactive`)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Company updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "company-uuid",
    "name": "Acme Corporation Updated",
    "code": "ACME001",
    "description": "Updated company description",
    "profileImageUrl": "https://firebase-storage-url/companies/company-uuid/image.jpg",
    "hrbpId": "new-hrbp-uuid",
    "status": "active",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/companies/{company_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation Updated",
    "description": "Updated company description"
  }'
```

**Error Responses:**
- `404` - Not Found (company not found)
- `409` - Conflict (company code already exists if code is changed)
- `403` - Forbidden (insufficient permissions - not super_admin or provider_admin)

---

### 5. Delete Company

**Method:** `DELETE`  
**URL:** `/api/companies/:id`  
**Full URL:** `http://localhost:9400/api/companies/{company_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`

**Path Parameters:**
- `id` (string, required) - Company UUID

**Note:** This performs a soft delete by setting the company status to `inactive`. The company record remains in the database.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Company deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/companies/{company_id} \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (company not found)
- `403` - Forbidden (insufficient permissions - not super_admin or provider_admin)

---

### 6. Upload Company Profile Image

**Method:** `POST`  
**URL:** `/api/companies/:companyId/upload-profile-image`  
**Full URL:** `http://localhost:9400/api/companies/{company_id}/upload-profile-image`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Path Parameters:**
- `companyId` (string, required) - Company UUID

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `image` file field

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Company profile image uploaded successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "company-uuid",
    "name": "Acme Corporation",
    "profileImageUrl": "https://firebase-storage-url/companies/company-uuid/image.jpg"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/companies/{company_id}/upload-profile-image \
  -H "Authorization: Bearer <access_token>" \
  -F "image=@/path/to/image.jpg"
```

**Note:** If a profile image already exists, the old image will be automatically deleted from Firebase Storage before uploading the new one.

---

## Department Service Endpoints

Base Path: `/api/departments`

All department endpoints require authentication. Departments are company-scoped - each department belongs to a specific company.

### 1. Get All Departments

**Method:** `GET`  
**URL:** `/api/departments`  
**Full URL:** `http://localhost:9400/api/departments?companyId=company-uuid`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`

**Query Parameters:**
- `companyId` (string, optional) - Filter departments by company ID. If not provided and user is company-scoped, automatically filters by user's company.

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Departments retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "department-uuid-1",
      "companyId": "company-uuid",
      "name": "Engineering",
      "description": "Software Development and Engineering",
      "headId": "employee-uuid",
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "id": "department-uuid-2",
      "companyId": "company-uuid",
      "name": "Human Resources",
      "description": "HR Management and Operations",
      "headId": null,
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/departments?companyId=company-uuid" \
  -H "Authorization: Bearer <access_token>"
```

---

### 2. Get Department by ID

**Method:** `GET`  
**URL:** `/api/departments/:id`  
**Full URL:** `http://localhost:9400/api/departments/{department_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`  
**Access Control:** Company-scoped users can only access departments from their own company

**Path Parameters:**
- `id` (string, required) - Department UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Department retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "department-uuid",
    "companyId": "company-uuid",
    "name": "Engineering",
    "description": "Software Development and Engineering",
    "headId": "employee-uuid",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/departments/{department_id} \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (department not found)
- `403` - Forbidden (insufficient permissions or cannot access different company)

---

### 3. Create Department

**Method:** `POST`  
**URL:** `/api/departments`  
**Full URL:** `http://localhost:9400/api/departments`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Request Body:**
```json
{
  "companyId": "company-uuid",
  "name": "Engineering",
  "description": "Software Development and Engineering",
  "headId": "employee-uuid"
}
```

**Required Fields:**
- `companyId` (string, required) - Company UUID that the department belongs to
- `name` (string, required) - Department name (must be unique within the company)

**Optional Fields:**
- `description` (string, optional) - Department description
- `headId` (string, optional) - UUID of the employee who is the department head

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Department created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "department-uuid",
    "companyId": "company-uuid",
    "name": "Engineering",
    "description": "Software Development and Engineering",
    "headId": "employee-uuid",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/departments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "company-uuid",
    "name": "Engineering",
    "description": "Software Development and Engineering"
  }'
```

**Error Responses:**
- `400` - Bad Request (missing required fields: companyId or name)
- `409` - Conflict (department name already exists in this company)
- `403` - Forbidden (insufficient permissions or cannot create department in different company)

---

### 4. Update Department

**Method:** `PUT`  
**URL:** `/api/departments/:id`  
**Full URL:** `http://localhost:9400/api/departments/{department_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`  
**Access Control:** Company-scoped users can only update departments from their own company

**Path Parameters:**
- `id` (string, required) - Department UUID

**Request Body:**
```json
{
  "name": "Engineering Updated",
  "description": "Updated department description",
  "headId": "new-head-uuid"
}
```

**All Fields are Optional:**
- `name` (string, optional) - Department name (must be unique within the company if changed)
- `description` (string, optional) - Department description
- `headId` (string, optional) - UUID of the employee who is the department head

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Department updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "department-uuid",
    "companyId": "company-uuid",
    "name": "Engineering Updated",
    "description": "Updated department description",
    "headId": "new-head-uuid",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/departments/{department_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering Updated",
    "description": "Updated department description"
  }'
```

**Error Responses:**
- `404` - Not Found (department not found)
- `409` - Conflict (department name already exists in this company if name is changed)
- `403` - Forbidden (insufficient permissions or cannot update different company)

---

### 5. Delete Department

**Method:** `DELETE`  
**URL:** `/api/departments/:id`  
**Full URL:** `http://localhost:9400/api/departments/{department_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`  
**Access Control:** Company-scoped users can only delete departments from their own company

**Path Parameters:**
- `id` (string, required) - Department UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Department deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/departments/{department_id} \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `404` - Not Found (department not found)
- `403` - Forbidden (insufficient permissions or cannot delete different company)

**Note:** Deleting a department will permanently remove it from the database. Make sure no employees are assigned to this department before deletion.

---

## Employee Service Endpoints

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

## Global Search Endpoint

Base Path: `/api/search`

The global search endpoint allows users to search across multiple entities (employees, companies, departments, and menus) with a single query. Results are automatically filtered based on the user's role and company access.

### Global Search

**Method:** `GET`  
**URL:** `/api/search`  
**Full URL:** `http://localhost:9400/api/search?q=john&limit=20`  
**Authentication:** Required

**Query Parameters:**
- `q` or `searchTerm` (string, required) - Search term (minimum 2 characters)
- `limit` (number, optional) - Maximum number of results to return (default: 20, max: 50)

**Access Control:**
- **Employees**: Searchable by Super Admin, Provider Admin, Provider HR Staff, HRBP, Company Admin, Department Head, Manager
  - Non-super-admin users only see employees from their company
- **Companies**: Searchable by Super Admin, Provider Admin, Provider HR Staff only
- **Departments**: Searchable by Super Admin, Provider Admin, Provider HR Staff, HRBP, Company Admin, Department Head, Manager
  - Non-super-admin users only see departments from their company
- **Menus**: Searchable by all authenticated users (role-based menu filtering applies)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Search completed successfully",
    "responseDetail": "Found 15 result(s) across 4 type(s)"
  },
  "response": {
    "results": [
      {
        "type": "employee",
        "id": "employee-uuid",
        "title": "John Doe",
        "subtitle": "Software Engineer • Engineering",
        "path": "/dashboard/employees/employee-uuid",
        "icon": "user",
        "metadata": {
          "email": "john.doe@example.com",
          "employeeId": "EMP001",
          "companyId": "company-uuid"
        }
      },
      {
        "type": "company",
        "id": "company-uuid",
        "title": "Acme Corporation",
        "subtitle": "ACME",
        "path": "/dashboard/companies/company-uuid",
        "icon": "building",
        "metadata": {
          "code": "ACME",
          "description": "Technology company"
        }
      },
      {
        "type": "department",
        "id": "department-uuid",
        "title": "Engineering",
        "subtitle": "Software development department",
        "path": "/dashboard/departments/department-uuid",
        "icon": "sitemap",
        "metadata": {
          "companyId": "company-uuid",
          "description": "Software development department"
        }
      },
      {
        "type": "menu",
        "id": "employees",
        "title": "Employees",
        "subtitle": "/dashboard/employees",
        "path": "/dashboard/employees",
        "icon": "users",
        "metadata": {}
      }
    ],
    "total": 15,
    "byType": {
      "employees": 8,
      "companies": 2,
      "departments": 3,
      "menus": 2
    }
  }
}
```

**Response (400) - Invalid Search Term:**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Search term must be at least 2 characters",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/search?q=john&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

**Search Features:**
- **Multi-entity search**: Searches across employees, companies, departments, and menus simultaneously
- **Role-based filtering**: Only returns results the user is authorized to see
- **Company isolation**: Non-super-admin users only see results from their company
- **Relevance sorting**: Results are sorted by relevance (exact matches first, then partial matches)
- **Result distribution**: Results are distributed across entity types (40% employees, 30% companies, 20% departments, 10% menus)
- **Case-insensitive**: Search is case-insensitive
- **Partial matching**: Matches partial strings in names, emails, IDs, job titles, etc.

**Search Fields:**
- **Employees**: firstName, lastName, email, employeeId, jobTitle, department
- **Companies**: name, code, description
- **Departments**: name, description
- **Menus**: label, path

**Notes:**
- Search term must be at least 2 characters long
- Maximum limit is 50 results
- Results are automatically filtered based on user role and company access
- Menu results are filtered based on the user's role (only accessible menus are returned)

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
- Default limit is 20 items per page (10 for approvals)
- All timestamps are in UTC

### Device Types

- `ios` - iOS devices (iPhone, iPad)
- `android` - Android devices
- `web` - Web browsers
- `other` - Other device types

### Approval Request Types

- `leave` - Leave requests
- `employee_create` - New employee creation
- `employee_update` - Employee information updates
- `employee_transfer` - Employee transfers
- `employee_promotion` - Employee promotions
- `salary_change` - Salary modifications
- `department_change` - Department transfers
- `other` - Other request types

### Approval Status

- `pending` - Awaiting approval
- `approved` - Approved by all required approvers
- `rejected` - Rejected by an approver
- `cancelled` - Cancelled by requester
- `expired` - Expired before approval

### Approval Priority

- `low` - Low priority
- `normal` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent priority

## Request Logging Details

All API requests are automatically logged to the `RequestLogs` table. Each log entry contains:

### Logged Information

- **Request**:
  - HTTP method (GET, POST, PUT, DELETE, etc.)
  - Full URL and path
  - Query parameters
  - Request headers (sensitive data redacted)
  - Request body (sensitive data redacted)

- **Response**:
  - HTTP status code
  - Response body
  - Response headers

- **User Context**:
  - User ID (if authenticated)
  - Employee ID (if available)
  - Company ID (if available)

- **Metadata**:
  - Client IP address
  - User-Agent string
  - Request duration (milliseconds)
  - Service name (auth-service, employee-service, etc.)
  - Timestamp

### Data Sanitization

The following fields are automatically redacted in logs:
- Authorization headers
- Cookie headers
- X-API-Key headers
- Any field containing: `password`, `token`, `secret`, `key`, `authorization`

### Querying Logs

Request logs can be queried from the `RequestLogs` table using standard SQL:

```sql
-- Get all requests for a specific user
SELECT * FROM "RequestLogs" WHERE "userId" = 'user-uuid' ORDER BY "createdAt" DESC;

-- Get all failed requests (status >= 400)
SELECT * FROM "RequestLogs" WHERE "responseStatus" >= 400 ORDER BY "createdAt" DESC;

-- Get requests by service
SELECT * FROM "RequestLogs" WHERE "serviceName" = 'auth-service' ORDER BY "createdAt" DESC;

-- Get slow requests (> 1 second)
SELECT * FROM "RequestLogs" WHERE "duration" > 1000 ORDER BY "duration" DESC;
```


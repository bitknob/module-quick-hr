# Auth Service Endpoints

[← Back to API Documentation Index](./README.md)


Base Path: `/api/auth`

## 1. User Signup

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

## 2. User Login

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

## 3. Verify Email

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

## 4. Resend Verification Email

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

## 5. Forgot Password

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

## 6. Reset Password

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

## 7. Refresh Token

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

## 8. Get Current User

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

## 9. Change Password

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

## 10. Get Menu (Role-Based)

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


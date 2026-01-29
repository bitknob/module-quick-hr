# Auth Service Endpoints

[← Back to API Documentation Index](./README.md)

Base Path: `/api/auth`

## 1. User Signup

**Method:** `POST`  
**URL:** `/api/auth/signup`  
**Full URL:** `http://localhost:9400/api/auth/signup`  
**Authentication:** Not required

**Description:**
Create a new user account. If company details are provided (`companyName`, `companyEmail`) and the company does not exist, a new company is created with a **14-day free trial**. An employee record is also created and linked to the user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "role": "employee",
  "companyEmail": "user@company.com",
  "companyName": "Tech Corp",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "hireDate": "2024-01-01"
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
      "emailVerified": false,
      "mustChangePassword": false
    },
    "employee": {
      "id": "employee-uuid",
      "companyId": "company-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "jobTitle": "Software Engineer",
      "department": "Engineering"
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

**Enhanced Login Features:**

- **Company Email Login:** Users can login with their company email (`userCompEmail`) instead of personal email
- **Auto-Account Creation:** If a user account doesn't exist but an employee record with the company email is found, the system automatically creates a user account
- **Smart Email Detection:** The system automatically detects whether the provided email is a personal email or company email

**Login Flow:**

1. **Direct Login:** If user account exists with provided email → Login successful
2. **Company Email Login:** If no user account found but employee exists with company email → Auto-create user account → Send credentials to personal email → Instruct user to login with company email
3. **Failed Login:** If no user account or employee found → Authentication failed

**Response (200) - Successful Login:**

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
      "emailVerified": true,
      "mustChangePassword": false
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

**Response (401) - Auto-Account Creation:**

```json
{
  "header": {
    "responseCode": 401,
    "responseMessage": "User account created for company email user@company.com. Please check your personal email (personal@email.com) for credentials and login with your company email (user@company.com).",
    "responseDetail": ""
  },
  "response": null
}
```

**Note:** If `mustChangePassword` is `true`, the user must change their password before accessing other endpoints. This typically occurs when an admin creates an account with a temporary password or when auto-creating accounts from company email.

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

**cURL - Company Email Login:**

```bash
curl -X POST http://localhost:9400/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "SecurePass123!"
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
    "mustChangePassword": false,
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
      "roles": [
        "super_admin",
        "provider_admin",
        "provider_hr_staff",
        "hrbp",
        "company_admin",
        "department_head",
        "manager",
        "employee"
      ]
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
      "roles": [
        "super_admin",
        "provider_admin",
        "provider_hr_staff",
        "hrbp",
        "company_admin",
        "department_head",
        "manager"
      ]
    },
    {
      "id": "approvals",
      "label": "Approvals",
      "path": "/dashboard/approvals",
      "icon": "check-circle",
      "roles": [
        "super_admin",
        "provider_admin",
        "provider_hr_staff",
        "hrbp",
        "company_admin",
        "department_head",
        "manager"
      ],
      "children": [
        {
          "id": "approvals-pending",
          "label": "Pending Approvals",
          "path": "/dashboard/approvals/pending",
          "roles": [
            "super_admin",
            "provider_admin",
            "provider_hr_staff",
            "hrbp",
            "company_admin",
            "department_head",
            "manager"
          ]
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
      "roles": [
        "super_admin",
        "provider_admin",
        "provider_hr_staff",
        "hrbp",
        "company_admin",
        "department_head",
        "manager",
        "employee"
      ],
      "children": [
        {
          "id": "leave-requests",
          "label": "My Leave Requests",
          "path": "/dashboard/leave/requests",
          "roles": [
            "super_admin",
            "provider_admin",
            "provider_hr_staff",
            "hrbp",
            "company_admin",
            "department_head",
            "manager",
            "employee"
          ]
        },
        {
          "id": "leave-create",
          "label": "Request Leave",
          "path": "/dashboard/leave/create",
          "roles": [
            "super_admin",
            "provider_admin",
            "provider_hr_staff",
            "hrbp",
            "company_admin",
            "department_head",
            "manager",
            "employee"
          ]
        }
      ]
    },
    {
      "id": "attendance",
      "label": "Attendance",
      "path": "/dashboard/attendance",
      "icon": "clock",
      "roles": [
        "super_admin",
        "provider_admin",
        "provider_hr_staff",
        "hrbp",
        "company_admin",
        "department_head",
        "manager",
        "employee"
      ]
    },
    {
      "id": "profile",
      "label": "Profile",
      "path": "/dashboard/profile",
      "icon": "user",
      "roles": [
        "super_admin",
        "provider_admin",
        "provider_hr_staff",
        "hrbp",
        "company_admin",
        "department_head",
        "manager",
        "employee"
      ]
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

## 11. Create User Account for Employee

**Method:** `POST`  
**URL:** `/api/auth/create-user-for-employee`  
**Full URL:** `http://localhost:9400/api/auth/create-user-for-employee`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `company_admin`

**Description:**
Create a user account for an employee with a system-generated temporary password. Notifies the user via email with their credentials and the company name. The employee will be required to change their password on first login. This endpoint is typically used when administrators onboard new employees.

**Request Body:**

```json
{
  "email": "newemployee@company.com",
  "phoneNumber": "+1234567890",
  "role": "employee",
  "companyName": "Acme Corp"
}
```

**Request Body Parameters:**

- `email` (string, required) - Employee email address (must be unique)
- `phoneNumber` (string, optional) - Employee phone number
- `role` (string, optional) - User role. Default: `employee`. Options: `employee`, `manager`, `department_head`, `company_admin`, `hrbp`, `provider_hr_staff`, `provider_admin`, `super_admin`
- `companyName` (string, optional) - Name of the company. If provided, the system sends a welcome email with credentials and this company name.

**Response (201):**

```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "User account created successfully",
    "responseDetail": "Employee must change password on first login"
  },
  "response": {
    "user": {
      "id": "uuid",
      "email": "newemployee@company.com",
      "role": "employee",
      "emailVerified": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "Xy9@mK2pLq4n"
  }
}
```

**Important Notes:**

- The `temporaryPassword` is only returned once and should be securely communicated to the employee if email delivery fails.
- The password is randomly generated with 12 characters including uppercase, lowercase, numbers, and special characters.
- The `mustChangePassword` flag is set to `true`, requiring the employee to change their password on first login.
- **Welcome Email:** The system automatically sends a welcome email to the user with their credentials and the provided `companyName`.
- Only administrators can create user accounts for employees.
- Super admin and provider admin roles can only be created by super admins.

**Error Responses:**

**409 - Email Already Exists:**

```json
{
  "header": {
    "responseCode": 409,
    "responseMessage": "User account already exists for this email",
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
    "responseMessage": "Only super admins can create super admin or provider admin accounts",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**

```bash
curl -X POST http://localhost:9400/api/auth/create-user-for-employee \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemployee@company.com",
    "phoneNumber": "+1234567890",
    "role": "employee",
    "companyName": "Acme Corp"
  }'
```

**Security Considerations:**

- The temporary password is included in the response and also sent to the user via welcome email.
- The temporary password is only shown once in the API response.
- Employees must change their password on first login.
- The system enforces password complexity requirements when changing the password.

**Workflow:**

1. Admin calls this endpoint to create a user account (providing `companyName`).
2. System generates a secure temporary password.
3. System sends a welcome email to the user with the credentials and company name.
4. Response includes the credentials (as a fallback).
5. Employee logs in with the temporary password.
6. System detects `mustChangePassword: true` and prompts for password change.
7. Employee sets a new password and can then access the system normally.

---

## 12. Resend Credentials

**Method:** `POST`  
**URL:** `/api/auth/resend-credentials`  
**Full URL:** `http://localhost:9400/api/auth/resend-credentials`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `company_admin`

**Description:**
Resets a user's password to a system-generated temporary password and resends the welcome email with the new credentials. This is useful when an employee loses their initial login details or the initial email failed to deliver. The user will be required to change their password on the next login.

**Security Enhancement:** The system now automatically fetches the company name from the employee record instead of accepting it from the request body, preventing potential security vulnerabilities.

**Request Body:**

```json
{
  "email": "employee@company.com"
}
```

**Request Body Parameters:**

- `email` (string, required) - Email address of the user to reset credentials for. Can be either personal email or company email.

**Enhanced Features:**

- **Automatic Company Detection:** The system automatically finds the employee record and fetches the associated company name
- **Smart Email Resolution:** Works with both personal email (`userEmail`) and company email (`userCompEmail`)
- **Secure Email Content:** The welcome email displays the company email for login credentials instead of personal email

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "User credentials reset and resent successfully",
    "responseDetail": "Employee must change password on login"
  },
  "response": {
    "temporaryPassword": "NewTempPass123!",
    "mustChangePassword": true
  }
}
```

**Important Notes:**

- **Destructive Action:** This immediately invalidates the user's current password.
- **Email Delivery:** The system attempts to send an email with the new credentials to the user's personal email.
- **Company Email in Credentials:** The email sent shows the company email (for login) instead of personal email.
- **Fallback:** The new temporary password is returned in the API response so the admin can manually share it if email delivery fails.
- **Security:** The password is randomly generated and complex.
- **Forced Change:** The `mustChangePassword` flag is set to `true`.

**Email Content:**

The welcome email sent to the user contains:

- **Company Email:** The email used for login (company email)
- **Temporary Password:** System-generated secure password
- **Company Name:** Automatically fetched from employee record
- **Login Instructions:** Directs user to change password on first login

**Error Responses:**

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

**404 - Employee Not Found:**

```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Employee record not found for this email",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**

```bash
curl -X POST http://localhost:9400/api/auth/resend-credentials \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@company.com"
  }'
```

**cURL - Using Personal Email:**

```bash
curl -X POST http://localhost:9400/api/auth/resend-credentials \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "personal@email.com"
  }'
```

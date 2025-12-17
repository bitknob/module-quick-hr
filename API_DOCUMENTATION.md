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


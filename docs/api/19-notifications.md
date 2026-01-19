# Notification Management API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/notifications`

The Notification Management API provides comprehensive notification management with support for multiple delivery channels (in-app, email, push), notification types, and flexible filtering options.

## Overview

The notification system supports:
- Multiple notification types (leave, document, approval, attendance, payslip, etc.)
- Multiple delivery channels (in-app, email, push notifications)
- Notification status tracking (pending, sent, read, failed)
- Scheduling notifications for future delivery
- Rich metadata and additional data
- Read/unread status management
- Filtering and pagination

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Access Control

- **Create Notifications:** All authenticated users (typically system-generated)
- **View Notifications:** Users can only view their own notifications
- **Mark as Read/Delete:** Users can only manage their own notifications
- **Send Notifications:** System operations (typically automated)

---

## Notification Types

The following notification types are supported:

- `leave_request` - Leave request created
- `leave_approved` - Leave request approved
- `leave_rejected` - Leave request rejected
- `leave_cancelled` - Leave request cancelled
- `document_uploaded` - Document uploaded
- `document_verified` - Document verified
- `document_rejected` - Document rejected
- `approval_request` - Approval request created
- `approval_approved` - Approval request approved
- `approval_rejected` - Approval request rejected
- `attendance_marked` - Attendance marked
- `payslip_generated` - Payslip generated
- `employee_created` - Employee created
- `employee_updated` - Employee updated
- `system_announcement` - System announcement
- `other` - Other notifications

## Notification Status

- `pending` - Notification is pending delivery
- `sent` - Notification has been sent
- `read` - Notification has been read by the user
- `failed` - Notification delivery failed

## Notification Channels

- `in_app` - In-app notification (always stored in database)
- `email` - Email notification
- `push` - Push notification (FCM/APNS)

---

## Endpoints

### 1. Get Current Employee Notifications

**Method:** `GET`  
**URL:** `/api/notifications/me`  
**Full URL:** `http://localhost:9400/api/notifications/me?page=1&limit=20&unreadOnly=false`  
**Authentication:** Required

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)
- `status` (string, optional) - Filter by status: `pending`, `sent`, `read`, `failed`
- `type` (string, optional) - Filter by notification type
- `unreadOnly` (boolean, optional) - Only return unread notifications (default: false)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Notifications retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "companyId": "company_uuid",
      "userId": "user_uuid",
      "employeeId": "employee_uuid",
      "type": "leave_approved",
      "title": "Leave Request Approved",
      "message": "Your leave request from 2024-02-01 to 2024-02-05 has been approved",
      "data": {
        "leaveId": "leave_uuid",
        "startDate": "2024-02-01",
        "endDate": "2024-02-05"
      },
      "channels": ["in_app", "email"],
      "status": "sent",
      "readAt": null,
      "sentAt": "2024-01-25T14:00:00.000Z",
      "scheduledFor": null,
      "metadata": null,
      "employee": {
        "id": "employee_uuid",
        "firstName": "John",
        "lastName": "Doe",
        "userCompEmail": "john.doe@example.com",
        "employeeId": "EMP001"
      },
      "company": {
        "id": "company_uuid",
        "name": "Acme Corporation",
        "code": "ACME"
      },
      "createdAt": "2024-01-25T14:00:00.000Z",
      "updatedAt": "2024-01-25T14:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/notifications/me?page=1&limit=20&unreadOnly=false" \
  -H "Authorization: Bearer <access_token>"
```

---

### 2. Get Unread Count

**Method:** `GET`  
**URL:** `/api/notifications/unread-count`  
**Full URL:** `http://localhost:9400/api/notifications/unread-count`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Unread count retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "count": 5
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/notifications/unread-count \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. Mark All as Read

**Method:** `POST`  
**URL:** `/api/notifications/mark-all-read`  
**Full URL:** `http://localhost:9400/api/notifications/mark-all-read`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "3 notifications marked as read",
    "responseDetail": ""
  },
  "response": {
    "count": 3
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/notifications/mark-all-read \
  -H "Authorization: Bearer <access_token>"
```

---

### 4. Get Notification by ID

**Method:** `GET`  
**URL:** `/api/notifications/:id`  
**Full URL:** `http://localhost:9400/api/notifications/{notification_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Notification retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "companyId": "company_uuid",
    "userId": "user_uuid",
    "employeeId": "employee_uuid",
    "type": "document_verified",
    "title": "Document Verified",
    "message": "Your PAN card document has been verified",
    "data": {
      "documentId": "document_uuid",
      "documentType": "pan_card"
    },
    "channels": ["in_app", "email"],
    "status": "read",
    "readAt": "2024-01-26T10:00:00.000Z",
    "sentAt": "2024-01-25T14:00:00.000Z",
    "scheduledFor": null,
    "metadata": null,
    "employee": {
      "id": "employee_uuid",
      "firstName": "John",
      "lastName": "Doe",
      "userCompEmail": "john.doe@example.com",
      "employeeId": "EMP001"
    },
    "company": {
      "id": "company_uuid",
      "name": "Acme Corporation",
      "code": "ACME"
    },
    "createdAt": "2024-01-25T14:00:00.000Z",
    "updatedAt": "2024-01-26T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/notifications/{notification_id} \
  -H "Authorization: Bearer <access_token>"
```

---

### 5. Mark Notification as Read

**Method:** `PUT`  
**URL:** `/api/notifications/:id/read`  
**Full URL:** `http://localhost:9400/api/notifications/{notification_id}/read`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Notification marked as read",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/notifications/{notification_id}/read \
  -H "Authorization: Bearer <access_token>"
```

---

### 6. Send Notification

**Method:** `POST`  
**URL:** `/api/notifications/:id/send`  
**Full URL:** `http://localhost:9400/api/notifications/{notification_id}/send`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Notification sent successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "sent",
    "sentAt": "2024-01-25T14:00:00.000Z",
    "updatedAt": "2024-01-25T14:00:00.000Z"
  }
}
```

**Notes:**
- This endpoint triggers the delivery of the notification through all configured channels
- Email and push notifications are sent if the notification has those channels enabled
- The notification status is updated to `sent` upon successful delivery

**cURL:**
```bash
curl -X POST http://localhost:9400/api/notifications/{notification_id}/send \
  -H "Authorization: Bearer <access_token>"
```

---

### 7. Get All Notifications

**Method:** `GET`  
**URL:** `/api/notifications`  
**Full URL:** `http://localhost:9400/api/notifications?page=1&limit=20&status=sent&type=leave_approved`  
**Authentication:** Required

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)
- `status` (string, optional) - Filter by status: `pending`, `sent`, `read`, `failed`
- `type` (string, optional) - Filter by notification type
- `unreadOnly` (boolean, optional) - Only return unread notifications (default: false)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Notifications retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "companyId": "company_uuid",
      "userId": "user_uuid",
      "type": "leave_approved",
      "title": "Leave Request Approved",
      "message": "Your leave request has been approved",
      "status": "sent",
      "readAt": null,
      "createdAt": "2024-01-25T14:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/notifications?page=1&limit=20&status=sent&type=leave_approved" \
  -H "Authorization: Bearer <access_token>"
```

---

### 8. Create Notification

**Method:** `POST`  
**URL:** `/api/notifications`  
**Full URL:** `http://localhost:9400/api/notifications?companyId=company_uuid`  
**Authentication:** Required

**Query Parameters:**
- `companyId` (string, required) - Company UUID

**Request Body:**
```json
{
  "userId": "user_uuid",
  "employeeId": "employee_uuid",
  "type": "leave_approved",
  "title": "Leave Request Approved",
  "message": "Your leave request from 2024-02-01 to 2024-02-05 has been approved",
  "data": {
    "leaveId": "leave_uuid",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05"
  },
  "channels": ["in_app", "email"],
  "scheduledFor": "2024-01-26T10:00:00.000Z"
}
```

**Field Descriptions:**
- `userId` (string, required) - User UUID from auth service
- `employeeId` (string, optional) - Employee UUID (for employee-related notifications)
- `type` (string, required) - Notification type (see Notification Types above)
- `title` (string, required) - Notification title
- `message` (string, required) - Notification message
- `data` (object, optional) - Additional data related to the notification
- `channels` (array, optional) - Delivery channels: `in_app`, `email`, `push` (default: `["in_app"]`)
- `scheduledFor` (string, optional) - ISO 8601 datetime for scheduled delivery

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Notification created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "companyId": "company_uuid",
    "userId": "user_uuid",
    "employeeId": "employee_uuid",
    "type": "leave_approved",
    "title": "Leave Request Approved",
    "message": "Your leave request from 2024-02-01 to 2024-02-05 has been approved",
    "data": {
      "leaveId": "leave_uuid",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05"
    },
    "channels": ["in_app", "email"],
    "status": "pending",
    "readAt": null,
    "sentAt": null,
    "scheduledFor": "2024-01-26T10:00:00.000Z",
    "metadata": null,
    "createdAt": "2024-01-25T14:00:00.000Z",
    "updatedAt": "2024-01-25T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:9400/api/notifications?companyId=company_uuid" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_uuid",
    "employeeId": "employee_uuid",
    "type": "leave_approved",
    "title": "Leave Request Approved",
    "message": "Your leave request has been approved",
    "channels": ["in_app", "email"]
  }'
```

**Notes:**
- Notifications are typically created by the system automatically when events occur
- If `scheduledFor` is provided and is in the future, the notification will remain in `pending` status until the scheduled time
- If `scheduledFor` is not provided or is in the past, the notification is ready to be sent immediately

---

### 9. Delete Notification

**Method:** `DELETE`  
**URL:** `/api/notifications/:id`  
**Full URL:** `http://localhost:9400/api/notifications/{notification_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Notification deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/notifications/{notification_id} \
  -H "Authorization: Bearer <access_token>"
```

---

## Notification Channels

### In-App Notifications

In-app notifications are always stored in the database and displayed in the application's notification center. This is the default channel and is always enabled.

### Email Notifications

Email notifications are sent to the employee's registered email address. The email includes the notification title and message in a formatted HTML template.

**Prerequisites:**
- Email service must be configured in the auth service
- Employee must have a valid email address

### Push Notifications

Push notifications are sent to the user's registered devices via FCM (Firebase Cloud Messaging) for Android and APNS (Apple Push Notification Service) for iOS.

**Prerequisites:**
- Firebase must be initialized
- User must have registered devices with FCM/APNS tokens
- Push notification channels must be enabled

---

## Notification Data Structure

The `data` field in notifications can contain any JSON-serializable object. Common patterns:

**Leave Notifications:**
```json
{
  "leaveId": "leave_uuid",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "leaveType": "annual"
}
```

**Document Notifications:**
```json
{
  "documentId": "document_uuid",
  "documentType": "pan_card",
  "documentName": "PAN Card"
}
```

**Approval Notifications:**
```json
{
  "approvalRequestId": "approval_uuid",
  "requestType": "leave_request",
  "entityId": "leave_uuid"
}
```

---

## Error Responses

- `400 Bad Request` - Invalid request body or missing required fields
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User does not have permission to access the notification
- `404 Not Found` - Notification not found
- `500 Internal Server Error` - Server error

---

## Best Practices

1. **Notification Creation**: Notifications are typically created automatically by the system when events occur (leave approved, document verified, etc.)

2. **Channel Selection**: 
   - Use `in_app` for all notifications (default)
   - Add `email` for important notifications that require immediate attention
   - Add `push` for time-sensitive notifications

3. **Message Content**: Keep titles concise (50 characters or less) and messages clear and actionable

4. **Data Field**: Include relevant entity IDs and metadata to enable deep linking in the application

5. **Scheduling**: Use `scheduledFor` for notifications that should be sent at a specific time (e.g., reminder notifications)

6. **Cleanup**: Old read notifications can be automatically cleaned up after a certain period (e.g., 90 days)

---

## Integration Examples

### Creating a Notification for Leave Approval

```javascript
// When a leave request is approved
await NotificationService.sendNotificationImmediately({
  companyId: leaveRequest.companyId,
  userId: employee.userId,
  employeeId: employee.id,
  type: NotificationType.LEAVE_APPROVED,
  title: "Leave Request Approved",
  message: `Your leave request from ${startDate} to ${endDate} has been approved`,
  data: {
    leaveId: leaveRequest.id,
    startDate: leaveRequest.startDate,
    endDate: leaveRequest.endDate,
    leaveType: leaveRequest.leaveType,
  },
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
});
```

### Creating a Notification for Document Verification

```javascript
// When a document is verified
await NotificationService.sendNotificationImmediately({
  companyId: document.companyId,
  userId: employee.userId,
  employeeId: employee.id,
  type: NotificationType.DOCUMENT_VERIFIED,
  title: "Document Verified",
  message: `Your ${documentType} document has been verified`,
  data: {
    documentId: document.id,
    documentType: document.documentType,
    documentName: document.documentName,
  },
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
});
```

---

## Related APIs

- [Employee Service](./07-employees.md) - Employee management
- [Leave Management](./15-leaves.md) - Leave requests that generate notifications
- [Employee Documents](./16-employee-documents.md) - Document management that generates notifications
- [Approval System](./04-approvals.md) - Approval workflow that generates notifications
- [Device Management](./03-devices.md) - Device registration for push notifications


# Approval System Endpoints

[← Back to API Documentation Index](./README.md)


Base Path: `/api/approvals`

All approval endpoints require authentication and employee context.

## 1. Create Approval Request

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

## 2. Get Approval Request

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

## 3. Get Approval Requests

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

## 4. Get Pending Approvals

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

## 5. Approve Request

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

## 6. Reject Request

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

## 7. Cancel Request

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


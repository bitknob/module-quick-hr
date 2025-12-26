# Leave Management API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/leaves`

The Leave Management API provides comprehensive leave request management with approval workflow, overlap detection, and integration with attendance and payroll systems.

## Overview

The leave management system supports:
- Multiple leave types (annual, sick, casual, maternity, paternity, unpaid)
- Leave approval workflow with manager-based approvals
- Overlap detection to prevent conflicting leave requests
- Integration with attendance for accurate workday calculations
- Search and filtering capabilities

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Access Control

- **Create/Update/Cancel Leave:** All authenticated employees (for their own leaves)
- **Approve/Reject Leave:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `manager`, `department_head`
- **Delete Leave:** All authenticated employees (for their own pending leaves)
- **View Leaves:** All authenticated users (with company-based filtering)

---

## Endpoints

### 1. Create Leave Request

**Method:** `POST`  
**URL:** `/api/leaves`  
**Full URL:** `http://localhost:9400/api/leaves`  
**Authentication:** Required

**Request Body:**
```json
{
  "employeeId": "employee_uuid",
  "companyId": "company_uuid",
  "leaveType": "annual",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Family vacation"
}
```

**Field Descriptions:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID
- `leaveType` (string, required) - Leave type: `annual`, `sick`, `casual`, `maternity`, `paternity`, `unpaid`
- `startDate` (string/date, required) - Leave start date (YYYY-MM-DD)
- `endDate` (string/date, required) - Leave end date (YYYY-MM-DD)
- `reason` (string, optional) - Reason for leave

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Leave request created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "leaveType": "annual",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "reason": "Family vacation",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/leaves \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "leaveType": "annual",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "reason": "Family vacation"
  }'
```

**Error Responses:**
- `409 Conflict` - Leave request overlaps with existing approved or pending leave
- `400 Bad Request` - End date before start date, or start date in the past
- `404 Not Found` - Employee not found or not active

---

### 2. Get Leave Request

**Method:** `GET`  
**URL:** `/api/leaves/:id`  
**Full URL:** `http://localhost:9400/api/leaves/{leave_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Leave request UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave request retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "leaveType": "annual",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "reason": "Family vacation",
    "status": "approved",
    "approvedBy": "approver_uuid",
    "approvedAt": "2024-01-25T14:00:00.000Z",
    "employee": {
      "id": "employee_uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "employeeId": "EMP001"
    },
    "approver": {
      "id": "approver_uuid",
      "firstName": "Manager",
      "lastName": "Name",
      "employeeId": "MGR001"
    },
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-25T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/leaves/{leave_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. Update Leave Request

**Method:** `PUT`  
**URL:** `/api/leaves/:id`  
**Full URL:** `http://localhost:9400/api/leaves/{leave_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Leave request UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Request Body:**
```json
{
  "leaveType": "sick",
  "startDate": "2024-02-01",
  "endDate": "2024-02-03",
  "reason": "Medical appointment"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave request updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "leaveType": "sick",
    "startDate": "2024-02-01",
    "endDate": "2024-02-03",
    "reason": "Medical appointment",
    "updatedAt": "2024-01-21T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/leaves/{leave_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "sick",
    "startDate": "2024-02-01",
    "endDate": "2024-02-03"
  }'
```

**Error Responses:**
- `400 Bad Request` - Only pending leave requests can be updated
- `409 Conflict` - Updated leave request overlaps with existing approved or pending leave

---

### 4. Delete Leave Request

**Method:** `DELETE`  
**URL:** `/api/leaves/:id`  
**Full URL:** `http://localhost:9400/api/leaves/{leave_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Leave request UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave request deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/leaves/{leave_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400 Bad Request` - Cannot delete approved leave request

---

### 5. Cancel Leave Request

**Method:** `POST`  
**URL:** `/api/leaves/:id/cancel`  
**Full URL:** `http://localhost:9400/api/leaves/{leave_id}/cancel`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Leave request UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave request cancelled successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "cancelled",
    "updatedAt": "2024-01-22T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/leaves/{leave_id}/cancel?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400 Bad Request` - Only pending leave requests can be cancelled

---

### 6. Approve Leave Request

**Method:** `POST`  
**URL:** `/api/leaves/:id/approve`  
**Full URL:** `http://localhost:9400/api/leaves/{leave_id}/approve`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `manager`, `department_head`

**Path Parameters:**
- `id` (string, required) - Leave request UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave request approved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "approved",
    "approvedBy": "approver_uuid",
    "approvedAt": "2024-01-25T14:00:00.000Z",
    "updatedAt": "2024-01-25T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/leaves/{leave_id}/approve?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400 Bad Request` - Only pending leave requests can be approved
- `409 Conflict` - Cannot approve leave request that overlaps with existing approved leave

**Notes:**
- The approver is automatically set to the authenticated user
- The system checks for overlapping approved leaves before approval

---

### 7. Reject Leave Request

**Method:** `POST`  
**URL:** `/api/leaves/:id/reject`  
**Full URL:** `http://localhost:9400/api/leaves/{leave_id}/reject`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `manager`, `department_head`

**Path Parameters:**
- `id` (string, required) - Leave request UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave request rejected successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "rejected",
    "approvedBy": "approver_uuid",
    "approvedAt": "2024-01-25T14:00:00.000Z",
    "updatedAt": "2024-01-25T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/leaves/{leave_id}/reject?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400 Bad Request` - Only pending leave requests can be rejected

---

### 8. Get Leaves by Employee

**Method:** `GET`  
**URL:** `/api/leaves/employee/:employeeId`  
**Full URL:** `http://localhost:9400/api/leaves/employee/{employee_id}?startDate=2024-01-01&endDate=2024-12-31&status=approved`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID or User UUID (both are supported)

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control
- `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
- `endDate` (string, optional) - End date filter (YYYY-MM-DD)
- `status` (string, optional) - Filter by status: `pending`, `approved`, `rejected`, `cancelled`

**Notes:**
- The `employeeId` parameter accepts both employee UUID and user UUID
- If a user UUID is provided, the system will automatically resolve it to the corresponding employee UUID
- If the current user requests their own leaves using their user UUID and no employee record exists, an empty array is returned

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave requests retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "leaveType": "annual",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "status": "approved",
      "approvedBy": "approver_uuid",
      "approvedAt": "2024-01-25T14:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/leaves/employee/{employee_id}?startDate=2024-01-01&endDate=2024-12-31&status=approved" \
  -H "Authorization: Bearer <access_token>"
```

**Response (200) - No Employee Record:**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave requests retrieved successfully (no employee record)",
    "responseDetail": ""
  },
  "response": []
}
```

---

### 9. Get Leaves by Company

**Method:** `GET`  
**URL:** `/api/leaves/company/:companyId`  
**Full URL:** `http://localhost:9400/api/leaves/company/{company_id}?startDate=2024-01-01&endDate=2024-12-31&status=pending&leaveType=annual`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string, required) - Company UUID

**Query Parameters:**
- `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
- `endDate` (string, optional) - End date filter (YYYY-MM-DD)
- `status` (string, optional) - Filter by status: `pending`, `approved`, `rejected`, `cancelled`
- `leaveType` (string, optional) - Filter by leave type: `annual`, `sick`, `casual`, `maternity`, `paternity`, `unpaid`

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave requests retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "leaveType": "annual",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "status": "pending",
      "employee": {
        "id": "employee_uuid",
        "firstName": "John",
        "lastName": "Doe",
        "employeeId": "EMP001"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/leaves/company/{company_id}?startDate=2024-01-01&endDate=2024-12-31&status=pending" \
  -H "Authorization: Bearer <access_token>"
```

---

### 10. Get Pending Leaves for Approver

**Method:** `GET`  
**URL:** `/api/leaves/pending`  
**Full URL:** `http://localhost:9400/api/leaves/pending?companyId=company_uuid`  
**Authentication:** Required

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pending leave requests retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "leaveType": "annual",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "status": "pending",
      "employee": {
        "id": "employee_uuid",
        "firstName": "John",
        "lastName": "Doe",
        "employeeId": "EMP001",
        "managerId": "approver_uuid"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/leaves/pending?companyId=company_uuid" \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Returns only leave requests from employees where the authenticated user is the manager
- Useful for managers to see all pending leave requests from their direct reports

---

### 11. Search Leaves

**Method:** `GET`  
**URL:** `/api/leaves/search`  
**Full URL:** `http://localhost:9400/api/leaves/search?companyId=company_uuid&employeeId=employee_uuid&startDate=2024-01-01&endDate=2024-12-31&status=approved&leaveType=annual&page=1&limit=20`  
**Authentication:** Required

**Query Parameters:**
- `companyId` (string, optional) - Filter by company
- `employeeId` (string, optional) - Filter by employee
- `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
- `endDate` (string, optional) - End date filter (YYYY-MM-DD)
- `status` (string, optional) - Filter by status: `pending`, `approved`, `rejected`, `cancelled`
- `leaveType` (string, optional) - Filter by leave type: `annual`, `sick`, `casual`, `maternity`, `paternity`, `unpaid`
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Leave requests retrieved successfully",
    "responseDetail": "Total: 50, Page: 1, Limit: 20, Total Pages: 3"
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "leaveType": "annual",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "status": "approved",
      "employee": {
        "id": "employee_uuid",
        "firstName": "John",
        "lastName": "Doe",
        "employeeId": "EMP001"
      },
      "approver": {
        "id": "approver_uuid",
        "firstName": "Manager",
        "lastName": "Name",
        "employeeId": "MGR001"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/leaves/search?companyId=company_uuid&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

---

## Leave Types

- `annual` - Annual leave / Vacation
- `sick` - Sick leave
- `casual` - Casual leave
- `maternity` - Maternity leave
- `paternity` - Paternity leave
- `unpaid` - Unpaid leave

## Leave Status Values

- `pending` - Leave request is pending approval
- `approved` - Leave request has been approved
- `rejected` - Leave request has been rejected
- `cancelled` - Leave request has been cancelled by the employee

## Integration with Attendance and Payroll

The leave management system integrates with:

1. **Attendance Service:** Approved leaves are considered when calculating attendance statistics and workday counts
2. **Payroll Service:** Approved leaves are used in payroll calculations to determine:
   - Working days for pro-rata salary calculations
   - Leave days for payslip generation
   - Loss of pay calculations

The system ensures that:
- Only approved leaves are counted in attendance and payroll calculations
- Overlapping leave requests are prevented
- Leave dates are validated against attendance records


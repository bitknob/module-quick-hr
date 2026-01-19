# Attendance Management API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/attendance`

The Attendance Management API provides comprehensive attendance tracking with check-in/check-out functionality and workday calculations that integrate with the payroll service.

## Overview

The attendance system supports:
- Daily attendance tracking with check-in/check-out timestamps
- Multiple attendance statuses (present, absent, late, half_day)
- Attendance statistics and workday calculations
- Integration with leave management for accurate workday calculations
- Search and filtering capabilities

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Access Control

- **Create/Update Attendance:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `manager`
- **Delete Attendance:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`
- **View Attendance:** All authenticated users (with company-based filtering)

---

## Endpoints

### 1. Create Attendance Record

**Method:** `POST`  
**URL:** `/api/attendance`  
**Full URL:** `http://localhost:9400/api/attendance`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `manager`

**Request Body:**
```json
{
  "employeeId": "employee_uuid",
  "companyId": "company_uuid",
  "date": "2024-01-15",
  "checkIn": "2024-01-15T09:00:00.000Z",
  "checkOut": "2024-01-15T18:00:00.000Z",
  "status": "present",
  "notes": "Regular attendance"
}
```

**Field Descriptions:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID
- `date` (string/date, required) - Attendance date (YYYY-MM-DD)
- `checkIn` (string/date, optional) - Check-in timestamp
- `checkOut` (string/date, optional) - Check-out timestamp
- `status` (string, optional) - Attendance status: `present`, `absent`, `late`, `half_day` (default: `present`)
- `notes` (string, optional) - Additional notes

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Attendance created successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "date": "2024-01-15",
    "checkIn": "2024-01-15T09:00:00.000Z",
    "checkOut": "2024-01-15T18:00:00.000Z",
    "status": "present",
    "notes": "Regular attendance",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/attendance \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "date": "2024-01-15",
    "status": "present"
  }'
```

**Error Responses:**
- `409 Conflict` - Attendance record already exists for this date
- `400 Bad Request` - Check-out time before check-in time
- `404 Not Found` - Employee not found

---

### 2. Get Attendance Record

**Method:** `GET`  
**URL:** `/api/attendance/:id`  
**Full URL:** `http://localhost:9400/api/attendance/{attendance_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Attendance record UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendance retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "date": "2024-01-15",
    "checkIn": "2024-01-15T09:00:00.000Z",
    "checkOut": "2024-01-15T18:00:00.000Z",
    "status": "present",
    "notes": "Regular attendance",
    "employee": {
      "id": "employee_uuid",
      "firstName": "John",
      "lastName": "Doe",
      "userCompEmail": "john.doe@example.com",
      "employeeId": "EMP001"
    },
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/attendance/{attendance_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. Update Attendance Record

**Method:** `PUT`  
**URL:** `/api/attendance/:id`  
**Full URL:** `http://localhost:9400/api/attendance/{attendance_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `manager`

**Path Parameters:**
- `id` (string, required) - Attendance record UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Request Body:**
```json
{
  "checkIn": "2024-01-15T09:15:00.000Z",
  "checkOut": "2024-01-15T18:30:00.000Z",
  "status": "late",
  "notes": "Arrived 15 minutes late"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendance updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "late",
    "checkIn": "2024-01-15T09:15:00.000Z",
    "checkOut": "2024-01-15T18:30:00.000Z",
    "notes": "Arrived 15 minutes late",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/attendance/{attendance_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "late",
    "notes": "Arrived 15 minutes late"
  }'
```

---

### 4. Delete Attendance Record

**Method:** `DELETE`  
**URL:** `/api/attendance/:id`  
**Full URL:** `http://localhost:9400/api/attendance/{attendance_id}`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Path Parameters:**
- `id` (string, required) - Attendance record UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendance deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/attendance/{attendance_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

---

### 5. Check In

**Method:** `POST`  
**URL:** `/api/attendance/checkin/:employeeId/:companyId`  
**Full URL:** `http://localhost:9400/api/attendance/checkin/{employee_id}/{company_id}`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID

**Request Body (optional):**
```json
{
  "checkInTime": "2024-01-15T09:00:00.000Z"
}
```

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Checked in successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "date": "2024-01-15",
    "checkIn": "2024-01-15T09:00:00.000Z",
    "status": "present",
    "createdAt": "2024-01-15T09:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/attendance/checkin/{employee_id}/{company_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"
```

**Error Responses:**
- `409 Conflict` - Already checked in today

---

### 6. Check Out

**Method:** `POST`  
**URL:** `/api/attendance/checkout/:employeeId/:companyId`  
**Full URL:** `http://localhost:9400/api/attendance/checkout/{employee_id}/{company_id}`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID

**Request Body (optional):**
```json
{
  "checkOutTime": "2024-01-15T18:00:00.000Z"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Checked out successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "checkOut": "2024-01-15T18:00:00.000Z",
    "updatedAt": "2024-01-15T18:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/attendance/checkout/{employee_id}/{company_id} \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"
```

**Error Responses:**
- `404 Not Found` - No check-in record found for today
- `409 Conflict` - Already checked out today
- `400 Bad Request` - Check-out time before check-in time

---

### 7. Get Attendance by Employee

**Method:** `GET`  
**URL:** `/api/attendance/employee/:employeeId`  
**Full URL:** `http://localhost:9400/api/attendance/employee/{employee_id}?startDate=2024-01-01&endDate=2024-01-31`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control
- `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
- `endDate` (string, optional) - End date filter (YYYY-MM-DD)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendances retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "date": "2024-01-15",
      "checkIn": "2024-01-15T09:00:00.000Z",
      "checkOut": "2024-01-15T18:00:00.000Z",
      "status": "present"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/attendance/employee/{employee_id}?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <access_token>"
```

---

### 8. Get Attendance by Company

**Method:** `GET`  
**URL:** `/api/attendance/company/:companyId`  
**Full URL:** `http://localhost:9400/api/attendance/company/{company_id}?startDate=2024-01-01&endDate=2024-01-31&status=present`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string, required) - Company UUID

**Query Parameters:**
- `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
- `endDate` (string, optional) - End date filter (YYYY-MM-DD)
- `status` (string, optional) - Filter by status: `present`, `absent`, `late`, `half_day`

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendances retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "date": "2024-01-15",
      "status": "present",
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
curl -X GET "http://localhost:9400/api/attendance/company/{company_id}?startDate=2024-01-01&endDate=2024-01-31&status=present" \
  -H "Authorization: Bearer <access_token>"
```

---

### 9. Get Attendance Statistics

**Method:** `GET`  
**URL:** `/api/attendance/stats/:employeeId/:companyId`  
**Full URL:** `http://localhost:9400/api/attendance/stats/{employee_id}/{company_id}?month=1&year=2024`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID

**Query Parameters:**
- `month` (number, required) - Month (1-12)
- `year` (number, required) - Year (e.g., 2024)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendance stats retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "workingDays": 22,
    "presentDays": 20,
    "absentDays": 1,
    "leaveDays": 1,
    "lateDays": 2,
    "halfDayDays": 0
  }
}
```

**Field Descriptions:**
- `workingDays` - Total working days in the month (excluding weekends)
- `presentDays` - Days marked as present (including leave days)
- `absentDays` - Days marked as absent
- `leaveDays` - Days on approved leave
- `lateDays` - Days marked as late
- `halfDayDays` - Days marked as half day

**cURL:**
```bash
curl -X GET "http://localhost:9400/api/attendance/stats/{employee_id}/{company_id}?month=1&year=2024" \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- This endpoint calculates workday statistics similar to the payroll service
- Weekends (Saturday and Sunday) are excluded from working days
- Approved leave days are counted as present days
- Statistics integrate with leave management for accurate calculations

---

### 10. Search Attendances

**Method:** `GET`  
**URL:** `/api/attendance/search`  
**Full URL:** `http://localhost:9400/api/attendance/search?companyId=company_uuid&employeeId=employee_uuid&startDate=2024-01-01&endDate=2024-01-31&status=present&page=1&limit=20`  
**Authentication:** Required

**Query Parameters:**
- `companyId` (string, optional) - Filter by company
- `employeeId` (string, optional) - Filter by employee
- `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
- `endDate` (string, optional) - End date filter (YYYY-MM-DD)
- `status` (string, optional) - Filter by status: `present`, `absent`, `late`, `half_day`
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Attendances retrieved successfully",
    "responseDetail": "Total: 50, Page: 1, Limit: 20, Total Pages: 3"
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "date": "2024-01-15",
      "status": "present",
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
curl -X GET "http://localhost:9400/api/attendance/search?companyId=company_uuid&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

---

## Attendance Status Values

- `present` - Employee is present
- `absent` - Employee is absent
- `late` - Employee arrived late but is present
- `half_day` - Employee worked half day

## Integration with Payroll

The attendance statistics calculated by this service are used by the payroll service for:
- Calculating pro-rata salary based on working days
- Determining loss of pay days
- Generating accurate payslips with attendance breakdown

The workday calculation logic matches the payroll service implementation, ensuring consistency across the system.


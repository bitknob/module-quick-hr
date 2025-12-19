# Department Service Endpoints

[← Back to API Documentation Index](./README.md)


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

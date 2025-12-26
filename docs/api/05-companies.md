# Company Service Endpoints

[← Back to API Documentation Index](./README.md)

Base Path: `/api/companies`

All company endpoints require authentication.

### 1. Get All Companies

**Method:** `GET`  
**URL:** `/api/companies`  
**Full URL:** `http://localhost:9400/api/companies`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`

**Notes:**
- Returns all companies regardless of status (both active and inactive)
- Results are sorted alphabetically by company name

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
      "profileImageUrl": "https://quick-hr.s3.ap-south-1.amazonaws.com/images/image.jpg",
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
    },
    {
      "id": "company-uuid-3",
      "name": "Old Company Ltd",
      "code": "OLD001",
      "description": "Inactive company",
      "profileImageUrl": null,
      "hrbpId": null,
      "status": "inactive",
      "createdAt": "2024-01-01T10:30:00.000Z",
      "updatedAt": "2024-12-01T10:30:00.000Z"
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
    "profileImageUrl": "https://quick-hr.s3.ap-south-1.amazonaws.com/images/image.jpg",
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
    "profileImageUrl": "https://quick-hr.s3.ap-south-1.amazonaws.com/images/image.jpg",
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
    "profileImageUrl": "https://quick-hr.s3.ap-south-1.amazonaws.com/images/image.jpg"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/companies/{company_id}/upload-profile-image \
  -H "Authorization: Bearer <access_token>" \
  -F "image=@/path/to/image.jpg"
```

**Note:** If a profile image already exists, the old image will be automatically deleted from AWS S3 before uploading the new one. Images are stored in the `images/` folder in the S3 bucket.

---

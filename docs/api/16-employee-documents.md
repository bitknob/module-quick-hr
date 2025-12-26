# Employee Documents Management API

[← Back to API Documentation Index](./README.md)

Base Path: `/api/documents`

The Employee Documents Management API provides comprehensive document upload, storage, and verification functionality for employee documents such as ID proofs, certificates, and other official documents.

## Overview

The document management system supports:
- Multiple document types (ID proof, address proof, PAN, Aadhaar, certificates, etc.)
- Document upload to AWS S3
- Document verification workflow with approval/rejection
- Expiry date tracking
- Search and filtering capabilities
- Role-based access control

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Access Control

- **Upload Documents:** All authenticated employees (for their own documents)
- **Verify/Reject Documents:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`
- **View Documents:** All authenticated users (with company-based filtering)
- **Delete Documents:** All authenticated employees (for their own documents)

---

## Document Types

The following document types are supported:
- `id_proof` - Identity proof
- `address_proof` - Address proof
- `pan_card` - PAN card
- `aadhaar_card` - Aadhaar card
- `passport` - Passport
- `driving_license` - Driving license
- `educational_certificate` - Educational certificates
- `experience_certificate` - Experience certificates
- `offer_letter` - Offer letter
- `appointment_letter` - Appointment letter
- `relieving_letter` - Relieving letter
- `salary_slip` - Salary slips
- `bank_statement` - Bank statements
- `form_16` - Form 16
- `other` - Other documents

## Document Status

- `pending` - Document is pending verification
- `verified` - Document has been verified
- `rejected` - Document has been rejected
- `expired` - Document has expired

## Supported File Types

- PDF files (`.pdf`)
- Images: JPEG, PNG, GIF, WebP
- Word Documents: `.doc`, `.docx`

**File Size Limits:**
- Maximum file size: 2MB (before compression)
- Files are automatically compressed before upload to optimize storage usage
- After compression, files are typically 30-70% smaller
- Images are compressed and resized to max 1920x1920px with 85% quality
- Compression typically reduces image file sizes by 30-70%

---

## Endpoints

### 1. Upload Document

**Method:** `POST`  
**URL:** `/api/documents/upload`  
**Full URL:** `http://localhost:9400/api/documents/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `document` (file, required) - Document file to upload
- `employeeId` (string, required) - Employee UUID
- `companyId` (string, required) - Company UUID
- `documentType` (string, required) - Document type (see Document Types above)
- `documentName` (string, required) - Name/description of the document
- `expiryDate` (string, optional) - Expiry date (YYYY-MM-DD)
- `notes` (string, optional) - Additional notes

**Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Document uploaded successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "documentType": "pan_card",
    "documentName": "PAN Card",
    "fileUrl": "https://storage.googleapis.com/...",
    "fileName": "pan_card.pdf",
    "fileSize": 245678,
    "mimeType": "application/pdf",
    "status": "pending",
    "expiryDate": "2025-12-31",
    "notes": "Original PAN card",
    "uploadedBy": "user_uuid",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/documents/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "document=@/path/to/document.pdf" \
  -F "employeeId=employee_uuid" \
  -F "companyId=company_uuid" \
  -F "documentType=pan_card" \
  -F "documentName=PAN Card" \
  -F "expiryDate=2025-12-31"
```

**Error Responses:**
- `400 Bad Request` - Invalid file type or file size exceeds 2MB
- `404 Not Found` - Employee not found
- `400 Bad Request` - Employee does not belong to the specified company

---

### 2. Get Document

**Method:** `GET`  
**URL:** `/api/documents/:id`  
**Full URL:** `http://localhost:9400/api/documents/{document_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Document UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Document retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "employeeId": "employee_uuid",
    "companyId": "company_uuid",
    "documentType": "pan_card",
    "documentName": "PAN Card",
    "fileUrl": "https://storage.googleapis.com/...",
    "fileName": "pan_card.pdf",
    "fileSize": 245678,
    "mimeType": "application/pdf",
    "status": "verified",
    "verifiedBy": "verifier_uuid",
    "verifiedAt": "2024-01-16T14:00:00.000Z",
    "expiryDate": "2025-12-31",
    "notes": "Original PAN card",
    "employee": {
      "id": "employee_uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "employeeId": "EMP001"
    },
    "verifier": {
      "id": "verifier_uuid",
      "firstName": "Manager",
      "lastName": "Name",
      "employeeId": "MGR001"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/documents/{document_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. Update Document

**Method:** `PUT`  
**URL:** `/api/documents/:id`  
**Full URL:** `http://localhost:9400/api/documents/{document_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Document UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Request Body:**
```json
{
  "documentName": "Updated PAN Card",
  "expiryDate": "2026-12-31",
  "notes": "Updated notes"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Document updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "documentName": "Updated PAN Card",
    "expiryDate": "2026-12-31",
    "notes": "Updated notes",
    "updatedAt": "2024-01-17T10:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/documents/{document_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentName": "Updated PAN Card",
    "expiryDate": "2026-12-31"
  }'
```

**Error Responses:**
- `400 Bad Request` - Cannot update verified document

---

### 4. Delete Document

**Method:** `DELETE`  
**URL:** `/api/documents/:id`  
**Full URL:** `http://localhost:9400/api/documents/{document_id}`  
**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Document UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Document deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/documents/{document_id}?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Deletes the document record and the file from AWS S3

---

### 5. Verify Document

**Method:** `POST`  
**URL:** `/api/documents/:id/verify`  
**Full URL:** `http://localhost:9400/api/documents/{document_id}/verify`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`

**Path Parameters:**
- `id` (string, required) - Document UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Document verified successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "verified",
    "verifiedBy": "verifier_uuid",
    "verifiedAt": "2024-01-16T14:00:00.000Z",
    "updatedAt": "2024-01-16T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/documents/{document_id}/verify?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>"
```

**Error Responses:**
- `400 Bad Request` - Only pending documents can be verified

**Notes:**
- The verifier is automatically set to the authenticated user

---

### 6. Reject Document

**Method:** `POST`  
**URL:** `/api/documents/:id/reject`  
**Full URL:** `http://localhost:9400/api/documents/{document_id}/reject`  
**Authentication:** Required  
**Required Roles:** `super_admin`, `provider_admin`, `provider_hr_staff`, `hrbp`, `company_admin`, `department_head`, `manager`

**Path Parameters:**
- `id` (string, required) - Document UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control

**Request Body:**
```json
{
  "rejectionReason": "Document is unclear or incomplete"
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Document rejected successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "uuid",
    "status": "rejected",
    "verifiedBy": "verifier_uuid",
    "verifiedAt": "2024-01-16T14:00:00.000Z",
    "rejectionReason": "Document is unclear or incomplete",
    "updatedAt": "2024-01-16T14:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/documents/{document_id}/reject?companyId=company_uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Document is unclear or incomplete"
  }'
```

**Error Responses:**
- `400 Bad Request` - Only pending documents can be rejected

---

### 7. Get Documents by Employee

**Method:** `GET`  
**URL:** `/api/documents/employee/:employeeId`  
**Full URL:** `http://localhost:9400/api/documents/employee/{employee_id}?documentType=pan_card&status=verified`  
**Authentication:** Required

**Path Parameters:**
- `employeeId` (string, required) - Employee UUID

**Query Parameters:**
- `companyId` (string, optional) - Company ID for access control
- `documentType` (string, optional) - Filter by document type
- `status` (string, optional) - Filter by status: `pending`, `verified`, `rejected`, `expired`

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Documents retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "documentType": "pan_card",
      "documentName": "PAN Card",
      "fileUrl": "https://storage.googleapis.com/...",
      "status": "verified",
      "verifiedAt": "2024-01-16T14:00:00.000Z",
      "verifier": {
        "id": "verifier_uuid",
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
curl -X GET "http://localhost:9400/api/documents/employee/{employee_id}?documentType=pan_card&status=verified" \
  -H "Authorization: Bearer <access_token>"
```

---

### 8. Get Documents by Company

**Method:** `GET`  
**URL:** `/api/documents/company/:companyId`  
**Full URL:** `http://localhost:9400/api/documents/company/{company_id}?documentType=pan_card&status=pending`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string, required) - Company UUID

**Query Parameters:**
- `documentType` (string, optional) - Filter by document type
- `status` (string, optional) - Filter by status: `pending`, `verified`, `rejected`, `expired`

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Documents retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "documentType": "pan_card",
      "documentName": "PAN Card",
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
curl -X GET "http://localhost:9400/api/documents/company/{company_id}?status=pending" \
  -H "Authorization: Bearer <access_token>"
```

---

### 9. Get Pending Documents

**Method:** `GET`  
**URL:** `/api/documents/pending/:companyId`  
**Full URL:** `http://localhost:9400/api/documents/pending/{company_id}`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string, required) - Company UUID

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pending documents retrieved successfully",
    "responseDetail": ""
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "documentType": "pan_card",
      "documentName": "PAN Card",
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
curl -X GET http://localhost:9400/api/documents/pending/{company_id} \
  -H "Authorization: Bearer <access_token>"
```

**Notes:**
- Returns all pending documents for a company, sorted by creation date (oldest first)
- Useful for managers/admins to see documents awaiting verification

---

### 10. Search Documents

**Method:** `GET`  
**URL:** `/api/documents/search`  
**Full URL:** `http://localhost:9400/api/documents/search?companyId=company_uuid&documentType=pan_card&status=verified&page=1&limit=20`  
**Authentication:** Required

**Query Parameters:**
- `companyId` (string, optional) - Filter by company
- `employeeId` (string, optional) - Filter by employee
- `documentType` (string, optional) - Filter by document type
- `status` (string, optional) - Filter by status: `pending`, `verified`, `rejected`, `expired`
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Documents retrieved successfully",
    "responseDetail": "Total: 50, Page: 1, Limit: 20, Total Pages: 3"
  },
  "response": [
    {
      "id": "uuid",
      "employeeId": "employee_uuid",
      "documentType": "pan_card",
      "documentName": "PAN Card",
      "status": "verified",
      "employee": {
        "id": "employee_uuid",
        "firstName": "John",
        "lastName": "Doe",
        "employeeId": "EMP001"
      },
      "verifier": {
        "id": "verifier_uuid",
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
curl -X GET "http://localhost:9400/api/documents/search?companyId=company_uuid&documentType=pan_card&status=verified&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

---

## File Storage

Documents are stored in AWS S3 with the following structure:
```
s3://quick-hr/documents/{unique_filename}
```

Files are automatically made publicly accessible and a public URL is returned for direct access:
```
https://quick-hr.s3.ap-south-1.amazonaws.com/documents/{unique_filename}
```

## Document Expiry

Documents with an `expiryDate` can be automatically marked as expired when the expiry date passes. The system tracks expiry dates and can mark documents as expired during scheduled jobs or manual operations.

## Integration Notes

- Documents are linked to employees and companies for proper access control
- Verification workflow integrates with the approval system
- Document status affects employee onboarding and compliance tracking
- Expired documents can trigger notifications for renewal

## Menu Structure

The Documents menu is available in the navigation with the following structure:

- **Documents** (Main Menu)
  - **My Documents** - View personal documents (all roles)
  - **Upload Document** - Upload new documents (all roles)
  - **Pending Verification** - View documents awaiting verification (manager/admin roles)
  - **All Documents** - View all company documents (admin roles)

Additionally, under the **Employees** menu:
- **Employee Documents** - Access employee document management (all roles)


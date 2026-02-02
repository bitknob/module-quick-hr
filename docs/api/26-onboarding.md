# Onboarding API

The Onboarding API provides endpoints to complete the user onboarding process after subscription creation. This includes creating user accounts, company profiles, employee records, and assigning roles automatically.

## Base URL
```
/api/onboarding
```

## Features

- **Step-by-step onboarding** after subscription creation
- **Automatic user creation** with validation
- **Company profile setup** with all business details
- **Employee record creation** with job information
- **Role assignment** (admin role by default)
- **Business email validation** for professional accounts
- **Comprehensive field validation** for all data types

## Endpoints

### Complete Onboarding

Complete the onboarding process by creating user, company, employee, and assigning roles.

**Endpoint:** `POST /api/onboarding/complete`

**Authentication:** None required (post-subscription onboarding)

**Request Body:**
```json
{
  "subscriptionId": 1,
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "password": "securePassword123",
    "phone": "+919876543210",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "123 Main Street, City"
  },
  "companyData": {
    "name": "Acme Corporation",
    "code": "ACME2024",
    "description": "Technology solutions provider",
    "industry": "Technology",
    "website": "https://acme.com",
    "phone": "+919876543210",
    "email": "contact@acme.com",
    "address": "456 Business Ave, Tech City",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postalCode": "560001"
  },
  "employeeData": {
    "department": "Management",
    "designation": "Company Administrator",
    "workLocation": "Office",
    "employmentType": "full-time",
    "dateOfJoining": "2024-01-01",
    "workEmail": "john@acme.com",
    "workPhone": "+919876543210"
  }
}
```

**Request Fields:**
- `subscriptionId` (required): ID of the subscription created earlier
- `userData` (required): User account information
  - `firstName` (required): User's first name
  - `lastName` (required): User's last name
  - `email` (required): **Business email address only**
  - `password` (required): Password (min 6 characters)
  - `phone` (optional): Phone number
  - `dateOfBirth` (optional): Date of birth (YYYY-MM-DD)
  - `gender` (optional): male, female, or other
  - `address` (optional): Residential address
- `companyData` (required): Company information
  - `name` (required): Company legal name
  - `code` (required): Unique company code
  - `description` (optional): Company description
  - `industry` (optional): Industry sector
  - `website` (optional): Company website
  - `phone` (optional): Company phone
  - `email` (required): Company email address
  - `address` (optional): Company address
  - `city` (optional): Company city
  - `state` (optional): Company state
  - `country` (optional): Company country
  - `postalCode` (optional): Postal code
- `employeeData` (optional): Employee job information
  - `department` (optional): Department name (default: "Management")
  - `designation` (optional): Job title (default: "Company Administrator")
  - `workLocation` (optional): Work location (default: "Office")
  - `employmentType` (optional): full-time, part-time, contract, or intern
  - `dateOfJoining` (optional): Joining date (default: current date)
  - `workEmail` (optional): Work email (default: user email)
  - `workPhone` (optional): Work phone (default: user phone)

**Success Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Onboarding completed successfully",
    "responseDetail": ""
  },
  "response": {
    "user": {
      "id": "uuid-string",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "phone": "+919876543210",
      "status": "active"
    },
    "company": {
      "id": "uuid-string",
      "name": "Acme Corporation",
      "code": "ACME2024",
      "email": "contact@acme.com",
      "status": "active"
    },
    "employee": {
      "id": "uuid-string",
      "department": "Management",
      "designation": "Company Administrator",
      "status": "active"
    },
    "subscription": {
      "id": 1,
      "status": "trial",
      "trialEndDate": "2024-02-14T00:00:00.000Z"
    },
    "token": "jwt-token-for-immediate-login"
  }
}
```

**Error Responses:**

**Validation Error (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "[{\"field\":\"email\",\"message\":\"Business email required\"}]"
  },
  "response": null
}
```

**Subscription Not Found (404):**
```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Subscription not found",
    "responseDetail": ""
  },
  "response": null
}
```

**Service Error (500):**
```json
{
  "header": {
    "responseCode": 500,
    "responseMessage": "Failed to create company",
    "responseDetail": "Company with this code already exists"
  },
  "response": null
}
```

### Get Onboarding Status

Check the onboarding status for a subscription.

**Endpoint:** `GET /api/onboarding/status/{subscriptionId}`

**Authentication:** None required

**Path Parameters:**
- `subscriptionId` (integer): The ID of the subscription

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Onboarding status retrieved",
    "responseDetail": ""
  },
  "response": {
    "subscriptionId": 1,
    "isOnboarded": true,
    "subscription": {
      "status": "trial",
      "trialEndDate": "2024-02-14T00:00:00.000Z"
    },
    "user": {
      "id": "uuid-string",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "status": "active"
    },
    "company": {
      "id": "uuid-string",
      "name": "Acme Corporation",
      "code": "ACME2024",
      "status": "active"
    }
  }
}
```

**Not Onboarded Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Onboarding status retrieved",
    "responseDetail": ""
  },
  "response": {
    "subscriptionId": 1,
    "isOnboarded": false,
    "subscription": {
      "status": "trial",
      "trialEndDate": "2024-02-14T00:00:00.000Z"
    },
    "user": null,
    "company": null
  }
}
```

## Onboarding Flow

### Step 1: Create Subscription
```bash
curl -X POST "http://localhost:9400/api/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "pricingPlanId": 28,
    "customerData": {
      "name": "John Doe",
      "email": "john@company.com",
      "contact": "+919876543210"
    },
    "interval": "monthly"
  }'
```

### Step 2: Complete Onboarding
```bash
curl -X POST "http://localhost:9400/api/onboarding/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": 1,
    "userData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "password": "securePassword123"
    },
    "companyData": {
      "name": "Acme Corporation",
      "code": "ACME2024",
      "email": "contact@acme.com"
    }
  }'
```

### Step 3: Check Status
```bash
curl -X GET "http://localhost:9400/api/onboarding/status/1"
```

## Business Email Validation

The onboarding process requires business email addresses only:

**Blocked Domains:**
- Gmail, Yahoo, Hotmail, Outlook, AOL, iCloud
- ProtonMail, Tutanota, Yandex, Rediffmail
- 80+ other personal email providers worldwide

**Allowed Domains:**
- Company domains (company.com, business.org, startup.io)
- Educational institutions (.edu, .ac)
- Government domains (.gov, .mil)

**Validation Error Example:**
```json
{
  "responseCode": 400,
  "responseMessage": "Validation error",
  "responseDetail": "Business email required. Personal email addresses (gmail.com) are not allowed for company subscriptions."
}
```

## Automatic Role Assignment

### **Multi-Tenant Role Hierarchy**

This system follows a multi-tenant SaaS HRMS architecture with clear role separation:

#### **Platform-Level Roles** (Provider Staff Only)
- **super_admin**: Platform-wide super administrator
- **provider_admin**: HR software provider administrators  
- **provider_hr_staff**: Provider's internal HR support team

#### **Company-Level Roles** (Client Organizations)
- **company_admin**: **Assigned to first subscriber** - Full admin rights for their company
- **hrbp**: HR Business Partner - Internal HR team members
- **department_head**: Department managers with team oversight
- **manager**: Team managers with direct report management
- **employee**: Standard employee role (default for most users)

### **Onboarding Role Assignment**

- **Default Role**: **Company Admin** role is automatically assigned to the first subscriber
- **Business Logic**: The person who subscribes (founder/owner/business representative) gets full administrative rights
- **Permissions**: Complete company management, employee onboarding, payroll configuration, department setup
- **Company Scope**: Role is isolated to the created company (multi-tenant data separation)
- **Future Role Management**: Company admin can later assign other roles (hrbp, manager, employee) to team members
- **Fallback**: If role assignment fails, onboarding continues with warning

### **Typical Business Flow**

1. **Free Trial Subscription** → Founder/owner signs up → Gets **company_admin** role
2. **Company Setup** → Company admin configures organization, departments, policies
3. **Employee Onboarding** → Company admin adds team members → Assigns appropriate roles
4. **Ongoing Management** → Company admin manages roles, permissions, and access levels

## Field Validation

All fields are validated according to database schema:

### User Fields
- **Email**: Valid email format + business domain validation
- **Password**: Minimum 6 characters
- **Phone**: International format validation
- **Date of Birth**: Valid date format (YYYY-MM-DD)
- **Gender**: Must be male, female, or other

### Company Fields
- **Code**: Minimum 2 characters, unique
- **Email**: Valid email format
- **Phone**: International format validation
- **Website**: Valid URL format if provided

### Employee Fields
- **Employment Type**: Must be valid enum value
- **Date of Joining**: Valid date format
- **Work Email**: Valid email format if provided

## Error Handling

### Service Communication
The onboarding service communicates with:
- **Auth Service** (port 9401): User creation and role assignment
- **Employee Service** (port 9402): Company and employee creation

### Transaction Safety
- **Atomic Operations**: All-or-nothing onboarding
- **Rollback**: Failed onboarding doesn't leave partial data
- **Error Recovery**: Clear error messages for debugging

### Common Errors
1. **Subscription Not Found**: Invalid subscription ID
2. **Email Validation**: Personal email not allowed
3. **Company Code Duplicate**: Company code already exists
4. **User Email Duplicate**: Email already registered
5. **Service Unavailable**: Communication errors with other services

## Usage Examples

### Frontend Integration
```javascript
// Complete onboarding after subscription
const completeOnboarding = async (subscriptionId, userData, companyData) => {
  try {
    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionId,
        userData,
        companyData
      })
    });
    
    const result = await response.json();
    
    if (result.header.responseCode === 201) {
      // Store token for immediate login
      localStorage.setItem('token', result.response.token);
      localStorage.setItem('user', JSON.stringify(result.response.user));
      localStorage.setItem('company', JSON.stringify(result.response.company));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Onboarding failed:', error);
  }
};
```

### cURL Examples
```bash
# Complete onboarding with minimal data
curl -X POST "http://localhost:9400/api/onboarding/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": 1,
    "userData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "password": "password123"
    },
    "companyData": {
      "name": "Acme Corp",
      "code": "ACME",
      "email": "contact@acme.com"
    }
  }'

# Check onboarding status
curl -X GET "http://localhost:9400/api/onboarding/status/1"
```

## Notes

- **No Authentication Required**: Onboarding endpoints are public for post-subscription setup
- **Immediate Login**: Returns JWT token for immediate system access
- **Admin Access**: First user gets admin role automatically
- **Company Isolation**: All data is scoped to the created company
- **Validation**: All fields are validated against database constraints
- **Error Recovery**: Detailed error messages help with debugging

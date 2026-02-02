# Subscriptions API

The Subscriptions API provides endpoints to manage Razorpay subscriptions for the HRM system. This includes creating subscriptions with 14-day trials, managing subscription lifecycle, and handling payments.

## Base URL

**Via API Gateway (Recommended):**
```
http://localhost:9400/api/subscriptions
```

**Direct Service Access:**
```
http://localhost:9404/api/subscriptions
```

> **Note:** All examples use the API Gateway URL (port 9400). The gateway routes requests to the Payment Service (port 9404).

## Features

- **14-day free trial** for all new subscriptions (no payment required)
- **Full feature access** during trial period
- **Auto-debit** for recurring payments (after trial ends)
- **Account deactivation** on payment failure
- **Webhook handling** for Razorpay events
- **Multiple billing cycles** (monthly/yearly)
- **Subscription pause/resume** functionality
- **Razorpay integration** only when trial ends or user upgrades

## Endpoints

### Create Subscription

Create a new subscription with a 14-day free trial and complete user/company setup. No payment is required during the trial period.

**Endpoint:** `POST /api/subscriptions`

**Authentication:** Optional (New users can create subscriptions without authentication)

**Request Body:**
```json
{
  "pricingPlanId": 28,
  "customerData": {
    "name": "John Doe",
    "personalEmail": "john@gmail.com",
    "companyEmail": "john@company.com",
    "companyName": "Acme Corporation",
    "companyCode": "ACME_CORP_20250131_1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "password": "Password123!",
    "contact": "+919876543210"
  },
  "interval": "monthly"
}
```

**Request Fields:**
- `pricingPlanId` (required): ID of the pricing plan (28, 29, or 30)
- `customerData` (required): Extended customer information for complete setup
  - `name` (required): Customer full name
  - `personalEmail` (required): **Personal email address** (gmail.com, yahoo.com, etc. allowed for subscription users)
  - `companyEmail` (required): **Business email address** (used for company operations and employee login)
  - `companyName` (required): Company name for business registration
  - `companyCode` (required): Unique company code (minimum 10 characters, e.g., "COMPANY_CODE_20250131_1234567890")
  - `firstName` (required): User's first name
  - `lastName` (required): User's last name
  - `password` (required): User account password (minimum 6 characters)
  - `contact` (optional): Customer phone number
- `interval` (required): Billing interval - "monthly" or "yearly"

**Available Pricing Plans:**
- `28` - Starter (₹2,499/month, ₹24,990/year)
- `29` - Professional (₹6,499/month, ₹64,990/year)
- `30` - Enterprise (₹16,499/month, ₹164,990/year)

> **Authentication:** The subscription creation endpoint is public to allow new user registrations. Existing users can optionally include an `Authorization: Bearer TOKEN` header, but it's not required.

> **Free Trial Behavior:** All new subscriptions start with a 14-day free trial. During the trial period:
> - No payment is required
> - Full access to all features
> - `paymentLink` is `null` 
> - Razorpay subscription is created only when trial ends or user upgrades
> - Trial automatically converts to paid subscription unless cancelled

> **Email Policy:** The system supports different email types for different user roles:
> - **Personal Email**: Allowed for subscription users (company admins) - gmail.com, yahoo.com, hotmail.com, outlook.com, etc.
> - **Company Email**: Required for business operations and employee login - company@domain.com format
> - **Login Restrictions**: Subscription users can login with personal email, regular employees must use company email
> - **Validation**: Comprehensive email format verification

> **Automatic Entity Creation:** The subscription process automatically creates:
> - **User Account**: With company admin role and personal email login
> - **Company Record**: With provided company details and business email
> - **Employee Record**: Linking user to company with both email types
> - **Role Assignment**: Company admin role assigned to subscription user
> - **Email Notifications**: Beautiful confirmation emails with trial details

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription created with 14-day trial",
    "responseDetail": ""
  },
  "response": {
    "subscription": {
      "id": 1,
      "companyId": "041ce390-2569-4ca2-bee9-b42254cba708",
      "pricingPlanId": 28,
      "status": "trial",
      "trialStartDate": "2024-01-01T00:00:00.000Z",
      "trialEndDate": "2024-01-15T00:00:00.000Z",
      "amount": 2499,
      "currency": "INR",
      "interval": "monthly",
      "autoRenew": true,
      "isActive": true
    },
    "paymentLink": null,
    "trialDays": 14,
    "trialEndDate": "2024-01-15T00:00:00.000Z",
    "message": "Free trial started. No payment required during trial period."
  }
}
```

### Get Subscription

Retrieve subscription details for a company.

**Endpoint:** `GET /api/subscriptions/{companyId}`

**Authentication:** Required

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "subscription": {
      "id": 1,
      "companyId": "041ce390-2569-4ca2-bee9-b42254cba708",
      "pricingPlanId": 28,
      "status": "trial",
      "trialStartDate": "2024-01-01T00:00:00.000Z",
      "trialEndDate": "2024-01-15T00:00:00.000Z",
      "isTrialActive": true,
      "remainingTrialDays": 7,
      "needsPayment": false,
      "amount": 2499,
      "currency": "INR",
      "interval": "monthly",
      "autoRenew": true,
      "isActive": true
    }
  }
}
```

### Get Subscription Status

Get detailed subscription status including trial information and payment requirements.

**Endpoint:** `GET /api/subscriptions/status/{companyId}`

**Authentication:** None required

### Get Subscription Details with Onboarding Status

Retrieve comprehensive subscription details including company, employee, user information, and onboarding progress.

**Endpoint:** `GET /api/onboarding/status/{subscriptionId}`

**Authentication:** None required

**Path Parameters:**
- `subscriptionId` (integer, required): The unique identifier of the subscription

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription details retrieved",
    "responseDetail": ""
  },
  "response": {
    "subscription": {
      "id": 68,
      "status": "trial",
      "trialStartDate": "2026-01-31T15:23:08.974Z",
      "trialEndDate": "2026-02-14T15:23:08.974Z",
      "subscriptionStartDate": "2026-02-14T15:23:08.974Z",
      "subscriptionEndDate": "2026-03-14T15:23:08.974Z",
      "amount": "2499.00",
      "currency": "INR",
      "interval": "monthly",
      "autoRenew": true,
      "isActive": true,
      "createdAt": "2026-01-31T15:23:08.974Z",
      "updatedAt": "2026-01-31T15:23:08.974Z"
    },
    "company": {
      "id": "f6ee3350-5e15-4c89-9c5e-f6615d7bc8b5",
      "name": "New Company Inc",
      "code": "NEWCOMPANY_1234567890",
      "status": "active",
      "subscriptionStatus": "trial",
      "createdAt": "2026-01-31T09:53:08.899Z"
    },
    "employee": {
      "id": "c92689fc-03f7-47fa-8a22-cdad75738ab8",
      "firstName": "Sarah",
      "lastName": "Williams",
      "userEmail": "sarah.williams.test@gmail.com",
      "workEmail": "sarah@newcompany.com",
      "department": "Management",
      "designation": "Company Administrator",
      "status": "active",
      "createdAt": "2026-01-31T09:53:08.971Z"
    },
    "user": {
      "id": "305265af-842e-4a9f-9f30-f12251878411",
      "email": "sarah.williams.test@gmail.com",
      "role": "company_admin",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2026-01-31T09:53:08.966Z"
    },
    "onboarding": {
      "isOnboarded": true,
      "level": 4,
      "levelName": "Onboarding Complete",
      "progress": 100,
      "nextStep": "Start using the platform",
      "completedSteps": 4,
      "totalSteps": 4,
      "steps": [
        {
          "step": 1,
          "name": "Subscription Created",
          "completed": true,
          "description": "Subscription plan selected and trial activated"
        },
        {
          "step": 2,
          "name": "Company Setup",
          "completed": true,
          "description": "Company profile created and configured"
        },
        {
          "step": 3,
          "name": "Employee Setup",
          "completed": true,
          "description": "Employee profile created with role assignment"
        },
        {
          "step": 4,
          "name": "User Verification",
          "completed": true,
          "description": "User account created and email verified"
        }
      ]
    }
  }
}
```

**Response Fields:**

#### **Subscription Object**
- `id` (integer): Unique subscription identifier
- `status` (string): Current subscription status (`trial`, `active`, `cancelled`, `expired`, `paused`)
- `trialStartDate` (datetime): Trial period start date (ISO 8601 format)
- `trialEndDate` (datetime): Trial period end date (ISO 8601 format)
- `subscriptionStartDate` (datetime): Paid subscription start date (ISO 8601 format)
- `subscriptionEndDate` (datetime): Current subscription period end date (ISO 8601 format)
- `amount` (string): Subscription amount in specified currency
- `currency` (string): Currency code (e.g., "INR", "USD")
- `interval` (string): Billing interval (`monthly`, `yearly`)
- `autoRenew` (boolean): Whether subscription auto-renews
- `isActive` (boolean): Whether subscription is currently active
- `createdAt` (datetime): Subscription creation timestamp
- `updatedAt` (datetime): Last update timestamp

#### **Company Object**
- `id` (string): Unique company identifier (UUID)
- `name` (string): Company name
- `code` (string): Unique company code
- `status` (string): Company status (`active`, `inactive`)
- `subscriptionStatus` (string): Company's subscription status (`trial`, `active`, `inactive`, `expired`)
- `createdAt` (datetime): Company creation timestamp

#### **Employee Object**
- `id` (string): Unique employee identifier (UUID)
- `firstName` (string): Employee's first name
- `lastName` (string): Employee's last name
- `userEmail` (string): Employee's personal email address
- `workEmail` (string): Employee's company email address
- `department` (string): Employee's department
- `designation` (string): Employee's job title/designation
- `status` (string): Employee status (`active`, `inactive`, `terminated`)
- `createdAt` (datetime): Employee creation timestamp

#### **User Object**
- `id` (string): Unique user identifier (UUID)
- `email` (string): User's email address
- `role` (string): User's role (`company_admin`, `employee`, etc.)
- `status` (string): User account status (`active`, `inactive`)
- `emailVerified` (boolean): Whether user's email has been verified
- `createdAt` (datetime): User account creation timestamp

#### **Onboarding Object**
- `isOnboarded` (boolean): Whether onboarding is complete
- `level` (integer): Current onboarding level (1-4)
- `levelName` (string): Human-readable onboarding level name
- `progress` (integer): Onboarding progress percentage (0-100)
- `nextStep` (string): Description of next required action
- `completedSteps` (integer): Number of completed onboarding steps
- `totalSteps` (integer): Total number of onboarding steps
- `steps` (array): Detailed breakdown of each onboarding step

**Onboarding Levels:**
1. **Level 1 - Subscription Created**: Subscription plan selected and trial activated
2. **Level 2 - Company Setup Complete**: Company profile created and configured
3. **Level 3 - Employee Setup Complete**: Employee profile created with role assignment
4. **Level 4 - Onboarding Complete**: User account created and email verified

**Error Responses:**

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

**Internal Server Error (500):**
```json
{
  "header": {
    "responseCode": 500,
    "responseMessage": "Failed to get subscription details",
    "responseDetail": "Database connection error"
  },
  "response": null
}
```

**cURL Example:**
```bash
# Get subscription details with onboarding status
curl -X GET "http://localhost:9400/api/onboarding/status/68" \
  -H "Content-Type: application/json"
```

**Use Cases:**
- **Admin Dashboard**: Display comprehensive customer information and onboarding progress
- **Customer Support**: Get complete context for support tickets and customer inquiries
- **Analytics**: Track onboarding completion rates and identify bottlenecks
- **Billing System**: Retrieve all necessary data for invoicing and payment processing
- **User Experience**: Show customers their onboarding progress and next steps

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription status retrieved",
    "responseDetail": ""
  },
  "response": {
    "hasSubscription": true,
    "status": "trial",
    "isActive": true,
    "isTrialActive": true,
    "remainingTrialDays": 7,
    "needsPayment": false,
    "actionRequired": false,
    "message": "Trial active - 7 days remaining",
    "subscription": {
      "id": 1,
      "status": "trial",
      "trialStartDate": "2024-01-01T00:00:00.000Z",
      "trialEndDate": "2024-01-15T00:00:00.000Z",
      "nextBillingDate": "2024-01-15T00:00:00.000Z",
      "amount": 2499,
      "interval": "monthly",
      "pricingPlan": {
        "id": 28,
        "name": "Starter",
        "monthlyPrice": 2499,
        "yearlyPrice": 24990
      }
    }
  }
}
```

### Update Subscription

Update subscription settings like auto-renewal.

**Endpoint:** `PUT /api/subscriptions/{companyId}`

**Authentication:** Required

**Request Body:**
```json
{
  "autoRenew": false
}
```

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription updated successfully",
    "responseDetail": ""
  },
  "response": {
    "subscription": {
      "id": 1,
      "autoRenew": false
    }
  }
}
```

### Cancel Subscription

Cancel a subscription immediately.

**Endpoint:** `DELETE /api/subscriptions/{companyId}`

**Authentication:** Required (Admin role)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription cancelled successfully",
    "responseDetail": ""
  },
  "response": null
}
```

### Pause Subscription

Pause an active subscription.

**Endpoint:** `PATCH /api/subscriptions/{companyId}/pause`

**Authentication:** Required

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription paused successfully",
    "responseDetail": ""
  },
  "response": {
    "subscription": {
      "id": 1,
      "status": "paused"
    }
  }
}
```

### Resume Subscription

Resume a paused subscription.

**Endpoint:** `PATCH /api/subscriptions/{companyId}/resume`

**Authentication:** Required

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription resumed successfully",
    "responseDetail": ""
  },
  "response": {
    "subscription": {
      "id": 1,
      "status": "active"
    }
  }
}
```

### Webhook Handler

Handle Razorpay webhook events for subscription lifecycle management.

**Endpoint:** `POST /api/subscriptions/webhook`

**Authentication:** None (verified by webhook signature)

**Webhook Events:**
- `subscription.activated` - Subscription activated after trial
- `subscription.completed` - Subscription completed
- `subscription.cancelled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed
- `payment.failed` - Payment failed
- `payment.captured` - Payment successful

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Webhook processed successfully",
    "responseDetail": ""
  },
  "response": null
}
```

## Subscription Lifecycle

### 1. Trial Period (14 Days)
- **Status**: `trial`
- **Access**: Full access to all features
- **Payment**: No payment required
- **Notifications**: Email reminders at 7 days, 3 days, and 1 day before trial ends

### 2. Active Period
- **Status**: `active`
- **Access**: Full access to all features
- **Payment**: Auto-debit on billing date
- **Notifications**: Payment reminders 3 days before due date

### 3. Payment Failure
- **Failed Attempts**: 1-2 attempts allowed
- **Status**: `active` (with failed payment attempts)
- **Access**: Full access continues
- **Notifications**: Payment failure notifications

### 4. Account Deactivation
- **Failed Attempts**: 3+ failed payments
- **Status**: `expired`
- **Access**: Account deactivated
- **Notifications**: Account deactivation notice with payment link

### 5. Reactivation
- **Process**: User can reactivate by paying outstanding amount
- **Status**: `active` (after successful payment)
- **Access**: Full access restored
- **Notifications**: Reactivation confirmation

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "Personal email is required. Please provide a valid personal email address."
  },
  "response": null
}
```

**Invalid Email Format (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "Please provide a valid personal email address."
  },
  "response": null
}
```

**Company Email Validation (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "Company email is required. Please provide a valid business email address."
  },
  "response": null
}
```

**Password Validation (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "Password must be at least 6 characters long."
  },
  "response": null
}
```

**Company Code Validation (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "Company code must be at least 10 characters long (e.g., COMPANY_CODE_20250131_1234567890)."
  },
  "response": null
}
```

**Conflict Error (409):**
```json
{
  "header": {
    "responseCode": 409,
    "responseMessage": "Company already has an active subscription",
    "responseDetail": ""
  },
  "response": null
}
```

**Not Found (404):**
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

## Integration Examples

### Frontend Integration

```javascript
// Create subscription with extended customer data
const createSubscription = async (pricingPlanId, customerData) => {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pricingPlanId,
        customerData: {
          name: `${customerData.firstName} ${customerData.lastName}`,
          personalEmail: customerData.personalEmail,
          companyEmail: customerData.companyEmail,
          companyName: customerData.companyName,
          companyCode: customerData.companyCode,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          password: customerData.password,
          contact: customerData.contact
        },
        interval: 'monthly'
      })
    });
    
    const data = await response.json();
    
    if (data.header.responseCode === 200) {
      // Subscription created successfully
      console.log('Subscription created:', data.response.subscription);
      return data.response.subscription;
    } else {
      // Handle validation errors
      console.error('Subscription creation failed:', data.header.responseDetail);
      throw new Error(data.header.responseDetail);
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Check subscription status
const checkSubscriptionStatus = async (companyId) => {
  try {
    const response = await fetch(`/api/subscriptions/status/${companyId}`);
    const data = await response.json();
    
    if (data.response.actionRequired) {
      // Show payment reminder
      alert(data.response.message);
    }
    
    return data.response;
  } catch (error) {
    console.error('Error checking subscription status:', error);
  }
};
```

### cURL Examples

```bash
# Create subscription with extended customer data (NEW USER - no authentication required)
curl -X POST "http://localhost:9400/api/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "pricingPlanId": 28,
    "customerData": {
      "name": "John Doe",
      "personalEmail": "john@gmail.com",
      "companyEmail": "john@company.com",
      "companyName": "Acme Corporation",
      "companyCode": "ACME_CORP_20250131_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "password": "Password123!",
      "contact": "+919876543210"
    },
    "interval": "monthly"
  }'

# Create subscription with existing company (authenticated user)
curl -X POST "http://localhost:9400/api/subscriptions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pricingPlanId": 28,
    "customerData": {
      "name": "John Doe",
      "personalEmail": "john@gmail.com",
      "companyEmail": "john@company.com",
      "companyName": "Acme Corporation",
      "companyCode": "ACME_CORP_20250131_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "password": "Password123!"
    },
    "interval": "monthly"
  }'

# Get subscription status (via API Gateway)
curl -X GET "http://localhost:9400/api/subscriptions/status/041ce390-2569-4ca2-bee9-b42254cba708"

# Cancel subscription (via API Gateway)
curl -X DELETE "http://localhost:9400/api/subscriptions/041ce390-2569-4ca2-bee9-b42254cba708" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Environment Variables

Required environment variables for Razorpay integration:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quick_hr
DB_USER=postgres
DB_PASSWORD=your_password
```

## Notes

- All amounts are in INR (Indian Rupees)
- Trial period is exactly 14 days from subscription creation
- Auto-debit is enabled by default for all subscriptions
- Account deactivation occurs after 3 failed payment attempts
- Webhook signature verification should be implemented in production
- Subscription links are valid for 24 hours from creation
- Users can pause subscriptions for up to 3 months
- Subscription can be cancelled at any time (no refunds for partial periods)

## New Features

### **Enhanced Subscription Creation**
- **Complete Setup**: Single API call creates user, company, and employee records
- **Extended Data Collection**: Collect all necessary information during subscription
- **Role-Based Login**: Personal email for subscription users, company email for employees
- **Automatic Entity Creation**: No separate onboarding calls required
- **Beautiful Email Templates**: Professional confirmation emails with trial details

### **Email Policy**
- **Personal Email**: Allowed for subscription users (gmail.com, yahoo.com, etc.)
- **Company Email**: Required for business operations and employee login
- **Login Restrictions**: Enforced based on user role and subscription status
- **Validation**: Comprehensive email format and type verification

### **User Experience**
- **Single Form**: One-step subscription with all required fields
- **Business-Friendly Errors**: Clear, actionable error messages
- **Professional Communication**: Beautiful, emoji-free email templates
- **Role Assignment**: Automatic company admin role for subscription users

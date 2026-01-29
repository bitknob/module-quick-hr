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

- **14-day free trial** for all new subscriptions
- **Auto-debit** for recurring payments
- **Account deactivation** on payment failure
- **Webhook handling** for Razorpay events
- **Multiple billing cycles** (monthly/yearly)
- **Subscription pause/resume** functionality

## Endpoints

### Create Subscription

Create a new subscription with a 14-day trial for a company.

**Endpoint:** `POST /api/subscriptions`

**Authentication:** Required

**Request Body:**
```json
{
  "pricingPlanId": 28,
  "customerData": {
    "name": "John Doe",
    "email": "john@company.com",
    "contact": "+919876543210"
  },
  "interval": "monthly",
  "companyName": "Acme Corporation",
  "billingAddress": "123 Main Street, Building A"
}
```

**Request Fields:**
- `pricingPlanId` (required): ID of the pricing plan (28, 29, or 30)
- `customerData` (required): Customer information
  - `name` (required): Customer name
  - `email` (required): Customer email
  - `contact` (optional): Customer phone number
- `interval` (required): Billing interval - "monthly" or "yearly"
- `companyId` (optional): Existing company UUID. If not provided or invalid, a new company will be auto-generated
- `companyName` (optional): Company name for auto-generated companies. Defaults to "{Customer Name}'s Company"
- `billingAddress` (optional): Company billing address

**Available Pricing Plans:**
- `28` - Starter (₹2,499/month, ₹24,990/year)
- `29` - Professional (₹6,499/month, ₹64,990/year)
- `30` - Enterprise (₹16,499/month, ₹164,990/year)

> **Note:** If `companyId` is not provided or is invalid (not a UUID), the system will automatically create a new company with a generated UUID and code.

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
    "paymentLink": {
      "id": "inv_1234567890",
      "short_url": "https://rzp.io/i/abc123"
    },
    "trialDays": 14,
    "trialEndDate": "2024-01-15T00:00:00.000Z"
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
    "responseDetail": "[{\"field\":\"companyId\",\"message\":\"Invalid company ID\"}]"
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
// Create subscription with trial
const createSubscription = async (companyId, pricingPlanId, customerData) => {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        companyId,
        pricingPlanId,
        customerData,
        interval: 'monthly'
      })
    });
    
    const data = await response.json();
    
    if (data.response.paymentLink) {
      // Redirect to payment page
      window.location.href = data.response.paymentLink.short_url;
    }
    
    return data.response.subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
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
# Create subscription with auto-generated company (via API Gateway)
curl -X POST "http://localhost:9400/api/subscriptions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pricingPlanId": 28,
    "customerData": {
      "name": "John Doe",
      "email": "john@company.com",
      "contact": "+919876543210"
    },
    "interval": "monthly",
    "companyName": "Acme Corporation",
    "billingAddress": "123 Main Street, Building A"
  }'

# Create subscription with existing company (via API Gateway)
curl -X POST "http://localhost:9400/api/subscriptions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "companyId": "041ce390-2569-4ca2-bee9-b42254cba708",
    "pricingPlanId": 28,
    "customerData": {
      "name": "John Doe",
      "email": "john@company.com",
      "contact": "+919876543210"
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

# Subscription History API

The Subscription History API provides endpoints to track and retrieve the complete lifecycle history of subscriptions, including payments, status changes, and all subscription events.

## Base URL
```
/api/subscription-history
```

## Features

- **Complete Event Tracking**: All subscription lifecycle events are logged
- **Payment History**: Detailed payment success/failure tracking
- **Status Changes**: Track subscription status transitions
- **Trial Monitoring**: Trial start/end events
- **Plan Changes**: Track pricing plan modifications
- **Account Deactivation**: Monitor expired/cancelled subscriptions
- **Statistics**: Comprehensive subscription analytics

## Event Types

The system tracks the following event types:

- `created` - Subscription created
- `updated` - Subscription settings updated
- `cancelled` - Subscription cancelled
- `paused` - Subscription paused
- `resumed` - Subscription resumed
- `payment_successful` - Payment completed successfully
- `payment_failed` - Payment failed
- `trial_started` - Trial period started
- `trial_ended` - Trial period ended
- `plan_changed` - Pricing plan changed
- `reactivated` - Subscription reactivated
- `expired` - Subscription expired

## Endpoints

### Get Subscription History

Retrieve the complete history of a specific subscription.

**Endpoint:** `GET /api/subscription-history/subscription/{subscriptionId}`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription history retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "history": [
      {
        "id": 1,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "created",
        "previousStatus": null,
        "newStatus": "trial",
        "previousPricingPlanId": null,
        "newPricingPlanId": 1,
        "amount": 2499,
        "currency": "INR",
        "paymentMethod": null,
        "transactionId": null,
        "razorpayEventId": null,
        "description": "Subscription created with monthly billing",
        "metadata": {
          "trialStartDate": "2024-01-01T00:00:00.000Z",
          "trialEndDate": "2024-01-15T00:00:00.000Z",
          "autoRenew": true
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Company Subscription History

Retrieve all subscription history for a company across all subscriptions.

**Endpoint:** `GET /api/subscription-history/company/{companyId}`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Company subscription history retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "history": [
      {
        "id": 1,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "created",
        "description": "Subscription created with monthly billing",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "payment_successful",
        "amount": 2499,
        "transactionId": "pay_1234567890",
        "description": "Payment of 2499 INR successful",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get Payment History

Retrieve only payment-related events for a subscription.

**Endpoint:** `GET /api/subscription-history/subscription/{subscriptionId}/payments`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Payment history retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "history": [
      {
        "id": 2,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "payment_successful",
        "amount": 2499,
        "currency": "INR",
        "paymentMethod": "razorpay",
        "transactionId": "pay_1234567890",
        "razorpayEventId": "evt_1234567890",
        "description": "Payment of 2499 INR successful",
        "metadata": {
          "paymentDate": "2024-01-15T00:00:00.000Z",
          "nextBillingDate": "2024-02-15T00:00:00.000Z"
        },
        "createdAt": "2024-01-15T00:00:00.000Z"
      },
      {
        "id": 3,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "payment_failed",
        "razorpayEventId": "evt_0987654321",
        "description": "Payment failed (attempt 1)",
        "metadata": {
          "failedPaymentAttempts": 1,
          "errorMessage": "Insufficient funds",
          "paymentDate": "2024-02-15T00:00:00.000Z"
        },
        "createdAt": "2024-02-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Events by Type

Retrieve events of a specific type for a subscription.

**Endpoint:** `GET /api/subscription-history/subscription/{subscriptionId}/events`

**Authentication:** Required

**Query Parameters:**
- `eventType` (required): Type of events to retrieve
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Events of type payment_successful retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "history": [
      {
        "id": 2,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "payment_successful",
        "amount": 2499,
        "currency": "INR",
        "paymentMethod": "razorpay",
        "transactionId": "pay_1234567890",
        "description": "Payment of 2499 INR successful",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Recent Events

Retrieve recent events for a company (useful for dashboards).

**Endpoint:** `GET /api/subscription-history/company/{companyId}/recent`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of recent events to return (default: 10, max: 50)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Recent events retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "events": [
      {
        "id": 15,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "payment_successful",
        "description": "Payment of 2499 INR successful",
        "createdAt": "2024-01-15T00:00:00.000Z"
      },
      {
        "id": 14,
        "subscriptionId": 1,
        "companyId": "uuid",
        "eventType": "trial_ended",
        "description": "Trial period ended",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

### Get Subscription Statistics

Get comprehensive statistics for a subscription.

**Endpoint:** `GET /api/subscription-history/subscription/{subscriptionId}/statistics`

**Authentication:** Required

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Subscription statistics retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "statistics": {
      "totalEvents": 25,
      "paymentEvents": 8,
      "successfulPayments": 6,
      "failedPayments": 2,
      "statusChanges": 5,
      "lastPaymentDate": "2024-01-15T00:00:00.000Z",
      "totalRevenue": 14994
    }
  }
}
```

### Get Company Payment Summary

Get comprehensive payment summary for a company.

**Endpoint:** `GET /api/subscription-history/company/{companyId}/payment-summary`

**Authentication:** Required (Admin role)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Company payment summary retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "summary": {
      "totalPayments": 12,
      "successfulPayments": 10,
      "failedPayments": 2,
      "totalRevenue": 29988,
      "averagePaymentAmount": 2998.8,
      "successRate": 83.33,
      "paymentsByMonth": {
        "2024-01": {
          "successful": 1,
          "failed": 0,
          "revenue": 2499
        },
        "2024-02": {
          "successful": 1,
          "failed": 1,
          "revenue": 2499
        }
      },
      "lastPaymentDate": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

## Data Model

### SubscriptionHistory

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the history event |
| subscriptionId | integer | Reference to the subscription |
| companyId | string | Reference to the company |
| eventType | string | Type of event (created, payment_successful, etc.) |
| previousStatus | string | Previous subscription status |
| newStatus | string | New subscription status |
| previousPricingPlanId | integer | Previous pricing plan ID |
| newPricingPlanId | integer | New pricing plan ID |
| amount | decimal | Payment amount (for payment events) |
| currency | string | Currency code (INR) |
| paymentMethod | string | Payment method used |
| transactionId | string | Payment transaction ID |
| razorpayEventId | string | Razorpay webhook event ID |
| description | string | Human-readable description of the event |
| metadata | object | Additional event metadata in JSON format |
| createdAt | datetime | When the event was created |
| updatedAt | datetime | When the event was last updated |

## Use Cases

### 1. Subscription Lifecycle Tracking

Track the complete journey of a subscription from creation to cancellation:

```javascript
// Get complete subscription history
const history = await fetch('/api/subscription-history/subscription/123');

// Events will show:
// 1. created - Subscription created with trial
// 2. trial_started - 14-day trial begins
// 3. trial_ended - Trial period ends
// 4. payment_successful - First payment
// 5. updated - Settings changed
// 6. cancelled - Subscription cancelled
```

### 2. Payment Monitoring

Monitor payment success/failure patterns:

```javascript
// Get payment history
const payments = await fetch('/api/subscription-history/subscription/123/payments');

// Analyze payment patterns
const successRate = payments.successfulPayments / payments.totalPayments;
const avgAmount = payments.totalRevenue / payments.successfulPayments;
```

### 3. Account Health Dashboard

Create a dashboard showing recent activity:

```javascript
// Get recent events for dashboard
const recentEvents = await fetch('/api/subscription-history/company/uuid/recent?limit=5');

// Display latest activities
recentEvents.events.forEach(event => {
  console.log(`${event.eventType}: ${event.description}`);
});
```

### 4. Compliance Auditing

Generate audit trails for compliance:

```javascript
// Get complete company history
const companyHistory = await fetch('/api/subscription-history/company/uuid');

// Filter for specific events
const paymentEvents = companyHistory.history.filter(e => 
  e.eventType.includes('payment')
);

const statusChanges = companyHistory.history.filter(e => 
  e.eventType.includes('cancelled') || e.eventType.includes('expired')
);
```

## Integration Examples

### Frontend Integration

```javascript
// Get subscription timeline
const getSubscriptionTimeline = async (subscriptionId) => {
  try {
    const response = await fetch(
      `/api/subscription-history/subscription/${subscriptionId}?limit=50`
    );
    const data = await response.json();
    
    return data.response.history.map(event => ({
      type: event.eventType,
      date: event.createdAt,
      description: event.description,
      amount: event.amount,
      status: event.newStatus,
    }));
  } catch (error) {
    console.error('Error fetching timeline:', error);
  }
};

// Get payment analytics
const getPaymentAnalytics = async (subscriptionId) => {
  try {
    const [history, statistics] = await Promise.all([
      fetch(`/api/subscription-history/subscription/${subscriptionId}/payments`),
      fetch(`/api/subscription-history/subscription/${subscriptionId}/statistics`)
    ]);
    
    const historyData = await history.json();
    const statsData = await statistics.json();
    
    return {
      payments: historyData.response.history,
      statistics: statsData.response.statistics,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};
```

### cURL Examples

```bash
# Get subscription history
curl -X GET "http://localhost:9400/api/subscription-history/subscription/123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get payment history
curl -X GET "http://localhost:9400/api/subscription-history/subscription/123/payments?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get company payment summary
curl -X GET "http://localhost:9400/api/subscription-history/company/uuid/payment-summary" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get events by type
curl -X GET "http://localhost:9400/api/subscription-history/subscription/123/events?eventType=payment_successful" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Validation error",
    "responseDetail": "[{\"field\":\"limit\",\"message\":\"Limit must be between 1 and 100\"}]"
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

**Unauthorized (401):**
```json
{
  "header": {
    "responseCode": 401,
    "responseMessage": "Authentication required",
    "responseDetail": ""
  },
  "response": null
}
```

## Performance Considerations

- **Indexing**: All queries are optimized with proper database indexes
- **Pagination**: Use pagination for large datasets to avoid performance issues
- **Caching**: Consider caching frequently accessed statistics
- **Rate Limiting**: Implement rate limiting for public endpoints
- **Data Retention**: Consider archiving old history events for long-running subscriptions

## Notes

- All timestamps are in UTC
- Amounts are stored and returned in INR
- Events are immutable once created
- History is automatically logged for all subscription lifecycle events
- Payment events include Razorpay transaction IDs for reconciliation
- Metadata field contains additional context for each event
- Statistics are calculated in real-time and may be cached in production

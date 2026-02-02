# Pricing Plans API

The Pricing Plans API provides endpoints to manage subscription pricing plans for the HRM system. This includes retrieving available plans, creating new plans, and managing existing plans.

## Base URL
```
/api/pricing-plans
```

## Endpoints

### Get All Pricing Plans

Retrieve all pricing plans, optionally filtering by active status.

**Endpoint:** `GET /api/pricing-plans`

**Query Parameters:**
- `activeOnly` (boolean, optional, default: true) - Filter to show only active plans

**Authentication:** None required

**Example Request:**
```bash
GET /api/pricing-plans
GET /api/pricing-plans?activeOnly=true
GET /api/pricing-plans?activeOnly=false
```

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pricing plans retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "pricingPlans": [
      {
        "id": 28,
        "name": "Starter",
        "description": "Perfect for small teams getting started with HR management",
        "monthlyPrice": 2499,
        "yearlyPrice": 24990,
        "features": [
          {
            "name": "Up to 25 employees",
            "included": true
          },
          {
            "name": "Employee directory",
            "included": true
          },
          {
            "name": "Leave management",
            "included": true
          },
          {
            "name": "Basic attendance tracking",
            "included": true
          },
          {
            "name": "Email support",
            "included": true
          },
          {
            "name": "Document storage (5GB)",
            "included": true
          },
          {
            "name": "Custom workflows",
            "included": false
          },
          {
            "name": "Advanced analytics",
            "included": false
          },
          {
            "name": "API access",
            "included": false
          },
          {
            "name": "SSO integration",
            "included": false
          }
        ],
        "isActive": true,
        "sortOrder": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 29,
        "name": "Professional",
        "description": "For growing companies that need more power and flexibility",
        "monthlyPrice": 6499,
        "yearlyPrice": 64990,
        "features": [
          {
            "name": "Up to 100 employees",
            "included": true
          },
          {
            "name": "Employee directory",
            "included": true
          },
          {
            "name": "Leave management",
            "included": true
          },
          {
            "name": "Advanced attendance tracking",
            "included": true
          },
          {
            "name": "Priority email & chat support",
            "included": true
          },
          {
            "name": "Document storage (50GB)",
            "included": true
          },
          {
            "name": "Custom workflows",
            "included": true
          },
          {
            "name": "Advanced analytics",
            "included": true
          },
          {
            "name": "API access",
            "included": false
          },
          {
            "name": "SSO integration",
            "included": false
          }
        ],
        "isActive": true,
        "sortOrder": 2,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 30,
        "name": "Enterprise",
        "description": "For large organizations with complex HR requirements",
        "monthlyPrice": 16499,
        "yearlyPrice": 164990,
        "features": [
          {
            "name": "Unlimited employees",
            "included": true
          },
          {
            "name": "Employee directory",
            "included": true
          },
          {
            "name": "Leave management",
            "included": true
          },
          {
            "name": "Advanced attendance tracking",
            "included": true
          },
          {
            "name": "24/7 dedicated support",
            "included": true
          },
          {
            "name": "Unlimited document storage",
            "included": true
          },
          {
            "name": "Custom workflows",
            "included": true
          },
          {
            "name": "Advanced analytics",
            "included": true
          },
          {
            "name": "API access",
            "included": true
          },
          {
            "name": "SSO integration",
            "included": true
          }
        ],
        "isActive": true,
        "sortOrder": 3,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Pricing Plan by ID

Retrieve a specific pricing plan by its ID.

**Endpoint:** `GET /api/pricing-plans/{id}`

**Path Parameters:**
- `id` (integer) - The ID of the pricing plan

**Authentication:** None required

**Example Request:**
```bash
GET /api/pricing-plans/1
```

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pricing plan retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "pricingPlan": {
      "id": 1,
      "name": "Starter",
      "description": "Perfect for small teams getting started with HR management",
      "monthlyPrice": 29,
      "yearlyPrice": 288,
      "features": [
        {
          "name": "Up to 10 employees",
          "included": true
        }
      ],
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "header": {
    "responseCode": 404,
    "responseMessage": "Pricing plan not found",
    "responseDetail": ""
  },
  "response": null
}
```

### Create Pricing Plan

Create a new pricing plan. Requires admin authentication.

**Endpoint:** `POST /api/pricing-plans`

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Professional",
  "description": "Ideal for growing businesses that need advanced HR features",
  "monthlyPrice": 79,
  "yearlyPrice": 788,
  "features": [
    {
      "name": "Up to 50 employees",
      "included": true
    },
    {
      "name": "Advanced employee management",
      "included": true
    },
    {
      "name": "Payroll management",
      "included": true
    },
    {
      "name": "API access",
      "included": true
    },
    {
      "name": "Custom integrations",
      "included": false
    }
  ],
  "isActive": true,
  "sortOrder": 2
}
```

**Success Response (201):**
```json
{
  "header": {
    "responseCode": 201,
    "responseMessage": "Pricing plan created successfully",
    "responseDetail": ""
  },
  "response": {
    "pricingPlan": {
      "id": 2,
      "name": "Professional",
      "description": "Ideal for growing businesses that need advanced HR features",
      "monthlyPrice": 79,
      "yearlyPrice": 788,
      "features": [
        {
          "name": "Up to 50 employees",
          "included": true
        }
      ],
      "isActive": true,
      "sortOrder": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
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
    "responseDetail": "[{\"field\":\"name\",\"message\":\"Name is required\"}]"
  },
  "response": null
}
```

**Conflict Error (409):**
```json
{
  "header": {
    "responseCode": 409,
    "responseMessage": "Pricing plan with this name already exists",
    "responseDetail": ""
  },
  "response": null
}
```

### Update Pricing Plan

Update an existing pricing plan. Requires admin authentication.

**Endpoint:** `PUT /api/pricing-plans/{id}`

**Path Parameters:**
- `id` (integer) - The ID of the pricing plan to update

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Professional Plus",
  "description": "Enhanced plan with additional features",
  "monthlyPrice": 99,
  "yearlyPrice": 988,
  "features": [
    {
      "name": "Up to 75 employees",
      "included": true
    }
  ],
  "isActive": true,
  "sortOrder": 2
}
```

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pricing plan updated successfully",
    "responseDetail": ""
  },
  "response": {
    "pricingPlan": {
      "id": 2,
      "name": "Professional Plus",
      "description": "Enhanced plan with additional features",
      "monthlyPrice": 99,
      "yearlyPrice": 988,
      "features": [
        {
          "name": "Up to 75 employees",
          "included": true
        }
      ],
      "isActive": true,
      "sortOrder": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

### Delete Pricing Plan

Delete a pricing plan permanently. Requires admin authentication.

**Endpoint:** `DELETE /api/pricing-plans/{id}`

**Path Parameters:**
- `id` (integer) - The ID of the pricing plan to delete

**Authentication:** Required (Admin role)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pricing plan deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

### Toggle Pricing Plan Status

Activate or deactivate a pricing plan. Requires admin authentication.

**Endpoint:** `PATCH /api/pricing-plans/{id}/toggle`

**Path Parameters:**
- `id` (integer) - The ID of the pricing plan to toggle

**Authentication:** Required (Admin role)

**Success Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Pricing plan deactivated successfully",
    "responseDetail": ""
  },
  "response": {
    "pricingPlan": {
      "id": 1,
      "name": "Starter",
      "description": "Perfect for small teams getting started with HR management",
      "monthlyPrice": 29,
      "yearlyPrice": 288,
      "features": [
        {
          "name": "Up to 10 employees",
          "included": true
        }
      ],
      "isActive": false,
      "sortOrder": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

## Data Model

### PricingPlan

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the pricing plan |
| name | string | Name of the pricing plan (max 100 characters, unique) |
| description | string | Optional description of the pricing plan |
| monthlyPrice | decimal | Monthly price in INR (non-negative) |
| yearlyPrice | decimal | Yearly price in INR (non-negative) |
| features | array | Array of feature objects with name and included status |
| isActive | boolean | Whether the plan is currently active (default: true) |
| sortOrder | integer | Display order for the plan (default: 0) |
| createdAt | datetime | When the plan was created |
| updatedAt | datetime | When the plan was last updated |

### PricingPlanFeature

| Field | Type | Description |
|-------|------|-------------|
| name | string | Name of the feature |
| included | boolean | Whether the feature is included in the plan |

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Request body validation failed |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions (admin role required) |
| 404 | Pricing plan not found | Plan with specified ID does not exist |
| 409 | Pricing plan with this name already exists | Plan names must be unique |
| 500 | Failed to {operation} pricing plan | Server error during operation |

## Usage Examples

### Frontend Integration

```javascript
// Fetch all active pricing plans
const fetchPricingPlans = async () => {
  try {
    const response = await fetch('/api/pricing-plans?activeOnly=true');
    const data = await response.json();
    return data.response.pricingPlans;
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
  }
};

// Create a new pricing plan (admin only)
const createPricingPlan = async (planData) => {
  try {
    const token = getAuthToken(); // Implement your auth token logic
    const response = await fetch('/api/pricing-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });
    const data = await response.json();
    return data.response.pricingPlan;
  } catch (error) {
    console.error('Error creating pricing plan:', error);
  }
};
```

### cURL Examples

```bash
# Get all pricing plans
curl -X GET "http://localhost:9400/api/pricing-plans"

# Get specific pricing plan
curl -X GET "http://localhost:9400/api/pricing-plans/28"

# Create pricing plan (admin)
curl -X POST "http://localhost:9400/api/pricing-plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Enterprise",
    "description": "Comprehensive HR solution for large organizations",
    "monthlyPrice": 199,
    "yearlyPrice": 1980,
    "features": [
      {"name": "Unlimited employees", "included": true},
      {"name": "Priority support", "included": true}
    ],
    "isActive": true,
    "sortOrder": 3
  }'

# Update pricing plan (admin)
curl -X PUT "http://localhost:9400/api/pricing-plans/28" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "monthlyPrice": 39,
    "yearlyPrice": 388
  }'

# Delete pricing plan (admin)
curl -X DELETE "http://localhost:9400/api/pricing-plans/28" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Toggle pricing plan status (admin)
curl -X PATCH "http://localhost:9400/api/pricing-plans/28/toggle" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Notes

- All pricing amounts are stored and returned as numbers representing INR
- The `features` field is stored as JSONB in the database for flexibility
- Plans are ordered by `sortOrder` ascending, then by name
- Deleting a plan is permanent - consider using the toggle endpoint for temporary deactivation
- Public endpoints (GET) do not require authentication
- Protected endpoints require admin role authentication
- Table name in database is `"PricingPlans"` (case-sensitive with quotes)

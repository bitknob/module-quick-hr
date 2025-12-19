# Common Information

[← Back to API Documentation Index](./README.md)

## Error Responses

All errors follow the standard response format:

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Error message",
    "responseDetail": "Detailed error information"
  },
  "response": null
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## Authentication Flow

1. **Signup/Login** → Receive `accessToken` and `refreshToken`
2. **Include token** in all authenticated requests: `Authorization: Bearer <accessToken>`
3. **Token expires** → Use `refreshToken` to get new tokens
4. **Email verification** required for full access

---

## Access Control Rules

- **Super Admin / Provider Admin / Provider HR Staff**: Access to all companies
- **HRBP / Company Admin**: Access to assigned company only
- **Department Head / Manager**: Access to their team and below (hierarchy-based)
- **Employee**: Access to own data only

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- UUIDs are used for all IDs
- Pagination starts at page 1
- Default limit is 20 items per page (10 for approvals)
- All timestamps are in UTC

### Device Types

- `ios` - iOS devices (iPhone, iPad)
- `android` - Android devices
- `web` - Web browsers
- `other` - Other device types

### Approval Request Types

- `leave` - Leave requests
- `employee_create` - New employee creation
- `employee_update` - Employee information updates
- `employee_transfer` - Employee transfers
- `employee_promotion` - Employee promotions
- `salary_change` - Salary modifications
- `department_change` - Department transfers
- `other` - Other request types

### Approval Status

- `pending` - Awaiting approval
- `approved` - Approved by all required approvers
- `rejected` - Rejected by an approver
- `cancelled` - Cancelled by requester
- `expired` - Expired before approval

### Approval Priority

- `low` - Low priority
- `normal` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent priority

## Request Logging Details

All API requests are automatically logged to the `RequestLogs` table. Each log entry contains:

### Logged Information

- **Request**:
  - HTTP method (GET, POST, PUT, DELETE, etc.)
  - Full URL and path
  - Query parameters
  - Request headers (sensitive data redacted)
  - Request body (sensitive data redacted)

- **Response**:
  - HTTP status code
  - Response body
  - Response headers

- **User Context**:
  - User ID (if authenticated)
  - Employee ID (if available)
  - Company ID (if available)

- **Metadata**:
  - Client IP address
  - User-Agent string
  - Request duration (milliseconds)
  - Service name (auth-service, employee-service, etc.)
  - Timestamp

### Data Sanitization

The following fields are automatically redacted in logs:
- Authorization headers
- Cookie headers
- X-API-Key headers
- Any field containing: `password`, `token`, `secret`, `key`, `authorization`

### Querying Logs

Request logs can be queried from the `RequestLogs` table using standard SQL:

```sql
-- Get all requests for a specific user
SELECT * FROM "RequestLogs" WHERE "userId" = 'user-uuid' ORDER BY "createdAt" DESC;

-- Get all failed requests (status >= 400)
SELECT * FROM "RequestLogs" WHERE "responseStatus" >= 400 ORDER BY "createdAt" DESC;

-- Get requests by service
SELECT * FROM "RequestLogs" WHERE "serviceName" = 'auth-service' ORDER BY "createdAt" DESC;

-- Get slow requests (> 1 second)
SELECT * FROM "RequestLogs" WHERE "duration" > 1000 ORDER BY "duration" DESC;
```


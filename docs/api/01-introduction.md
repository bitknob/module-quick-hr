# Introduction

## Base URL

Base URL: `http://localhost:9400` (API Gateway)

## Response Format

All endpoints return a standardized response format:

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Success message",
    "responseDetail": "Additional details"
  },
  "response": {} // object or [] // array
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Request Logging

All HTTP requests and responses are automatically logged to the database for auditing, debugging, and analysis purposes. The logging system captures:

- **Request Details**: Method, URL, path, query parameters, headers (sanitized), body (sanitized)
- **Response Details**: Status code, response body, response headers
- **User Context**: User ID, Employee ID, Company ID (when available)
- **Metadata**: IP address, User-Agent, request duration, service name, timestamp

**Note**: Sensitive data (passwords, tokens, API keys) is automatically sanitized before logging. Logging is non-blocking and does not affect API performance.

For detailed information about request logging, see [Common Information](10-common.md#request-logging-details).


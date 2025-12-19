# API Documentation

Base URL: `http://localhost:9400` (API Gateway)

## Overview

This API documentation is organized by module for easier navigation and maintenance. Each module contains detailed endpoint documentation with request/response examples.

## Documentation Structure

- [Introduction](./01-introduction.md) - Base URL, response format, authentication, request logging
- [Auth Service](./02-auth.md) - User authentication, signup, login, password management, menu
- [Device Management](./03-devices.md) - Device registration and management
- [Approval System](./04-approvals.md) - Approval requests and workflow
- [Company Service](./05-companies.md) - Company CRUD operations
- [Department Service](./06-departments.md) - Department management
- [Employee Service](./07-employees.md) - Employee management and hierarchy
- [Global Search](./08-search.md) - Multi-entity search functionality
- [Health Check](./09-health.md) - Service health endpoints
- [Common Information](./10-common.md) - Error responses, authentication flow, access control, notes
- [Role Management](./11-roles.md) - Role management with hierarchy, permissions, and menu access

## Quick Start

1. Review the [Introduction](./01-introduction.md) for base URL and authentication
2. Check [Common Information](./10-common.md) for error handling and access control rules
3. Navigate to specific modules for detailed endpoint documentation

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


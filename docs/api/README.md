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
- [User Module Management](./12-user-modules.md) - Module assignments for users at levels 2, 3, and 4
- [Payroll Service](./13-payroll.md) - Payroll processing, salary structures, tax configuration, and payslip management
- [Attendance Management](./14-attendance.md) - Attendance tracking, check-in/check-out, and workday statistics
- [Leave Management](./15-leaves.md) - Leave request management with approval workflow
- [Employee Documents](./16-employee-documents.md) - Document upload, storage, and verification
- [Employee Details](./17-employee-details.md) - Additional employee information management
- [S3 Usage & Free Tier](./18-s3-usage.md) - AWS S3 usage monitoring and free tier optimization
- [Notification Management](./19-notifications.md) - Notification system with in-app, email, and push support
- [User Role Assignment](./20-user-role-assignment.md) - Assign and manage user roles for employees
- [Employee Onboarding](./21-employee-onboarding.md) - Streamlined employee onboarding with combined user and employee creation
- [Payment Service](./22-payments.md) - Payment processing, order creation, and verification using Razorpay integration

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

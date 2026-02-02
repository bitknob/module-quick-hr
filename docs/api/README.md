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
- [Pricing Plans](./23-pricing-plans.md) - Subscription pricing plans management
- [Subscriptions](./24-subscriptions.md) - Subscription management with free trials and Razorpay integration
- [Subscription History](./25-subscription-history.md) - Complete subscription lifecycle tracking and analytics
- [Onboarding API](./26-onboarding.md) - Post-subscription onboarding with user, company, and role creation

## Quick Start

1. Review the [Introduction](./01-introduction.md) for base URL and authentication
2. Check [Common Information](./10-common.md) for error handling and access control rules
3. Navigate to specific modules for detailed endpoint documentation
4. Check the [API Index](./API_INDEX.md) for a complete list of all endpoints

## Common Workflows

### New Company Setup Flow
1. **Create Subscription** → [Subscriptions API](./24-subscriptions.md) - Start with a free trial
2. **Complete Onboarding** → [Onboarding API](./26-onboarding.md) - Create user, company, employee, and assign roles
3. **User Login** → [Auth API](./02-auth.md) - Get JWT token for API access
4. **Manage Company** → [Companies API](./05-companies.md) - Update company details
5. **Add Employees** → [Employees API](./07-employees.md) - Hire team members

### Employee Management Flow
1. **User Authentication** → [Auth API](./02-auth.md) - Login with credentials
2. **Employee Operations** → [Employees API](./07-employees.md) - CRUD operations
3. **Role Assignment** → [User Role Assignment](./20-user-role-assignment.md) - Assign appropriate roles
4. **Attendance Tracking** → [Attendance API](./14-attendance.md) - Track work hours
5. **Leave Management** → [Leaves API](./15-leaves.md) - Request and approve leaves

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

# HRM Microservices Application

A comprehensive Human Resource Management (HRM) system built with Node.js and TypeScript, following a microservices architecture. The system supports multi-tenant operations with hierarchical access control and enterprise-level security.

## Features

- **Multi-Tenant Architecture**: Support for multiple companies with isolated data
- **Hierarchical Access Control**: 8-level role-based access system (Super Admin to Employee)
- **Enterprise Security**: Custom JWT authentication with bcrypt password hashing
- **Email Verification**: Configurable email service (SendGrid/SMTP) with custom domain support
- **Organizational Hierarchy**: Self-referential employee hierarchy with cycle detection
- **Approval Workflow System**: Multi-level approval system for all request types (leave, employee changes, transfers, etc.)
- **Mobile Device Management**: Device registration, push notification token management, and multi-device support
- **Request Logging**: Comprehensive HTTP request/response logging with automatic data sanitization
- **PostgreSQL Database**: Structured data storage with optimized queries
- **Standardized API Responses**: Consistent response format across all endpoints
- **Auto-reload**: Development mode with automatic service restart

## Architecture

### Microservices

1. **API Gateway** (Port 9400)
   - Routes requests to appropriate services
   - Health check endpoints

2. **Auth Service** (Port 9401)
   - User authentication and authorization
   - JWT token management
   - Email verification
   - Password reset functionality

3. **Employee Service** (Port 9402)
   - Employee CRUD operations
   - Company management (create, update company profile)
   - Organizational hierarchy management
   - Company-based access control
   - Employee search and filtering
   - Approval workflow management
   - Multi-level approval system

### Shared Packages

- **@hrm/common**: Shared types, utilities, middleware, and error handling

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (primary), MongoDB (for future chat service)
- **ORM**: Sequelize (PostgreSQL)
- **Authentication**: JWT (custom implementation)
- **Email**: Twilio SendGrid / SMTP
- **Build Tool**: Turborepo
- **Package Manager**: npm workspaces

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15+
- Docker and Docker Compose (for local development)
- npm or yarn

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd module-quick-hr
```

### 2. Setup

**Unix/Mac:**
```bash
./setup.sh
```

**Windows:**
```bash
setup.bat
```

This will:
- Create `.env` file from `.env.example`
- Install all dependencies
- Build common packages
- Start Docker containers (PostgreSQL, MongoDB)
- Run database migrations
- Optionally seed initial data

### 3. Configure Environment

Edit `.env` file in the root directory with your configuration:
- Database credentials
- JWT secrets (change in production!)
- Email service configuration
- Service ports

### 4. Run Services

**Unix/Mac:**
```bash
./run.sh
```

**Windows:**
```bash
run.bat
```

This will:
- Check and free required ports
- Verify database connection
- Check if migrations are run
- Start all services

### 5. Stop Services

**Unix/Mac:**
```bash
./stop.sh
```

**Windows:**
```bash
stop.bat
```

## Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
npm install

# Build common package
cd packages/common
npm install
npm run build
cd ../..

# Start Docker containers
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed data (optional)
npm run db:seed

# Start services
npm run dev
```

## Project Structure

```
module-quick-hr/
├── packages/
│   └── common/              # Shared types, utilities, middleware
├── services/
│   ├── api-gateway/         # API Gateway service
│   ├── auth-service/        # Authentication service
│   └── employee-service/    # Employee management service
├── scripts/
│   ├── create-tables.sql    # Database schema
│   ├── migrate.js          # Migration runner
│   └── seed.js              # Data seeder
├── .env.example             # Environment variables template
├── docker-compose.yml       # Docker services configuration
├── package.json             # Root package configuration
└── turbo.json               # Turborepo configuration
```

## User Roles and Hierarchy

1. **Super Admin** - Full system access, can manage all companies. Has unrestricted access to all data and can override approval workflows, view/edit any employee records, and configure system-wide settings across all companies.
2. **Provider Admin** - Manages provider HR team, access to all companies
3. **Provider HR Staff** - Handles shared services, access to multiple/all companies
4. **HRBP** - Dedicated HR Business Partner, assigned to one company
5. **Company Admin** - Local admin within one company
6. **Department Head** - Top-level manager within company
7. **Manager** - Direct reporting manager
8. **Employee** - Base level, self-service only

## Database Schema

### PostgreSQL Tables

- `Users` - User accounts and authentication
- `UserDevices` - Mobile device registration and push notification tokens
- `Companies` - Multi-tenant company data
- `Employees` - Employee records with hierarchy
- `Departments` - Department information
- `LeaveRequests` - Leave management
- `ApprovalRequests` - Generic approval requests for all request types
- `ApprovalSteps` - Multi-level approval workflow steps
- `ApprovalHistory` - Approval action history and audit trail
- `RequestLogs` - HTTP request/response logging for all API calls
- `Attendance` - Attendance tracking
- `Payroll` - Payroll records
- `PerformanceReviews` - Performance reviews
- `AuditLogs` - Audit trail

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Environment Variables

All environment variables are configured in the root `.env` file. See `.env.example` for all available options.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database configuration
- `JWT_SECRET`, `JWT_REFRESH_SECRET` - JWT signing secrets
- `EMAIL_PROVIDER` - Email service provider (sendgrid/smtp)
- `SENDGRID_API_KEY` or `SMTP_*` - Email service credentials
- `FRONTEND_URL` - Frontend application URL for email links

## Development

### Running in Development Mode

Services automatically reload on file changes using nodemon:

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## API Response Format

All APIs return a standardized response format:

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

## Security Features

- Bcrypt password hashing (12 rounds)
- JWT access and refresh tokens
- Email verification required
- Role-based access control (RBAC)
- Company-level data isolation
- Hierarchy-based access restrictions
- Device tracking (IP address, user agent)
- Multi-device management
- Input validation with Zod
- SQL injection protection (Sequelize)
- XSS protection

## Mobile Support

The system includes comprehensive mobile device support:

- **Device Registration**: Automatic device registration on login
- **Push Notifications**: FCM (Android) and APNS (iOS) token management
- **Multi-Device Support**: Users can have multiple active devices
- **Device Management**: View, update, and manage registered devices
- **Primary Device**: Support for marking primary device
- **Device Security**: IP address and user agent tracking for security

## Approval System

The system includes a comprehensive approval workflow system:

- **Multi-Level Approvals**: Support for multiple approval steps
- **Request Types**: Leave, employee changes, transfers, promotions, salary changes, etc.
- **Flexible Approvers**: Role-based, manager-based, or specific user approvers
- **Approval History**: Complete audit trail of all approval actions
- **Status Tracking**: Pending, approved, rejected, cancelled, expired
- **Priority Levels**: Low, normal, high, urgent
- **Comments & Rejection Reasons**: Full communication support

### Super Admin Capabilities in Approval System

Super Admins have unrestricted access to the approval system:

- **View All Approvals**: Can view all approval requests across all companies (no company restriction)
- **View Pending Approvals**: Can see all pending approvals system-wide, not just those assigned to them
- **Approve Any Request**: Can approve any pending approval request, even if not assigned as approver (bypasses authorization check)
- **Reject Any Request**: Can reject any pending approval request, even if not assigned as approver (bypasses authorization check)
- **Cancel Any Request**: Can cancel any pending approval request, regardless of who created it (bypasses requester restriction)
- **No Employee Context Required**: Super Admins can perform all approval actions without requiring an employee record

## Request Logging

The system includes comprehensive HTTP request logging:

- **Automatic Logging**: All HTTP requests and responses are automatically logged
- **Complete Request Data**: Method, URL, path, query params, headers, body
- **Complete Response Data**: Status code, response body, response headers
- **User Context**: Automatically captures user ID, employee ID, and company ID
- **Metadata**: IP address, user agent, request duration, service name
- **Data Sanitization**: Automatically redacts sensitive data (passwords, tokens, API keys)
- **Non-Blocking**: Logging doesn't affect request performance
- **Database Storage**: All logs stored in `RequestLogs` table for analysis and auditing

### What Gets Logged

- **Request Information**: HTTP method, full URL, path, query parameters, headers (sanitized), request body (sanitized)
- **Response Information**: HTTP status code, response body, response headers
- **User Context**: User ID (if authenticated), Employee ID (if available), Company ID (if available)
- **Metadata**: Client IP address, User-Agent, request duration in milliseconds, service name, timestamp

### Security Features

- **Automatic Sanitization**: Sensitive fields are automatically redacted:
  - Authorization headers
  - Passwords
  - Tokens (JWT, refresh tokens, etc.)
  - API keys
  - Any field containing "password", "token", "secret", or "key" in the name

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Maintain the standard response format
4. Add appropriate error handling
5. Update API documentation

## License

Copyright (c) 2025 Bitknob Innovation Private Limited. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without the express written permission of Bitknob Innovation Private Limited.

See [LICENSE](./LICENSE) file for full terms and conditions.

For licensing inquiries, visit: [https://www.bitknob.com/](https://www.bitknob.com/)

## Support

For issues, questions, or support, please contact:

**Bitknob Innovation Private Limited**  
Nagla Ramtal, Mathura, Vrindavan, Uttar Pradesh 281121, India  
Email: support@bitknob.com  
Phone: +91 8755276470  
Website: [https://www.bitknob.com/](https://www.bitknob.com/)


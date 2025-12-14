# HRM Microservices Application

A comprehensive Human Resource Management (HRM) system built with Node.js and TypeScript, following a microservices architecture. The system supports multi-tenant operations with hierarchical access control and enterprise-level security.

## Features

- **Multi-Tenant Architecture**: Support for multiple companies with isolated data
- **Hierarchical Access Control**: 8-level role-based access system (Super Admin to Employee)
- **Enterprise Security**: Custom JWT authentication with bcrypt password hashing
- **Email Verification**: Configurable email service (SendGrid/SMTP) with custom domain support
- **Organizational Hierarchy**: Self-referential employee hierarchy with cycle detection
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
   - Organizational hierarchy management
   - Company-based access control
   - Employee search and filtering

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

1. **Super Admin** - Full system access, can manage all companies
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
- `Companies` - Multi-tenant company data
- `Employees` - Employee records with hierarchy
- `Departments` - Department information
- `LeaveRequests` - Leave management
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
- Input validation with Zod
- SQL injection protection (Sequelize)
- XSS protection

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Maintain the standard response format
4. Add appropriate error handling
5. Update API documentation

## License

[Your License Here]

## Support

For issues and questions, please contact [Your Contact Information]


# Quick Reference: Assign Employee to Role

## Quick Start

### Assign a Role to an Employee

```bash
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID_HERE",
    "role": "manager"
  }'
```

### Check Employee's Current Role

```bash
curl -X GET http://localhost:9400/api/auth/users/USER_UUID_HERE/role \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Find Employee by Email

```bash
curl -X GET http://localhost:9400/api/auth/users/email/employee@company.com/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Available Roles

- `super_admin` - Full system access
- `provider_admin` - Provider-level admin
- `provider_hr_staff` - HR staff
- `hrbp` - HR Business Partner
- `company_admin` - Company admin
- `department_head` - Department head
- `manager` - Team manager
- `employee` - Regular employee

## Common Scenarios

### Promote Employee to Manager

```bash
# 1. Get current role
curl -X GET http://localhost:9400/api/auth/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 2. Assign manager role
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "role": "manager"}'
```

### Assign Role to New Employee

```bash
# After user signup, assign appropriate role
curl -X POST http://localhost:9400/api/auth/assign-role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "NEW_USER_ID", "role": "employee"}'
```

## Who Can Assign Roles?

- **super_admin** - Can assign ANY role including super_admin
- **provider_admin** - Can assign any role EXCEPT super_admin
- **Others** - Cannot assign roles

## Full Documentation

For complete documentation, see:

- [User Role Assignment API](./api/20-user-role-assignment.md)
- [Implementation Summary](./USER_ROLE_ASSIGNMENT_IMPLEMENTATION.md)

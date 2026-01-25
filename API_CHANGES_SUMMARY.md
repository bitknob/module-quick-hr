# API Changes Summary

This document summarizes the recent API enhancements and fixes implemented to improve the HRM system functionality and security.

## 🚀 Major Enhancements

### 1. Enhanced Login System
**Files Updated:** `docs/api/02-auth.md`

#### New Features:
- **Company Email Login**: Users can now login using their company email (`userCompEmail`) instead of personal email
- **Auto-Account Creation**: When a user account doesn't exist but an employee record with the company email is found, the system automatically creates a user account
- **Smart Email Detection**: The system automatically detects whether the provided email is personal or company email

#### Login Flow:
1. Direct login if user account exists
2. Auto-create account if employee exists with company email
3. Send credentials to personal email, instruct login with company email
4. Failed authentication if no record found

### 2. Enhanced Security for Resend Credentials
**Files Updated:** `docs/api/02-auth.md`

#### Security Improvements:
- **Removed `companyName` from request body**: Prevents potential security vulnerabilities
- **Automatic company name fetching**: System now fetches company name from employee record
- **Smart email resolution**: Works with both personal and company emails
- **Company email in credentials**: Email shows company email for login instead of personal email

#### Request Body Changes:
```json
// Before (vulnerable)
{
  "email": "employee@company.com",
  "companyName": "Acme Corp"  // ❌ User-provided
}

// After (secure)
{
  "email": "employee@company.com"  // ✅ Company name auto-fetched
}
```

### 3. Enhanced Employee Profile Access
**Files Updated:** `docs/api/07-employees.md`

#### New Features:
- **Enhanced Email Lookup**: Supports finding employees by either personal email (`userEmail`) or company email (`userCompEmail`)
- **Consistent Response Format**: Always returns 200 status with clear indicators
- **JWT Token Compatibility**: Uses `userId` field from JWT token (fixed from `uid`)
- **User-Friendly Messages**: Better error handling and guidance

#### Response Improvements:
- Super Admins: Get user info with `isSuperAdmin: true` when no employee record
- Regular Users: Get 200 response with `hasEmployeeRecord: false` instead of 404
- Clear error messages and guidance for missing employee records

### 4. Enhanced Attendance System
**Files Updated:** `docs/api/14-attendance.md`

#### New Features:
- **Automatic Company Detection**: If `companyId` is "undefined", system finds it from employee record
- **Smart Employee Lookup**: Supports finding employees by user ID or email address
- **Company Email Support**: Works seamlessly with company email login system

#### Enhanced Use Cases:
- Traditional check-in with both IDs
- Auto-detection with "undefined" company ID
- User ID check-in for simplified integration

## 🔧 Technical Fixes

### 1. Database Column Name Fixes
**Files Updated:** `services/employee-service/src/queries/employee.queries.ts`

#### Fixed:
- Changed `email` to `userEmail` in all employee queries
- Updated search filters, attributes, and raw SQL queries
- Resolved PostgreSQL "column does not exist" errors

### 2. Sequelize Model Instance Access
**Files Updated:** 
- `services/employee-service/src/services/attendance.service.ts`
- `services/employee-service/src/services/leave.service.ts`

#### Fixed:
- Used `.get('id')` and `.get('status')` instead of direct property access
- Added safety checks for undefined values
- Resolved "undefined id" errors in attendance and leave operations

### 3. JWT Token Field Corrections
**Files Updated:**
- `services/employee-service/src/controllers/leave.controller.ts`
- `services/employee-service/src/controllers/employee.controller.ts`

#### Fixed:
- Changed `req.user.uid` to `req.user.userId` throughout the system
- Resolved "Approver not found" errors in leave rejection
- Fixed user ID references in employee profile access

### 4. Enhanced Email Templates
**Files Updated:** `services/auth-service/src/services/auth.service.ts`

#### Fixed:
- Email templates now show company email for login credentials
- Improved security by not exposing personal emails in login information
- Better user experience with clear login instructions

## 🛡️ Security Improvements

### 1. Input Validation Enhancement
- Removed `companyName` from user input in resend credentials
- Automatic data fetching from trusted database sources
- Prevention of potential injection attacks

### 2. Email Content Security
- Company email displayed in credentials instead of personal email
- Reduced risk of personal email exposure in business communications
- Clear separation of personal and business email usage

## 📊 New Service Methods

### 1. Employee Service
```typescript
static async getEmployeeByAnyEmail(email: string): Promise<Employee>
```
- Finds employees by either personal or company email
- Enhanced lookup for company email login support

### 2. Employee Queries
```typescript
static async findByAnyEmail(email: string): Promise<Employee | null>
```
- Database-level support for dual email lookup
- Optimized queries with OR conditions

## 🔄 Middleware Enhancements

### 1. Access Control Middleware
**Files Updated:** `services/employee-service/src/middleware/accessControl.ts`

#### Enhanced:
- Uses `findByAnyEmail` for employee context resolution
- Supports company email login in employee context
- Better error handling for missing employee records

## 📝 API Response Improvements

### 1. Consistent Error Handling
- Standardized response formats across endpoints
- User-friendly error messages
- Proper HTTP status codes

### 2. Enhanced Response Data
- Better user information in responses
- Clear indicators for employee record existence
- Improved debugging information

## 🧪 Testing Recommendations

### 1. Login System Testing
```bash
# Test company email login
curl -X POST http://localhost:9400/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com", "password": "password"}'

# Test auto-account creation
curl -X POST http://localhost:9400/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "company-only@company.com", "password": "any"}'
```

### 2. Attendance System Testing
```bash
# Test automatic company detection
curl -X POST http://localhost:9400/api/attendance/checkin/{user_id}/undefined \
  -H "Authorization: Bearer <token>" \
  -d '{}'
```

### 3. Employee Profile Testing
```bash
# Test enhanced employee lookup
curl -X GET http://localhost:9400/api/employees/me \
  -H "Authorization: Bearer <company_email_token>"
```

## 🎯 Impact Summary

### User Experience Improvements
- ✅ Seamless company email login
- ✅ Automatic account creation for new employees
- ✅ Better error messages and guidance
- ✅ Consistent API responses

### Security Enhancements
- ✅ Removed user-provided company names
- ✅ Automatic data fetching from trusted sources
- ✅ Secure email content handling
- ✅ Input validation improvements

### Developer Experience
- ✅ Simplified attendance check-in (no company ID needed)
- ✅ Enhanced employee lookup capabilities
- ✅ Better error handling and debugging
- ✅ Consistent API documentation

### System Reliability
- ✅ Fixed database column name issues
- ✅ Resolved Sequelize model access problems
- ✅ Corrected JWT token field usage
- ✅ Enhanced middleware functionality

---

**Note**: All changes maintain backward compatibility while adding new enhanced features. The system gracefully handles both old and new usage patterns.

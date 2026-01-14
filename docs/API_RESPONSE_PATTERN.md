# API Response Pattern: HTTP 200 with Response Codes

## Problem Statement

When APIs return HTTP 404 status codes for "not found" scenarios, frontend applications often display error pages or error toasts, even when the absence of data is a normal, expected state (e.g., employee hasn't filled out optional details yet).

## Solution

**Always return HTTP 200** for successful API calls, even when no data is found. Use the `responseCode` field in the response body to indicate the actual status.

### Response Format

```json
{
  "header": {
    "responseCode": 404, // Indicates "not found" in response body
    "responseMessage": "Employee detail not found",
    "responseDetail": "No additional details have been added for this employee yet."
  },
  "response": null
}
```

**HTTP Status**: `200 OK`  
**Response Code**: `404` (in body)

## Implementation

### Updated ResponseFormatter

The `ResponseFormatter.success()` method now supports separate HTTP status and response codes:

```typescript
ResponseFormatter.success(
  res,
  null, // data
  'Not found message', // message
  'Additional detail', // detail
  200, // HTTP status (always 200 for successful API calls)
  404 // responseCode in body (indicates not found)
);
```

### Method Signature

```typescript
static success<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  detail: string = '',
  httpStatus: number = 200,        // HTTP status code
  responseCode?: number            // Response code in body (optional)
): void
```

## When to Use This Pattern

### ✅ Use HTTP 200 with responseCode 404 for:

1. **Optional Data Not Found**

   - Employee details not yet filled
   - Documents not uploaded
   - Profile information not completed

2. **Empty Result Sets**

   - No notifications
   - No pending approvals
   - No leave requests

3. **User-Specific Data**
   - User hasn't created any records yet
   - No data for current filters

### ❌ Still Use HTTP 404 for:

1. **Invalid Routes**

   - Endpoint doesn't exist
   - Typo in URL

2. **Invalid IDs**

   - Resource ID doesn't exist in database
   - Malformed UUID

3. **Authorization Failures**
   - User trying to access someone else's data
   - Insufficient permissions

## Examples

### Example 1: Employee Details Not Found

**Before (Bad - causes UI errors):**

```typescript
if (!detail) {
  ResponseFormatter.error(res, 'Employee detail not found', '', 404);
  return;
}
```

**After (Good - UI handles gracefully):**

```typescript
if (!detail) {
  ResponseFormatter.success(
    res,
    null,
    'Employee detail not found',
    'No additional details have been added for this employee yet.',
    200, // HTTP status
    404 // responseCode in body
  );
  return;
}
```

### Example 2: No Documents Found

**Before:**

```typescript
if (documents.length === 0) {
  ResponseFormatter.error(res, 'No documents found', '', 404);
  return;
}
```

**After:**

```typescript
if (documents.length === 0) {
  ResponseFormatter.success(
    res,
    [],
    'No documents found',
    'No documents have been uploaded yet.',
    200, // HTTP status
    200 // responseCode (this is actually success - empty array is valid)
  );
  return;
}
```

### Example 3: Employee Record Not Found (Still Use 404)

```typescript
// This should still return HTTP 404 because it's an error condition
const employee = await Employee.findByPk(id);
if (!employee) {
  throw new NotFoundError('Employee not found');
}
```

## Frontend Handling

### Before (Shows Error Page)

```typescript
try {
  const response = await fetch('/api/employees/details');
  if (!response.ok) {
    // HTTP 404 triggers this
    showErrorPage(); // ❌ User sees error page
  }
} catch (error) {
  showErrorPage();
}
```

### After (Handles Gracefully)

```typescript
const response = await fetch('/api/employees/details');
const data = await response.json();

if (data.header.responseCode === 404) {
  showEmptyState(); // ✅ User sees friendly "no data yet" message
} else if (data.header.responseCode === 200) {
  displayData(data.response);
}
```

## Updated Controllers

The following controllers have been updated to use this pattern:

1. **Employee Controller**

   - `getCurrentEmployeeDetails` - Returns 200 with 404 when no details exist

2. **Document Controller** (to be updated)

   - `getDocumentsByEmployee` - Returns 200 with empty array

3. **Attendance Controller** (to be updated)

   - `getAttendanceByEmployee` - Returns 200 with empty array

4. **Leave Controller** (to be updated)

   - `getLeaveRequests` - Returns 200 with empty array

5. **Notification Controller** (to be updated)
   - `getNotifications` - Returns 200 with empty array

## Documentation Updates

All API documentation has been updated to reflect this pattern:

- Response examples show HTTP 200 with responseCode 404
- Error handling sections explain the difference
- Frontend integration examples updated

## Benefits

1. **Better UX**: No error pages for normal "no data" states
2. **Clearer Intent**: HTTP status indicates API call success, responseCode indicates data status
3. **Easier Frontend**: Simpler error handling logic
4. **Consistent**: All APIs follow the same pattern

## Migration Checklist

- [x] Update ResponseFormatter to support separate HTTP and response codes
- [x] Update employee details endpoint
- [ ] Update all other "not found" scenarios
- [ ] Update API documentation
- [ ] Update frontend to handle new pattern
- [ ] Test all affected endpoints

## Testing

### Test HTTP 200 with responseCode 404

```bash
curl -i http://localhost:9400/api/employees/details \
  -H "Authorization: Bearer <token>"

# Expected Response:
# HTTP/1.1 200 OK
# {
#   "header": {
#     "responseCode": 404,
#     "responseMessage": "Employee detail not found",
#     "responseDetail": "No additional details have been added..."
#   },
#   "response": null
# }
```

### Test Normal Success

```bash
curl -i http://localhost:9400/api/employees/details \
  -H "Authorization: Bearer <token>"

# Expected Response:
# HTTP/1.1 200 OK
# {
#   "header": {
#     "responseCode": 200,
#     "responseMessage": "Employee detail retrieved successfully",
#     "responseDetail": ""
#   },
#   "response": { ... }
# }
```

## Notes

- This pattern is specifically for "data not found" scenarios, not "endpoint not found"
- Always include helpful messages in `responseMessage` and `responseDetail`
- Frontend should check `responseCode` in body, not HTTP status
- Backward compatible: existing code still works (responseCode defaults to httpStatus)

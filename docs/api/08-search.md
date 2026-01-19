# Global Search Endpoint

[← Back to API Documentation Index](./README.md)

Base Path: `/api/search`

The global search endpoint allows users to search across multiple entities (employees, companies, departments, and menus) with a single query. Results are automatically filtered based on the user's role and company access.

### Global Search

**Method:** `GET`  
**URL:** `/api/search`  
**Full URL:** `http://localhost:9400/api/search?q=john&limit=20`  
**Authentication:** Required

**Query Parameters:**

- `q` or `searchTerm` (string, required) - Search term (minimum 2 characters)
- `limit` (number, optional) - Maximum number of results to return (default: 20, max: 50)

**Access Control:**

- **Employees**: Searchable by Super Admin, Provider Admin, Provider HR Staff, HRBP, Company Admin, Department Head, Manager
  - Non-super-admin users only see employees from their company
- **Companies**: Searchable by Super Admin, Provider Admin, Provider HR Staff only
- **Departments**: Searchable by Super Admin, Provider Admin, Provider HR Staff, HRBP, Company Admin, Department Head, Manager
  - Non-super-admin users only see departments from their company
- **Menus**: Searchable by all authenticated users (role-based menu filtering applies)

**Response (200):**

```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Search completed successfully",
    "responseDetail": "Found 15 result(s) across 4 type(s)"
  },
  "response": {
    "results": [
      {
        "type": "employee",
        "id": "employee-uuid",
        "title": "John Doe",
        "subtitle": "Software Engineer • Engineering",
        "path": "/dashboard/employees/employee-uuid",
        "icon": "user",
        "metadata": {
          "userCompEmail": "john.doe@example.com",
          "employeeId": "EMP001",
          "companyId": "company-uuid"
        }
      },
      {
        "type": "company",
        "id": "company-uuid",
        "title": "Acme Corporation",
        "subtitle": "ACME",
        "path": "/dashboard/companies/company-uuid",
        "icon": "building",
        "metadata": {
          "code": "ACME",
          "description": "Technology company"
        }
      },
      {
        "type": "department",
        "id": "department-uuid",
        "title": "Engineering",
        "subtitle": "Software development department",
        "path": "/dashboard/departments/department-uuid",
        "icon": "sitemap",
        "metadata": {
          "companyId": "company-uuid",
          "description": "Software development department"
        }
      },
      {
        "type": "menu",
        "id": "employees",
        "title": "Employees",
        "subtitle": "/dashboard/employees",
        "path": "/dashboard/employees",
        "icon": "users",
        "metadata": {}
      }
    ],
    "total": 15,
    "byType": {
      "employees": 8,
      "companies": 2,
      "departments": 3,
      "menus": 2
    }
  }
}
```

**Response (400) - Invalid Search Term:**

```json
{
  "header": {
    "responseCode": 400,
    "responseMessage": "Search term must be at least 2 characters",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**

```bash
curl -X GET "http://localhost:9400/api/search?q=john&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

**Search Features:**

- **Multi-entity search**: Searches across employees, companies, departments, and menus simultaneously
- **Role-based filtering**: Only returns results the user is authorized to see
- **Company isolation**: Non-super-admin users only see results from their company
- **Relevance sorting**: Results are sorted by relevance (exact matches first, then partial matches)
- **Result distribution**: Results are distributed across entity types (40% employees, 30% companies, 20% departments, 10% menus)
- **Case-insensitive**: Search is case-insensitive
- **Partial matching**: Matches partial strings in names, emails, IDs, job titles, etc.

**Search Fields:**

- **Employees**: firstName, lastName, userCompEmail, employeeId, jobTitle, department
- **Companies**: name, code, description
- **Departments**: name, description
- **Menus**: label, path

**Notes:**

- Search term must be at least 2 characters long
- Maximum limit is 50 results
- Results are automatically filtered based on user role and company access
- Menu results are filtered based on the user's role (only accessible menus are returned)

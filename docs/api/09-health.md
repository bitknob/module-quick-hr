# Health Check Endpoints

[← Back to API Documentation Index](./README.md)


### API Gateway Health

**Method:** `GET`  
**URL:** `/health`  
**Full URL:** `http://localhost:9400/health`  
**Authentication:** Not required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "API Gateway is healthy",
    "responseDetail": ""
  },
  "response": {
    "status": "ok",
    "service": "api-gateway",
    "services": {
      "auth": "http://localhost:9401",
      "employee": "http://localhost:9402"
    }
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/health
```

---

# Device Management Endpoints

[← Back to API Documentation Index](README.md)


Base Path: `/api/devices`

All device endpoints require authentication.

## 1. Register Device

**Method:** `POST`  
**URL:** `/api/devices/register`  
**Full URL:** `http://localhost:9400/api/devices/register`  
**Authentication:** Required

**Request Body:**
```json
{
  "deviceId": "unique-device-id-12345",
  "deviceType": "ios",
  "deviceName": "iPhone 14 Pro",
  "deviceModel": "iPhone",
  "osVersion": "17.0",
  "appVersion": "1.0.0",
  "fcmToken": "firebase-cloud-messaging-token",
  "apnsToken": "apple-push-notification-token",
  "isPrimary": true
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device registered successfully",
    "responseDetail": "Device iPhone 14 Pro has been registered"
  },
  "response": {
    "id": "device-uuid",
    "userId": "user-uuid",
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro",
    "deviceModel": "iPhone",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "fcmToken": "firebase-cloud-messaging-token",
    "apnsToken": "apple-push-notification-token",
    "isActive": true,
    "isPrimary": true,
    "lastActiveAt": "2025-01-14T10:30:00Z",
    "createdAt": "2025-01-14T10:30:00Z",
    "updatedAt": "2025-01-14T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/devices/register \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro",
    "fcmToken": "firebase-token"
  }'
```

---

## 2. Get All Devices

**Method:** `GET`  
**URL:** `/api/devices`  
**Full URL:** `http://localhost:9400/api/devices`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Devices retrieved successfully",
    "responseDetail": "Found 2 device(s)"
  },
  "response": [
    {
      "id": "device-uuid-1",
      "deviceId": "unique-device-id-12345",
      "deviceType": "ios",
      "deviceName": "iPhone 14 Pro",
      "isPrimary": true,
      "isActive": true,
      "lastActiveAt": "2025-01-14T10:30:00Z"
    },
    {
      "id": "device-uuid-2",
      "deviceId": "unique-device-id-67890",
      "deviceType": "android",
      "deviceName": "Samsung Galaxy S23",
      "isPrimary": false,
      "isActive": true,
      "lastActiveAt": "2025-01-13T15:20:00Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/devices \
  -H "Authorization: Bearer <access_token>"
```

---

## 3. Get Device by ID

**Method:** `GET`  
**URL:** `/api/devices/:id`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device retrieved successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "device-uuid",
    "userId": "user-uuid",
    "deviceId": "unique-device-id-12345",
    "deviceType": "ios",
    "deviceName": "iPhone 14 Pro",
    "deviceModel": "iPhone",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "isActive": true,
    "isPrimary": true,
    "lastActiveAt": "2025-01-14T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:9400/api/devices/device-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

## 4. Update Device

**Method:** `PUT`  
**URL:** `/api/devices/:id`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid`  
**Authentication:** Required

**Request Body:**
```json
{
  "fcmToken": "updated-firebase-token",
  "apnsToken": "updated-apple-token",
  "deviceName": "iPhone 15 Pro",
  "isPrimary": true,
  "isActive": true
}
```

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device updated successfully",
    "responseDetail": ""
  },
  "response": {
    "id": "device-uuid",
    "fcmToken": "updated-firebase-token",
    "apnsToken": "updated-apple-token",
    "deviceName": "iPhone 15 Pro",
    "isPrimary": true,
    "isActive": true
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:9400/api/devices/device-uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "updated-firebase-token",
    "isPrimary": true
  }'
```

---

## 5. Deactivate Device

**Method:** `POST`  
**URL:** `/api/devices/:id/deactivate`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid/deactivate`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device deactivated successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X POST http://localhost:9400/api/devices/device-uuid/deactivate \
  -H "Authorization: Bearer <access_token>"
```

---

## 6. Delete Device

**Method:** `DELETE`  
**URL:** `/api/devices/:id`  
**Full URL:** `http://localhost:9400/api/devices/device-uuid`  
**Authentication:** Required

**Response (200):**
```json
{
  "header": {
    "responseCode": 200,
    "responseMessage": "Device deleted successfully",
    "responseDetail": ""
  },
  "response": null
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:9400/api/devices/device-uuid \
  -H "Authorization: Bearer <access_token>"
```


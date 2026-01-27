# Payment Service Documentation

Base Service URL: `http://localhost:9404` (Direct)
Gateway URL: `http://localhost:9400/api/payments`

The Payment Service handles all payment processing using Razorpay integration. It manages orders, payment verification, and transaction history.

## Environment Variables

The following environment variables are required (already added to `.env`):

```env
# Payment Service
PAYMENT_SERVICE_PORT=9404
PAYMENT_SERVICE_URL=http://localhost:9404

# Razorpay Configuration
RAZORPAY_MERCHANT_ID=your_merchant_id
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## API Endpoints

### 1. Create Payment Order

Creates a new order in Razorpay and records the initial transaction in the database.

- **URL**: `/api/payments/orders`
- **Method**: `POST`
- **Auth Required**: No (Public for customers)
- **Body Parameters**:

| Parameter       | Type   | Required | Description                                 |
| --------------- | ------ | -------- | ------------------------------------------- |
| `amount`        | number | Yes      | Amount in major unit (e.g. 500 for ₹500.00) |
| `currency`      | string | No       | Currency code (default: "INR")              |
| `receipt`       | string | No       | Internal receipt ID if any                  |
| `customerName`  | string | No       | Name of the customer                        |
| `customerEmail` | string | No       | Email of the customer                       |
| `customerPhone` | string | No       | Phone number of the customer                |
| `notes`         | object | No       | Any additional metadata (key-value pairs)   |

- **Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_EKwxwAgItmmXdp",
      "entity": "order",
      "amount": 50000,
      "amount_paid": 0,
      "amount_due": 50000,
      "currency": "INR",
      "receipt": "rcpt_1",
      "status": "created",
      "attempts": 0,
      "notes": [],
      "created_at": 1582628071
    },
    "payment": {
      "id": "uuid-v4-string",
      "orderId": "order_EKwxwAgItmmXdp",
      "amount": "500.00",
      "status": "created",
      ...
    },
    "keyId": "rzp_live_..."
  },
  "message": "Order created successfully"
}
```

### 2. Verify Payment

Verifies the payment signature returned by Razorpay Checkout after a successful payment.

- **URL**: `/api/payments/verify`
- **Method**: `POST`
- **Auth Required**: No
- **Body Parameters**:

| Parameter             | Type   | Required | Description                              |
| --------------------- | ------ | -------- | ---------------------------------------- |
| `razorpay_order_id`   | string | Yes      | Order ID returned from create order API  |
| `razorpay_payment_id` | string | Yes      | Payment ID returned by Razorpay Checkout |
| `razorpay_signature`  | string | Yes      | Signature returned by Razorpay Checkout  |

- **Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Payment verified successfully"
  },
  "message": "Payment verified successfully"
}
```

- **Error Response** (500 Internal Server Error):

```json
{
  "success": false,
  "message": "Invalid signature",
  "error": "Invalid signature"
}
```

## Data Models

### Payment Model

The `Payment` model stores transaction details in the database.

- **id**: UUID (Primary Key)
- **orderId**: String (Razorpay Order ID, Unique)
- **paymentId**: String (Razorpay Payment ID, nullable until paid)
- **signature**: String (Verification signature, nullable until paid)
- **amount**: Decimal (Amount in major units)
- **currency**: String (Default: 'INR')
- **status**: Enum ('created', 'paid', 'failed')
- **customerName**: String
- **customerEmail**: String
- **customerPhone**: String
- **notes**: JSONB (Metadata)

# Diagnostic Test Booking Backend

A simple backend for diagnostic centre test bookings, built with **Next.js, MongoDB, Mongoose, and JWT authentication**.

## Tech Stack

- Next.js
- JavaScript
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- REST APIs

## Features

- User signup and login
- JWT authentication
- Admin and user roles
- Diagnostic centres
- Diagnostic tests
- Centre-specific test pricing
- Test bookings
- Booking cancellation
- Simulated payments
- Payment webhook
- Webhook idempotency
- Authorization and validation

---

# Setup

## 1. Clone the project

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <PROJECT_FOLDER>
```

## 2. Install dependencies

```bash
npm install
```

---

# 3. MongoDB Setup

The project uses MongoDB.

You can use either **MongoDB Atlas (recommended)** or a local MongoDB installation.

### Option A — MongoDB Atlas

1. Go to MongoDB Atlas:
   https://www.mongodb.com/atlas

2. Create a free account and create a free cluster.

3. Create a database user:
   - Go to **Security → Database Access**
   - Create a username and password.

4. Allow your IP:
   - Go to **Security → Network Access**
   - Add your current IP address.
   - For local development, you can temporarily use `0.0.0.0/0`.

5. Get your connection string:
   - Open your cluster
   - Click **Connect**
   - Select **Drivers**
   - Select **Node.js**
   - Copy the connection string (Legacy URI String)

It will look similar to:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/diagnostic_booking
```

Replace:

```text
USERNAME
PASSWORD
```

with the database user's credentials.

You can also specify your database name:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/diagnostic_booking
```

The database and collections will be created automatically when the application stores data.

### Important

If your MongoDB password contains special characters such as:

```text
@ # $ % & /
```

URL-encode the password before putting it inside the connection string.

For example:

```text
my@password
```

becomes:

```text
my%40password
```

---

# 4. Environment Variables

Create a file named:

```text
.env.local
```

in the root of the project.

Add:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/diagnostic_booking
JWT_SECRET=your_long_random_secret
```

Example:

```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster.mongodb.net/diagnostic_booking
JWT_SECRET=my-super-secret-jwt-key-123
```

### Important

Do **not** commit `.env.local` to GitHub.

It is already included in `.gitignore`.

---

# 5. Run the Project

Start the development server:

```bash
npm run dev
```

The server will run at:

```text
http://localhost:3000
```

You can test the database connection using:

```text
GET http://localhost:3000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Database connected successfully"
}
```

---

# API Overview

## Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

## Diagnostic Centres

```text
GET  /api/centres
POST /api/centres
```

## Diagnostic Tests

```text
GET  /api/tests
POST /api/tests
```

## Centre Tests

```text
GET  /api/centres/:id/tests
POST /api/centres/:id/tests
```

## Bookings

```text
POST  /api/bookings
GET   /api/bookings
GET   /api/bookings/:id
PATCH /api/bookings/:id
```

## Payments

```text
POST /api/payments
POST /api/payments/webhook
```

---

# Authentication

Protected APIs require a JWT token.

Add the token to the request header:

```text
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Example:

```text
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

---

# Basic Flow

```text
Signup
  ↓
Login
  ↓
Get JWT Token
  ↓
Admin creates Centre
  ↓
Admin creates Test
  ↓
Admin assigns Test + Price to Centre
  ↓
User creates Booking
  ↓
Payment
  ↓
Booking becomes CONFIRMED / FAILED
  ↓
Payment Webhook
```

---

# Payment Webhook

The payment webhook is simulated.

Example request:

```json
{
  "eventId": "evt_001",
  "transactionId": "txn_123",
  "status": "SUCCESS"
}
```

The `eventId` is stored to prevent the same webhook from being processed multiple times.

---

# Project Structure

```text
app/
├── api/
│   ├── auth/
│   ├── centres/
│   ├── tests/
│   ├── bookings/
│   ├── payments/
│   └── health/
│
lib/
├── auth.js
└── db.js
│
models/
├── User.js
├── DiagnosticCentre.js
├── DiagnosticTest.js
├── CentreTest.js
├── Booking.js
├── Payment.js
└── WebhookEvent.js
│
.env.local
.gitignore
package.json
README.md
```

---

# Notes

- MongoDB Atlas is recommended for development.
- Payment processing is simulated; no real payment gateway is used.
- JWT tokens expire after 1 day.
- Payment amount is calculated from the centre's configured test price.
- Users can only access their own bookings.
- Admin APIs require an admin account.
- Duplicate webhook events are safely ignored.
# Find Username Feature Usage Guide

This document provides instructions on how to use the find username feature in the Cashpop API.

## Overview

The find username flow consists of two steps:

1. **Initiate Find Username**: User provides their email address to request their username
2. **Verify OTP**: User receives an OTP via email, submits it for verification, and receives their username

## API Endpoints

### 1. Initiate Find Username

```http
POST /auth/find-username-initiate
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Find username email sent"
}
```

**Possible Errors:**
- 404 Not Found: User not found
- 400 Bad Request: OTP already sent

### 2. Verify OTP and Get Username

```http
POST /auth/find-username-verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "message": "Username found successfully",
  "verified": true,
  "username": "johndoe"
}
```

**Possible Errors:**
- 404 Not Found: User not found
- 400 Bad Request: Invalid or expired OTP

## Notes

- The OTP expires after 5 minutes
- This feature is useful when users remember their email but have forgotten their username
- The flow is similar to the password reset flow but returns the username instead of allowing a password reset
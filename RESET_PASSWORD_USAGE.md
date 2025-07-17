# Password Reset Feature Usage Guide

This document provides instructions on how to use the password reset feature in the Cashpop API.

## Overview

The password reset flow consists of three steps:

1. **Initiate Password Reset**: User provides their email address to request a password reset
2. **Verify OTP**: User receives an OTP via email and submits it for verification
3. **Reset Password**: User submits a new password after OTP verification

## API Endpoints

### 1. Initiate Password Reset

```http
POST /auth/reset-password-initiate
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent"
}
```

**Possible Errors:**
- 404 Not Found: User not found
- 400 Bad Request: OTP already sent or Facebook user

### 2. Verify OTP

```http
POST /auth/reset-password-verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "message": "OTP verified successfully",
  "verified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Possible Errors:**
- 404 Not Found: User not found
- 400 Bad Request: Invalid or expired OTP

### 3. Reset Password

```http
POST /auth/reset-password-submit
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "NewStrongP@ssw0rd",
  "passwordConfirm": "NewStrongP@ssw0rd",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

**Possible Errors:**
- 404 Not Found: User not found
- 400 Bad Request: Facebook user cannot reset password
- 401 Unauthorized: Invalid or expired verification token
- 400 Bad Request: Passwords do not match or password does not meet requirements

## Notes

- The OTP expires after 5 minutes
- The verification token expires after 15 minutes
- Facebook users cannot reset their password and should use Facebook login instead
- Password requirements:
  - At least 8 characters long
  - Contains at least 1 uppercase letter
  - Contains at least 1 lowercase letter
  - Contains at least 1 number or special character
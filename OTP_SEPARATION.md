# OTP Separation for Registration and Password Reset

## Overview

This document explains the implementation of separate OTP (One-Time Password) storage for registration and password reset flows in the CashPop backend.

## Problem

Previously, both the registration and password reset flows shared the same Valkey (Redis) key for storing OTPs, which could lead to conflicts if a user initiated both processes simultaneously. For example, if a user started the registration process and then initiated a password reset for the same email before completing registration, the second OTP would overwrite the first one.

## Solution

We've modified the system to store OTPs for registration and password reset separately by:

1. Adding an `OtpType` enum to differentiate between registration and password reset OTPs
2. Updating the Valkey service to include the OTP type in the key
3. Updating the auth service methods to use the appropriate OTP type

## Implementation Details

### 1. OtpType Enum

Added an enum to the ValkeyService to define the different types of OTPs:

```typescript
export enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset'
}
```

### 2. Updated ValkeyService Methods

Modified the ValkeyService methods to accept an OTP type parameter:

```typescript
async storeOtp(email: string, otp: string, type: OtpType = OtpType.REGISTRATION): Promise<void> {
  const key = this.getOtpKey(email, type);
  // ...
}

async getOtp(email: string, type: OtpType = OtpType.REGISTRATION): Promise<{ otp: string; timestamp: number } | null> {
  const key = this.getOtpKey(email, type);
  // ...
}

async deleteOtp(email: string, type: OtpType = OtpType.REGISTRATION): Promise<void> {
  const key = this.getOtpKey(email, type);
  // ...
}

private getOtpKey(email: string, type: OtpType = OtpType.REGISTRATION): string {
  return `otp:${type}:${email}`;
}
```

### 3. Updated AuthService Methods

Updated the auth service methods to use the appropriate OTP type:

- `initiateEmailVerification` and `verifyEmailOtp` now use `OtpType.REGISTRATION`
- `initiatePasswordReset` and `verifyPasswordResetOtp` now use `OtpType.PASSWORD_RESET`

## Benefits

This implementation ensures that:

1. OTPs for registration and password reset are stored separately
2. Users can initiate both processes simultaneously without conflicts
3. Each flow has its own independent OTP lifecycle

## Testing

To verify the implementation, test both flows independently and simultaneously:

1. Test registration flow
2. Test password reset flow
3. Test both flows simultaneously with the same email address

The OTPs should be stored separately and not interfere with each other.
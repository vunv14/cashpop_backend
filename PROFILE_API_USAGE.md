# User Profile API Documentation

This document provides information on how to use the newly implemented User Profile API endpoints.

## Overview

The User Profile API allows users to:
1. Update their profile information
2. Retrieve their profile information

All endpoints require authentication using a JWT token.

## API Endpoints

### 1. Update User Profile

Updates the authenticated user's profile information.

- **URL**: `/users/profile`
- **Method**: `PATCH`
- **Auth Required**: Yes (JWT Token)
- **Content-Type**: `application/json`

**Request Body**:

All fields are optional. Only the fields that are provided will be updated.

```json
{
  "avatar": "https://example.com/avatar.jpg",
  "name": "John Doe",
  "height": 175.5,
  "weight": 70.5,
  "sex": "male",
  "dateOfBirth": "1990-01-01",
  "residentialArea": "New York City"
}
```

**Field Constraints**:
- `avatar`: Must be a valid URL
- `name`: String, maximum 50 characters
- `height`: Number (float)
- `weight`: Number (float)
- `sex`: String, must be one of: "male", "female", "other"
- `dateOfBirth`: Date in ISO format (YYYY-MM-DD)
- `residentialArea`: String

**Success Response**:
- **Code**: 200 OK
- **Content**:

```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "height": 175.5,
  "weight": 70.5,
  "sex": "male",
  "dateOfBirth": "1990-01-01",
  "residentialArea": "New York City",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- **Code**: 401 Unauthorized
  - **Content**: `{ "message": "Unauthorized" }`
- **Code**: 404 Not Found
  - **Content**: `{ "message": "User not found" }`
- **Code**: 400 Bad Request
  - **Content**: Validation errors

### 2. Get User Profile

Retrieves the authenticated user's profile information.

- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token)

**Success Response**:
- **Code**: 200 OK
- **Content**:

```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "height": 175.5,
  "weight": 70.5,
  "sex": "male",
  "dateOfBirth": "1990-01-01",
  "residentialArea": "New York City",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- **Code**: 401 Unauthorized
  - **Content**: `{ "message": "Unauthorized" }`
- **Code**: 404 Not Found
  - **Content**: `{ "message": "User not found" }`

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token can be obtained by logging in through the authentication endpoints.

## Examples

### Update Profile Example

```bash
curl -X PATCH http://localhost:3000/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "John Doe",
    "height": 175.5,
    "weight": 70.5,
    "sex": "male"
  }'
```

### Get Profile Example

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your_token>"
```
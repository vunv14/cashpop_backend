# Avatar Upload API Documentation

This document provides information on how to upload avatar images as part of the profile update API.

## Overview

Avatar uploads are now integrated into the profile update API, allowing users to:
1. Upload an image file to be used as their profile avatar as part of profile updates
2. The image is stored in AWS S3
3. The user's profile is automatically updated with the new avatar URL

## API Endpoint

### Update Profile with Avatar

Updates the user's profile information and optionally uploads a new avatar image.

- **URL**: `/users/profile`
- **Method**: `PATCH`
- **Auth Required**: Yes (JWT Token)
- **Content-Type**: `multipart/form-data`

**Request Body**:

The request can include a file in the `file` field of the form data, along with other profile fields.

```
FormData:
  file: [binary image data] (optional)
  name: "John Doe" (optional)
  height: 175.5 (optional)
  weight: 70.5 (optional)
  sex: "male" (optional)
  dateOfBirth: "1990-01-01" (optional)
  residentialArea: "New York City" (optional)
```

**File Constraints**:
- **Maximum Size**: 5MB
- **Allowed File Types**: jpg, jpeg, png, gif, webp
- **Required**: No (avatar upload is optional)

**Success Response**:
- **Code**: 200 OK
- **Content**: The user's updated profile information

```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://your-s3-bucket.s3.amazonaws.com/avatars/12345-uuid.jpg",
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
- **Code**: 400 Bad Request
  - **Content**: `{ "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp" }`
  - **Content**: `{ "message": "File too large. Maximum size: 5MB" }`
- **Code**: 401 Unauthorized
  - **Content**: `{ "message": "Unauthorized" }`
- **Code**: 404 Not Found
  - **Content**: `{ "message": "User not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Failed to upload file" }`

## Authentication

The endpoint requires a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token can be obtained by logging in through the authentication endpoints.

## Example

### Update Profile with Avatar Example

Using curl:

```bash
# Update profile with avatar
curl -X PATCH http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@/path/to/your/avatar.jpg" \
  -F "name=John Doe" \
  -F "height=175.5"

# Update profile without avatar
curl -X PATCH http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "height": 175.5}'
```

Using JavaScript (browser):

```javascript
// Update profile with avatar
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]');
if (fileInput.files[0]) {
  formData.append('file', fileInput.files[0]);
}
formData.append('name', 'John Doe');
formData.append('height', 175.5);

fetch('http://localhost:3000/users/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <your_token>'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Update profile without avatar
fetch('http://localhost:3000/users/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <your_token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    height: 175.5
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Environment Configuration

To use this API, the following environment variables must be set:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_S3_BASE_URL=https://your_bucket_name.s3.amazonaws.com
```

These variables should be set in your environment or in a `.env` file at the root of the project.
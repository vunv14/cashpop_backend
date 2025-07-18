# CashPop Backend

A NestJS backend service with PostgreSQL, PassportJS, and Swagger.

## Features

- User authentication (register, login, logout)
- Password reset with email verification
- Find username with email verification
- JWT access and refresh tokens
- Facebook social login
- RESTful API with Swagger documentation
- PostgreSQL database integration
- Deployment configuration for Render

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- Facebook Developer Account (for Facebook login)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

4. Update the values in the `.env` file with your own configuration:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=cashpop
DB_SSL=false

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Facebook Authentication
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

> **Note:** Make sure to change the JWT secret keys and add your Facebook credentials for production environments.

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Authentication Endpoints

### Register

```
POST /auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

### Login

```
POST /auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

### Refresh Token

```
POST /auth/refresh
```

Include the refresh token in the Authorization header:
```
Authorization: Bearer your-refresh-token
```

### Logout

```
POST /auth/logout
```

Include the access token in the Authorization header:
```
Authorization: Bearer your-access-token
```

### Facebook Login

```
POST /auth/facebook
```

Request body:
```json
{
  "token": "facebook-access-token"
}
```

### Password Reset

The password reset flow consists of three steps:

1. Initiate password reset:
```
POST /auth/reset-password-initiate
```

2. Verify OTP:
```
POST /auth/reset-password-verify-otp
```

3. Reset password:
```
POST /auth/reset-password-submit
```

For detailed information about the password reset flow, request/response examples, and error handling, see [RESET_PASSWORD_USAGE.md](RESET_PASSWORD_USAGE.md).

### Find Username

The find username flow consists of two steps:

1. Initiate find username:
```
POST /auth/find-username-initiate
```

2. Verify OTP and get username:
```
POST /auth/find-username-verify-otp
```

This flow is similar to the password reset flow, but instead of resetting the password, it returns the username associated with the email address after successful OTP verification.

For detailed information about the find username flow, request/response examples, and error handling, see [FIND_USERNAME_USAGE.md](FIND_USERNAME_USAGE.md).

## Deployment

This project includes a `render.yaml` file for easy deployment on Render. To deploy:

1. Push your code to a Git repository
2. Connect your repository to Render
3. Render will automatically detect the configuration and set up the services

You'll need to manually set the `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` environment variables in the Render dashboard.

## License

MIT

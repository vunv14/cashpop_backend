# Health Data API Documentation

This document provides information about the Health Data API endpoints for mobile client integration.

## Overview

The Health Data API allows mobile applications to:
1. Submit health data collected from iOS and Android health APIs with device attestation
2. Retrieve statistics by date, week, and month
3. Get real-time accumulated data for today
4. Obtain attestation nonces for secure device verification

All endpoints require authentication with a JWT token.

## Security Requirements

To ensure the integrity and authenticity of health data submissions, the API implements device attestation:

1. **Device Attestation**: All health data submissions must include a valid attestation token from:
   - **Android**: Play Integrity API
   - **iOS**: App Attest

2. **Nonce Challenge System**: Before submitting health data, clients must:
   - Request a one-time nonce from the server
   - Include this nonce when generating the attestation
   - Submit the attestation along with the health data

3. **One-Time Use**: Each nonce can only be used once and expires after 5 minutes.

4. **Plausibility Checks**: The API validates health data for statistically implausible values.

## Authentication

All requests must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Get Attestation Nonce

**Endpoint:** `GET /health/attestation-nonce`

**Description:** Get a new attestation nonce for device integrity verification. This nonce must be used when generating an attestation token with the platform's attestation API.

**Response:**
```json
{
  "nonce": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "expiresAt": "2025-07-25T00:29:30.000Z"
}
```

**Fields:**
- `nonce`: The nonce value to be used for attestation
- `expiresAt`: The expiration time of the nonce in ISO format

**Notes:**
- Each nonce can only be used once
- Nonces expire after 5 minutes
- A new nonce should be requested before each health data submission

### Submit Health Data

**Endpoint:** `POST /health`

**Description:** Submit health data collected from mobile device health APIs with device attestation.

**Request Body:**
```json
{
  "nonce": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "attestationToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ...",
  "platform": "android",
  "steps": 8500,
  "duration": 3600,
  "calories": 350.5,
  "distance": 5200.75,
  "source": "android_health",
  "date": "2025-07-24"
}
```

**Fields:**
- `nonce` (required): The nonce value that was used for attestation
- `attestationToken` (required): The attestation token from Play Integrity API (Android) or assertion from App Attest (iOS)
- `platform` (required): The source platform of the attestation (android or ios)
- `steps` (required): Number of steps taken
- `duration` (required): Total duration of activity in seconds
- `calories` (required): Total calories burned
- `distance` (required): Total distance covered in meters
- `source` (required): Source of the health data (e.g., 'ios_health', 'android_health')
- `date` (optional): The date of the health data (YYYY-MM-DD), defaults to today

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2025-07-24",
  "steps": 8500,
  "duration": 3600,
  "calories": 350.5,
  "distance": 5200.75,
  "source": "ios_health",
  "createdAt": "2025-07-24T21:45:30.000Z",
  "updatedAt": "2025-07-24T21:45:30.000Z"
}
```

### Get Health Statistics

**Endpoint:** `GET /health/statistics`

**Description:** Get health statistics for a user within a date range, aggregated by period.

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD), defaults to today
- `endDate` (optional): End date (YYYY-MM-DD), defaults to today
- `period` (optional): Aggregation period ('day', 'week', 'month'), defaults to 'day'

**Example Request:**
```
GET /health/statistics?startDate=2025-07-01&endDate=2025-07-24&period=week
```

**Response:**
```json
{
  "items": [
    {
      "date": "2025-W27",
      "steps": 59500,
      "duration": 25200,
      "calories": 2453.5,
      "distance": 36405.25
    },
    {
      "date": "2025-W28",
      "steps": 63200,
      "duration": 27000,
      "calories": 2610.8,
      "distance": 38752.5
    },
    {
      "date": "2025-W29",
      "steps": 61800,
      "duration": 26400,
      "calories": 2552.7,
      "distance": 37698.0
    },
    {
      "date": "2025-W30",
      "steps": 42500,
      "duration": 18000,
      "calories": 1755.0,
      "distance": 25925.0
    }
  ],
  "summary": {
    "date": "2025-07-01 to 2025-07-24",
    "steps": 227000,
    "duration": 96600,
    "calories": 9372.0,
    "distance": 138780.75
  }
}
```

### Get Today's Health Data

**Endpoint:** `GET /health/today`

**Description:** Get today's accumulated health data.

**Response:**
```json
{
  "date": "2025-07-24",
  "steps": 8500,
  "duration": 3600,
  "calories": 350.5,
  "distance": 5200.75,
  "lastUpdated": "2025-07-24T21:45:30.000Z"
}
```

## Data Aggregation

- **Daily Statistics:** Each day's data is shown individually
- **Weekly Statistics:** Data is aggregated by ISO week (e.g., "2025-W30")
- **Monthly Statistics:** Data is aggregated by month (e.g., "2025-07")

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or attestation
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a message describing the error:

```json
{
  "statusCode": 400,
  "message": "Steps must be a positive number",
  "error": "Bad Request"
}
```

### Attestation-Related Errors

The following errors may occur during the attestation process:

- `400 Bad Request`: 
  - "Invalid nonce" - The nonce doesn't exist
  - "Nonce has already been used" - The nonce was already used for a previous request
  - "Nonce has expired" - The nonce has expired (after 5 minutes)
  - "Unsupported platform" - The platform value is not 'android' or 'ios'
  - "Step count is implausibly high" - The step count exceeds plausible limits
  - "Calorie count is implausibly high" - The calorie count exceeds plausible limits
  - "Distance is implausibly high" - The distance exceeds plausible limits
  - "Duration is implausibly high" - The duration exceeds plausible limits

- `401 Unauthorized`:
  - "Attestation verification failed" - The attestation token couldn't be verified

## Mobile Client Implementation Guidelines

### iOS Implementation

For iOS, use HealthKit to collect the health data:

```swift
import HealthKit

// Request authorization
let healthStore = HKHealthStore()
let typesToRead: Set<HKObjectType> = [
    HKObjectType.quantityType(forIdentifier: .stepCount)!,
    HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
    HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!,
    HKObjectType.quantityType(forIdentifier: .appleExerciseTime)!
]

healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
    // Handle authorization
}

// Query health data
let stepsType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
let query = HKStatisticsQuery(quantityType: stepsType, quantitySamplePredicate: predicate, options: .cumulativeSum) { query, result, error in
    if let result = result, let sum = result.sumQuantity() {
        let steps = sum.doubleValue(for: HKUnit.count())
        // Send to backend
    }
}
healthStore.execute(query)
```

### Android Implementation

For Android, use Google Fit API to collect the health data:

```kotlin
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.data.DataType
import com.google.android.gms.fitness.request.DataReadRequest

// Request permissions
val fitnessOptions = FitnessOptions.builder()
    .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
    .addDataType(DataType.TYPE_CALORIES_EXPENDED, FitnessOptions.ACCESS_READ)
    .addDataType(DataType.TYPE_DISTANCE_DELTA, FitnessOptions.ACCESS_READ)
    .addDataType(DataType.TYPE_MOVE_MINUTES, FitnessOptions.ACCESS_READ)
    .build()

// Check if permissions are granted
if (!GoogleSignIn.hasPermissions(GoogleSignIn.getLastSignedInAccount(this), fitnessOptions)) {
    GoogleSignIn.requestPermissions(
        this,
        GOOGLE_FIT_PERMISSIONS_REQUEST_CODE,
        GoogleSignIn.getLastSignedInAccount(this),
        fitnessOptions
    )
}

// Read data
val readRequest = DataReadRequest.Builder()
    .aggregate(DataType.TYPE_STEP_COUNT_DELTA, DataType.AGGREGATE_STEP_COUNT_DELTA)
    .aggregate(DataType.TYPE_CALORIES_EXPENDED, DataType.AGGREGATE_CALORIES_EXPENDED)
    .aggregate(DataType.TYPE_DISTANCE_DELTA, DataType.AGGREGATE_DISTANCE_DELTA)
    .aggregate(DataType.TYPE_MOVE_MINUTES, DataType.AGGREGATE_MOVE_MINUTES)
    .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
    .bucketByTime(1, TimeUnit.DAYS)
    .build()

Fitness.getHistoryClient(this, GoogleSignIn.getLastSignedInAccount(this)!!)
    .readData(readRequest)
    .addOnSuccessListener { response ->
        // Process data and send to backend
    }
```

### Device Attestation Implementation

#### Android Attestation with Play Integrity API

For Android, use the Play Integrity API to generate attestation tokens:

```kotlin
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest

// Request a nonce from your backend first
val nonce = fetchNonceFromBackend()

// Initialize the integrity manager
val integrityManager = IntegrityManagerFactory.create(context)

// Prepare the integrity token request with the nonce
val integrityTokenRequest = IntegrityTokenRequest.builder()
    .setNonce(nonce)
    .build()

// Request the integrity token
integrityManager.requestIntegrityToken(integrityTokenRequest)
    .addOnSuccessListener { integrityTokenResponse ->
        // Get the token
        val token = integrityTokenResponse.token()
        
        // Use this token when submitting health data
        submitHealthDataWithAttestation(nonce, token, "android", healthData)
    }
    .addOnFailureListener { e ->
        // Handle error
    }
```

#### iOS Attestation with App Attest

For iOS, use the App Attest API to generate attestation assertions:

```swift
import DeviceCheck
import CryptoKit

// Check if App Attest is supported
guard DCAppAttestService.shared.isSupported else {
    // App Attest is not supported on this device
    return
}

// Generate a key
let keyId = UUID().uuidString
DCAppAttestService.shared.generateKey(keyId) { error in
    guard error == nil else {
        // Handle error
        return
    }
    
    // Request a nonce from your backend
    fetchNonceFromBackend { nonce in
        // Create attestation data with the nonce
        let challenge = Data(nonce.utf8)
        
        // Generate an attestation
        DCAppAttestService.shared.attestKey(keyId, clientDataHash: SHA256.hash(data: challenge)) { attestationObject, error in
            guard let attestation = attestationObject, error == nil else {
                // Handle error
                return
            }
            
            // Convert attestation to base64 string
            let attestationString = attestation.base64EncodedString()
            
            // Use this attestation when submitting health data
            submitHealthDataWithAttestation(nonce, attestationString, "ios", healthData)
        }
    }
}
```

### Sending Data to Backend with Attestation

Both iOS and Android clients should follow this process to securely submit health data:

1. Request a nonce from the server using `GET /health/attestation-nonce`
2. Use the nonce to generate an attestation token with the platform's attestation API
3. Collect health data from the respective health API
4. Submit the health data along with the nonce and attestation token

Example implementation:

```javascript
// Step 1: Request a nonce
async function getAttestationNonce(authToken) {
  const response = await fetch('https://api.example.com/health/attestation-nonce', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Step 2 & 3: Generate attestation and collect health data
// This is platform-specific (see Android and iOS examples above)

// Step 4: Submit health data with attestation
async function submitHealthDataWithAttestation(authToken, nonce, attestationToken, platform, healthData) {
  try {
    const response = await fetch('https://api.example.com/health', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        nonce: nonce,
        attestationToken: attestationToken,
        platform: platform,
        ...healthData
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending health data:', error);
    // Implement retry logic
  }
}
```
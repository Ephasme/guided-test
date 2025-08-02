# Bruno API Collection

This Bruno collection contains API requests for testing the Guided Weather API backend.

## Setup

1. **Open the Collection**: In Bruno, click "Open Collection" and navigate to this directory
2. **Select Environment**: Choose "local" from the environment dropdown
3. **Update Variables**: Edit the environment variables in `environments/local.bru`:
   - `host`: Your backend URL (default: http://localhost:3000)
   - `sessionId`: A valid session ID for authenticated requests
   - `authCode`: OAuth authorization code (for testing OAuth flow)
   - `state`: OAuth state parameter

## API Endpoints

### Weather API (`/weather`)

#### Get Weather

- **File**: `Weather API/Get Weather.bru`
- **Method**: GET
- **Parameters**:
  - `query`: Natural language weather query
  - `clientIP`: Client IP address
  - `sessionId`: (Optional) Session ID for calendar integration
- **Description**: Get weather information with optional calendar integration

#### Get Weather - Simple

- **File**: `Weather API/Get Weather - Simple.bru`
- **Method**: GET
- **Parameters**:
  - `query`: Natural language weather query
  - `clientIP`: Client IP address
- **Description**: Basic weather query without calendar integration

### Auth API (`/auth`)

#### OAuth Callback

- **File**: `Auth API/OAuth Callback.bru`
- **Method**: GET
- **Parameters**:
  - `code`: OAuth authorization code
  - `state`: OAuth state parameter
- **Description**: Handle OAuth callback from Google

#### Check Session

- **File**: `Auth API/Check Session.bru`
- **Method**: GET
- **URL**: `/auth/session/{sessionId}`
- **Description**: Check if a session has valid tokens

#### Delete Session

- **File**: `Auth API/Delete Session.bru`
- **Method**: DELETE
- **URL**: `/auth/session/{sessionId}`
- **Description**: Delete a session and remove its tokens

### SMS API (`/sms`)

#### Register SMS

- **File**: `SMS API/Register SMS.bru`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `x-session-id`: Session ID
- **Body**:
  ```json
  {
    "phoneNumber": "+33123456789",
    "clientIP": "168.220.143.250"
  }
  ```
- **Description**: Register a phone number for SMS notifications

#### Unregister SMS

- **File**: `SMS API/Unregister SMS.bru`
- **Method**: DELETE
- **Headers**:
  - `x-session-id`: Session ID
- **Description**: Unregister a phone number from SMS notifications

## Testing Workflow

1. **Start Backend**: Ensure your backend is running on `http://localhost:3000`
2. **Test Weather API**: Start with "Get Weather - Simple" to test basic functionality
3. **Test Auth Flow**: Use "Check Session" to verify session management
4. **Test SMS Registration**: Use "Register SMS" with a valid session ID
5. **Test Calendar Integration**: Use "Get Weather" with a session ID that has valid tokens

## Environment Variables

- `host`: Backend server URL
- `sessionId`: Session ID for authenticated requests
- `authCode`: OAuth authorization code (for testing OAuth flow)
- `state`: OAuth state parameter

## Notes

- All requests use the `local` environment by default
- Session ID is required for SMS and calendar integration features
- Weather API supports natural language queries
- SMS registration supports international and French phone number formats

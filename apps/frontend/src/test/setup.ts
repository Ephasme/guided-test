import "@testing-library/jest-dom";

// Set up test environment variables
process.env.VITE_GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.VITE_REDIRECT_URI = "http://localhost:3000/auth/callback";
process.env.VITE_GOOGLE_SCOPES =
  "https://www.googleapis.com/auth/calendar.readonly";
process.env.VITE_API_BASE_URL = "http://localhost:3000";

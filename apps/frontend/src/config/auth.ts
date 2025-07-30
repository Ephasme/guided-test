// Google OAuth configuration from environment variables
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || "http://localhost:3000/auth/callback";
export const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// Validate required environment variables
if (!GOOGLE_CLIENT_ID) {
  throw new Error("VITE_GOOGLE_CLIENT_ID environment variable is required");
}

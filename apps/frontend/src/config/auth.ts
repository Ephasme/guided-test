import env from "env-var";

const envConfig = env.from(import.meta.env);

export const GOOGLE_CLIENT_ID = envConfig
  .get("VITE_GOOGLE_CLIENT_ID")
  .required()
  .asString();

export const REDIRECT_URI = envConfig
  .get("VITE_REDIRECT_URI")
  .default("http://localhost:3000/auth/callback")
  .asString();

export const GOOGLE_API_SCOPES = envConfig
  .get("VITE_GOOGLE_SCOPES")
  .default("https://www.googleapis.com/auth/calendar.readonly")
  .asString()
  .split(",");

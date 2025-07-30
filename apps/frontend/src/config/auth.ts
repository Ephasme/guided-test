import envVar from "env-var";

const env = envVar.from(import.meta.env);

export const GOOGLE_CLIENT_ID = env
  .get("VITE_GOOGLE_CLIENT_ID")
  .required()
  .asString();

export const REDIRECT_URI = env
  .get("VITE_REDIRECT_URI")
  .default("http://localhost:3000/auth/callback")
  .asString();

export const GOOGLE_API_SCOPES = env
  .get("VITE_GOOGLE_SCOPES")
  .default("https://www.googleapis.com/auth/calendar.readonly")
  .asString()
  .split(",");

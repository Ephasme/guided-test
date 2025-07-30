import envVar from "env-var";

const env = envVar.from(import.meta.env);

const VITE_GOOGLE_CLIENT_ID = env
  .get("VITE_GOOGLE_CLIENT_ID")
  .required()
  .asString();
const VITE_GOOGLE_REDIRECT_URI = env
  .get("VITE_GOOGLE_REDIRECT_URI")
  .required()
  .asString();
const VITE_GOOGLE_SCOPES = env
  .get("VITE_GOOGLE_SCOPES")
  .required()
  .asString()
  .split(",");

export { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI, VITE_GOOGLE_SCOPES };

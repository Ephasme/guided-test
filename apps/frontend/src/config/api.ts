import env from "env-var";

const envConfig = env.from(import.meta.env);

export const API_BASE_URL = envConfig
  .get("VITE_API_BASE_URL")
  .default("http://localhost:3000")
  .asString();

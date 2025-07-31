import env from "env-var";

export const config = {
  server: {
    port: env.get("PORT").default("3000").asPortNumber(),
    nodeEnv: env.get("NODE_ENV").default("development").asString(),
  },
  weather: {
    apiUrl: env.get("WEATHER_API_URL").required().asString(),
    apiKey: env.get("WEATHER_API_KEY").required().asString(),
  },
  openai: {
    apiKey: env.get("OPENAI_API_KEY").required().asString(),
  },
  google: {
    clientId: env.get("GOOGLE_CLIENT_ID").required().asString(),
    clientSecret: env.get("GOOGLE_CLIENT_SECRET").required().asString(),
    redirectUri: env
      .get("GOOGLE_REDIRECT_URI")
      .default("http://localhost:3000/auth/callback")
      .asString(),
  },
  security: {
    encryptionKey: env
      .get("ENCRYPTION_KEY")
      .default("your-secret-key-32-chars-long")
      .asString(),
  },
  logging: {
    level: env.get("LOG_LEVEL").default("info").asString(),
  },
} as const;

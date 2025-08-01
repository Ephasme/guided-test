import env from "env-var";

export const config = {
  weather: {
    apiUrl: env.get("WEATHER_API_URL").required().asString(),
    apiKey: env.get("WEATHER_API_KEY").required().asString(),
  },
  google: {
    clientId: env.get("GOOGLE_CLIENT_ID").required().asString(),
    clientSecret: env.get("GOOGLE_CLIENT_SECRET").required().asString(),
  },
  openai: {
    apiKey: env.get("OPENAI_API_KEY").required().asString(),
  },
  twilio: {
    accountSid: env.get("TWILIO_ACCOUNT_SID").required().asString(),
    authToken: env.get("TWILIO_AUTH_TOKEN").required().asString(),
    messagingServiceSid: env
      .get("TWILIO_MESSAGING_SERVICE_SID")
      .required()
      .asString(),
  },
  ipapi: {
    apiKey: env.get("IPAPI_API_KEY").required().asString(),
  },
  server: {
    port: env.get("PORT").default("3000").asPortNumber(),
  },
  notification: {
    intervalMs: env
      .get("NOTIFICATION_INTERVAL_MS")
      .default("900000")
      .asIntPositive(),
  },
};

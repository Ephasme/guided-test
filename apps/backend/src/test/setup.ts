import { beforeAll, afterAll, afterEach, vi } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.OPENAI_API_KEY = "test-openai-key";
  process.env.WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
  process.env.WEATHER_API_KEY = "test-weather-key";
  process.env.IPAPI_API_KEY = "test-ipapi-key";
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
  process.env.TWILIO_ACCOUNT_SID = "test-twilio-account-sid";
  process.env.TWILIO_AUTH_TOKEN = "test-twilio-auth-token";
  process.env.TWILIO_PHONE_NUMBER = "+1234567890";
  process.env.NOTIFICATION_INTERVAL_MS = "900000";
});

afterAll(() => {
  delete process.env.NODE_ENV;
  delete process.env.OPENAI_API_KEY;
  delete process.env.WEATHER_API_URL;
  delete process.env.WEATHER_API_KEY;
  delete process.env.IPAPI_API_KEY;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_PHONE_NUMBER;
  delete process.env.NOTIFICATION_INTERVAL_MS;
});

afterEach(() => {
  vi.clearAllMocks();
});

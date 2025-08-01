import { beforeAll, afterAll, afterEach, vi } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.OPENAI_API_KEY = "test-openai-key";
  process.env.WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
  process.env.WEATHER_API_KEY = "test-weather-key";
  process.env.IPAPI_API_KEY = "test-ipapi-key";
});

afterAll(() => {
  delete process.env.NODE_ENV;
  delete process.env.OPENAI_API_KEY;
  delete process.env.WEATHER_API_URL;
  delete process.env.WEATHER_API_KEY;
  delete process.env.IPAPI_API_KEY;
});

afterEach(() => {
  vi.clearAllMocks();
});

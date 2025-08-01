import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWeatherData } from "../../services/fetchWeatherData";
import { WeatherAPIQuery } from "../../types/WeatherAPIQuerySchema";

vi.mock("env-var", () => ({
  default: {
    get: vi.fn((key: string) => ({
      required: () => ({
        asString: () => {
          if (key === "WEATHER_API_URL")
            return "https://api.weatherapi.com/v1/current.json";
          if (key === "WEATHER_API_KEY") return "test-api-key";
          return "test-value";
        },
      }),
      default: (value: string) => ({
        asString: () => {
          if (key === "WEATHER_API_URL")
            return "https://api.weatherapi.com/v1/current.json";
          if (key === "WEATHER_API_KEY") return "test-api-key";
          return value || "test-value";
        },
        asPortNumber: () => {
          if (key === "PORT") return 3000;
          return 3000;
        },
        asIntPositive: () => {
          if (key === "NOTIFICATION_INTERVAL_MS") return 900000;
          return 900000;
        },
      }),
    })),
  },
}));

describe("fetchWeatherData", () => {
  const mockQuery: WeatherAPIQuery = {
    q: "London",
    days: 3,
    alerts: "yes",
    aqi: "yes",
    lang: "en",
  };

  const mockWeatherResponse = {
    location: {
      name: "London",
      region: "City of London, Greater London",
      country: "United Kingdom",
      lat: 51.52,
      lon: -0.11,
      tz_id: "Europe/London",
      localtime_epoch: 1704067200,
      localtime: "2024-01-01 12:00",
    },
    current: {
      last_updated_epoch: 1704067200,
      last_updated: "2024-01-01 12:00",
      temp_c: 15.0,
      temp_f: 59.0,
      is_day: 1,
      condition: {
        text: "Partly cloudy",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
        code: 1003,
      },
      wind_mph: 10.0,
      wind_kph: 16.1,
      wind_degree: 280,
      wind_dir: "W",
      pressure_mb: 1013.0,
      pressure_in: 29.91,
      precip_mm: 0.0,
      precip_in: 0.0,
      humidity: 65,
      cloud: 25,
      feelslike_c: 14.0,
      feelslike_f: 57.2,
      vis_km: 10.0,
      vis_miles: 6.0,
      uv: 3.0,
      gust_mph: 15.0,
      gust_kph: 24.1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should fetch weather data successfully", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherResponse,
    } as Response);

    const result = await fetchWeatherData(mockQuery);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.weatherapi.com/v1/current.json?key=test-api-key&q=London&days=3&alerts=yes&aqi=yes&lang=en"
    );
    expect(result).toEqual(mockWeatherResponse);
  });

  it("should handle optional parameters correctly", async () => {
    const queryWithOptionalParams: WeatherAPIQuery = {
      q: "Paris",
      days: 1,
      dt: "2024-01-01",
      hour: 12,
    };

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherResponse,
    } as Response);

    await fetchWeatherData(queryWithOptionalParams);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.weatherapi.com/v1/current.json?key=test-api-key&q=Paris&days=1&alerts=yes&aqi=yes&lang=en&dt=2024-01-01&hour=12"
    );
  });

  it("should throw error when API returns non-ok status", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    } as Response);

    await expect(fetchWeatherData(mockQuery)).rejects.toThrow(
      "WeatherAPI failed with status 400"
    );
  });

  it("should throw error when response validation fails", async () => {
    const invalidResponse = {
      location: {
        name: "London",
      },
    };

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    await expect(fetchWeatherData(mockQuery)).rejects.toThrow(
      "Invalid response from WeatherAPI"
    );
  });

  it("should handle network errors", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchWeatherData(mockQuery)).rejects.toThrow("Network error");
  });
});

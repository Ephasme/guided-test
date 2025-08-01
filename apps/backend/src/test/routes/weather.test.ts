/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import weatherRoutes from "../../routes/weather";
import { WeatherResponse } from "@guided/shared";
import { CalendarServiceFactory } from "../../services/calendarServiceFactory";
import OpenAI from "openai";

vi.mock("env-var", () => ({
  default: {
    get: vi.fn((key: string) => ({
      required: () => ({
        asString: () => {
          if (key === "OPENAI_API_KEY") return "test-openai-key";
          return "test-value";
        },
      }),
      default: (value: any) => ({
        asString: () => {
          if (key === "OPENAI_API_KEY") return "test-openai-key";
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

vi.mock("../../utils/extractWeatherQuery", () => ({
  extractWeatherQueryFromUserInput: vi.fn(),
}));

vi.mock("../../utils/extractCalendarAction", () => ({
  extractCalendarActionFromUserInput: vi.fn(),
}));

vi.mock("../../utils/resolveUserLocation", () => ({
  resolveUserLocation: vi.fn(),
  getTodayForTimezone: vi.fn(),
}));

vi.mock("../../services/fetchWeatherData", () => ({
  fetchWeatherData: vi.fn(),
}));

vi.mock("../../services/humanizeWeatherInfo", () => ({
  humanizeWeatherInfo: vi.fn(),
}));

vi.mock("../../services/calendarService", () => ({
  CalendarService: vi.fn(),
}));

vi.mock("../../services/tokenService", () => ({
  TokenService: {
    getTokens: vi.fn(),
  },
}));

describe("Weather Routes", () => {
  let app: FastifyInstance;
  let mockCalendarServiceFactory: CalendarServiceFactory;
  let mockOpenAI: OpenAI;

  beforeEach(async () => {
    mockCalendarServiceFactory = {
      create: vi.fn(),
    };

    mockOpenAI = {} as OpenAI;

    app = await import("fastify").then(({ default: fastify }) => fastify());
    await app.register(weatherRoutes, {
      calendarServiceFactory: mockCalendarServiceFactory,
      openai: mockOpenAI,
    });

    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should return weather data successfully", async () => {
    const mockWeatherQuery = {
      q: "London",
      days: 3,
      alerts: "yes" as const,
      aqi: "yes" as const,
      lang: "en",
    };

    const mockWeatherData = {
      location: {
        name: "London",
        region: "City of London",
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

    const mockHumanizedResponse =
      "The weather in London is partly cloudy with a temperature of 15°C.";

    const { extractWeatherQueryFromUserInput } = await import(
      "../../utils/extractWeatherQuery"
    );
    vi.mocked(extractWeatherQueryFromUserInput).mockResolvedValue(
      mockWeatherQuery
    );

    const { resolveUserLocation, getTodayForTimezone } = await import(
      "../../utils/resolveUserLocation"
    );
    vi.mocked(resolveUserLocation).mockResolvedValue({
      city: "London",
      countryName: "United Kingdom",
      timezone: "Europe/London",
    });
    vi.mocked(getTodayForTimezone).mockReturnValue("2024-01-01");

    const { fetchWeatherData } = await import(
      "../../services/fetchWeatherData"
    );
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);

    const { extractCalendarActionFromUserInput } = await import(
      "../../utils/extractCalendarAction"
    );
    vi.mocked(extractCalendarActionFromUserInput).mockResolvedValue(undefined);

    const { humanizeWeatherInfo } = await import(
      "../../services/humanizeWeatherInfo"
    );
    vi.mocked(humanizeWeatherInfo).mockResolvedValue(mockHumanizedResponse);

    const response = await app.inject({
      method: "GET",
      url: "/?query=What is the weather in London?",
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload) as WeatherResponse;
    expect(data.location).toBe("London");
    expect(data.forecast).toBe(mockHumanizedResponse);
    expect(data.query).toBe("What is the weather in London?");
    expect(data.calendarResult).toBeUndefined();
  });

  it("should handle invalid query parameters", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(400);
    const data = JSON.parse(response.payload);
    expect(data.error).toBe("Invalid query");
  });

  it("should handle weather query extraction failure", async () => {
    const { resolveUserLocation, getTodayForTimezone } = await import(
      "../../utils/resolveUserLocation"
    );
    vi.mocked(resolveUserLocation).mockResolvedValue({
      city: "London",
      countryName: "United Kingdom",
      timezone: "Europe/London",
    });
    vi.mocked(getTodayForTimezone).mockReturnValue("2024-01-01");

    const { extractWeatherQueryFromUserInput } = await import(
      "../../utils/extractWeatherQuery"
    );
    vi.mocked(extractWeatherQueryFromUserInput).mockRejectedValue(
      new Error("OpenAI API error")
    );

    const response = await app.inject({
      method: "GET",
      url: "/?query=What is the weather?",
    });

    expect(response.statusCode).toBe(500);
  });

  it("should handle weather data fetching failure", async () => {
    const mockWeatherQuery = {
      q: "London",
      days: 3,
      alerts: "yes" as const,
      aqi: "yes" as const,
      lang: "en",
    };

    const { extractWeatherQueryFromUserInput } = await import(
      "../../utils/extractWeatherQuery"
    );
    vi.mocked(extractWeatherQueryFromUserInput).mockResolvedValue(
      mockWeatherQuery
    );

    const { resolveUserLocation, getTodayForTimezone } = await import(
      "../../utils/resolveUserLocation"
    );
    vi.mocked(resolveUserLocation).mockResolvedValue({
      city: "London",
      countryName: "United Kingdom",
      timezone: "Europe/London",
    });
    vi.mocked(getTodayForTimezone).mockReturnValue("2024-01-01");

    const { fetchWeatherData } = await import(
      "../../services/fetchWeatherData"
    );
    vi.mocked(fetchWeatherData).mockRejectedValue(
      new Error("Weather API error")
    );

    const response = await app.inject({
      method: "GET",
      url: "/?query=What is the weather?",
    });

    expect(response.statusCode).toBe(500);
  });

  it("should handle calendar action when session is available", async () => {
    const mockWeatherQuery = {
      q: "London",
      days: 3,
      alerts: "yes" as const,
      aqi: "yes" as const,
      lang: "en",
    };

    const mockWeatherData = {
      location: {
        name: "London",
        region: "City of London",
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
          text: "Sunny",
          icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
          code: 1000,
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

    const mockCalendarAction = {
      action: "create" as const,
      event: {
        summary: "Outdoor meeting",
        start: { dateTime: "2024-01-02T10:00:00Z", timeZone: "Europe/London" },
        end: { dateTime: "2024-01-02T11:00:00Z", timeZone: "Europe/London" },
      },
    };

    const mockCalendarResult = {
      success: true,
      action: "create",
      message: "Event created successfully",
    };

    const { extractWeatherQueryFromUserInput } = await import(
      "../../utils/extractWeatherQuery"
    );
    vi.mocked(extractWeatherQueryFromUserInput).mockResolvedValue(
      mockWeatherQuery
    );

    const { resolveUserLocation, getTodayForTimezone } = await import(
      "../../utils/resolveUserLocation"
    );
    vi.mocked(resolveUserLocation).mockResolvedValue({
      city: "London",
      countryName: "United Kingdom",
      timezone: "Europe/London",
    });
    vi.mocked(getTodayForTimezone).mockReturnValue("2024-01-01");

    const { fetchWeatherData } = await import(
      "../../services/fetchWeatherData"
    );
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);

    const { extractCalendarActionFromUserInput } = await import(
      "../../utils/extractCalendarAction"
    );
    vi.mocked(extractCalendarActionFromUserInput).mockResolvedValue(
      mockCalendarAction
    );

    const { humanizeWeatherInfo } = await import(
      "../../services/humanizeWeatherInfo"
    );
    vi.mocked(humanizeWeatherInfo).mockResolvedValue("Weather response");

    const { TokenService } = await import("../../services/tokenService");
    vi.mocked(TokenService.getTokens).mockReturnValue({
      access_token: "test-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
    });

    const mockCalendarService = {
      executeCalendarAction: vi.fn().mockResolvedValue(mockCalendarResult),
      oauth2Client: {},
      createEvent: vi.fn(),
      findEvents: vi.fn(),
      getEvent: vi.fn(),
    } as any;

    vi.mocked(mockCalendarServiceFactory.create).mockReturnValue(
      mockCalendarService
    );

    const response = await app.inject({
      method: "GET",
      url: "/?query=Schedule a meeting for tomorrow&sessionId=test-session",
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload) as WeatherResponse;
    expect(data.calendarResult).toEqual({
      message: "Event created successfully",
    });
  });

  it("should handle calendar action failure gracefully", async () => {
    const mockWeatherQuery = {
      q: "London",
      days: 3,
      alerts: "yes" as const,
      aqi: "yes" as const,
      lang: "en",
    };

    const mockWeatherData = {
      location: {
        name: "London",
        region: "City of London",
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
          text: "Sunny",
          icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
          code: 1000,
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

    const mockCalendarAction = {
      action: "create" as const,
      event: {
        summary: "Outdoor meeting",
        start: { dateTime: "2024-01-02T10:00:00Z", timeZone: "Europe/London" },
        end: { dateTime: "2024-01-02T11:00:00Z", timeZone: "Europe/London" },
      },
    };

    const { extractWeatherQueryFromUserInput } = await import(
      "../../utils/extractWeatherQuery"
    );
    vi.mocked(extractWeatherQueryFromUserInput).mockResolvedValue(
      mockWeatherQuery
    );

    const { resolveUserLocation, getTodayForTimezone } = await import(
      "../../utils/resolveUserLocation"
    );
    vi.mocked(resolveUserLocation).mockResolvedValue({
      city: "London",
      countryName: "United Kingdom",
      timezone: "Europe/London",
    });
    vi.mocked(getTodayForTimezone).mockReturnValue("2024-01-01");

    const { fetchWeatherData } = await import(
      "../../services/fetchWeatherData"
    );
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);

    const { extractCalendarActionFromUserInput } = await import(
      "../../utils/extractCalendarAction"
    );
    vi.mocked(extractCalendarActionFromUserInput).mockResolvedValue(
      mockCalendarAction
    );

    const { humanizeWeatherInfo } = await import(
      "../../services/humanizeWeatherInfo"
    );
    vi.mocked(humanizeWeatherInfo).mockResolvedValue("Weather response");

    const { TokenService } = await import("../../services/tokenService");
    vi.mocked(TokenService.getTokens).mockReturnValue({
      access_token: "test-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
    });

    const mockCalendarService = {
      executeCalendarAction: vi
        .fn()
        .mockRejectedValue(new Error("Calendar error")),
      oauth2Client: {},
      createEvent: vi.fn(),
      findEvents: vi.fn(),
      getEvent: vi.fn(),
    } as any;

    vi.mocked(mockCalendarServiceFactory.create).mockReturnValue(
      mockCalendarService
    );

    const response = await app.inject({
      method: "GET",
      url: "/?query=Schedule a meeting&sessionId=test-session",
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload) as WeatherResponse;
    expect(data.calendarResult).toBeUndefined();
  });
});

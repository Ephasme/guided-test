import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import weatherRoutes from "../../routes/weather";
import { CalendarServiceFactory } from "../../services/calendarServiceFactory";
import { OpenAIService } from "../../services/openaiService";
import { WeatherResponse } from "@guided/shared";
import { CalendarService } from "../../services/calendarService";
import OpenAI from "openai";

vi.mock("../../config", () => ({
  config: {
    openai: {
      apiKey: "test-api-key",
    },
  },
}));

vi.mock("../../utils/extractClientIp", () => ({
  extractClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("../../services/openaiService", () => ({
  OpenAIService: vi.fn().mockImplementation(() => ({
    runPromptWithJsonParsingOrThrow: vi.fn(),
    runPromptWithJsonParsingOrNull: vi.fn(),
  })),
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
  let mockOpenAIService: OpenAIService;

  beforeEach(async () => {
    mockCalendarServiceFactory = {
      create: vi.fn(),
    };

    const { OpenAIService } = await import("../../services/openaiService");
    mockOpenAIService = new OpenAIService({} as unknown as OpenAI);

    app = await import("fastify").then(({ default: fastify }) => fastify());
    await app.register(weatherRoutes, {
      calendarServiceFactory: mockCalendarServiceFactory,
      openaiService: mockOpenAIService,
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
        humidity: 75,
        cloud: 50,
        feelslike_c: 14.0,
        feelslike_f: 57.2,
        vis_km: 10.0,
        vis_miles: 6.0,
        uv: 2.0,
        gust_mph: 15.0,
        gust_kph: 24.1,
      },
    };

    const mockHumanizedResponse =
      "The weather in London is partly cloudy with a temperature of 15°C.";

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

    const { humanizeWeatherInfo } = await import(
      "../../services/humanizeWeatherInfo"
    );
    vi.mocked(humanizeWeatherInfo).mockResolvedValue(mockHumanizedResponse);

    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrThrow
    ).mockResolvedValue(mockWeatherQuery);
    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrNull
    ).mockResolvedValue(null);

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

    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrThrow
    ).mockRejectedValue(new Error("OpenAI API error"));

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

    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrThrow
    ).mockResolvedValue(mockWeatherQuery);

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

    const mockHumanizedResponse =
      "The weather in London is sunny with a temperature of 15°C.";

    const mockCalendarAction = {
      action: "create" as const,
      event: {
        summary: "Meeting with John",
        start: {
          dateTime: "2024-01-01T14:00:00Z",
          timeZone: "Europe/London",
        },
        end: {
          dateTime: "2024-01-01T15:00:00Z",
          timeZone: "Europe/London",
        },
      },
    };

    const mockCalendarResult = {
      message: "Event created successfully",
    };

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

    const { humanizeWeatherInfo } = await import(
      "../../services/humanizeWeatherInfo"
    );
    vi.mocked(humanizeWeatherInfo).mockResolvedValue(mockHumanizedResponse);

    const { TokenService } = await import("../../services/tokenService");
    vi.mocked(TokenService.getTokens).mockReturnValue({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
    });

    const mockCalendarService = {
      executeCalendarAction: vi.fn().mockResolvedValue(mockCalendarResult),
    };

    vi.mocked(mockCalendarServiceFactory.create).mockReturnValue(
      mockCalendarService as unknown as CalendarService
    );

    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrThrow
    ).mockResolvedValue(mockWeatherQuery);
    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrNull
    ).mockResolvedValue(mockCalendarAction);

    const response = await app.inject({
      method: "GET",
      url: "/?query=What is the weather?&sessionId=test-session",
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload) as WeatherResponse;
    expect(data.location).toBe("London");
    expect(data.forecast).toBe(mockHumanizedResponse);
    expect(data.query).toBe("What is the weather?");
    expect(data.calendarResult).toEqual({
      message: mockCalendarResult.message,
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

    const mockHumanizedResponse =
      "The weather in London is sunny with a temperature of 15°C.";

    const mockCalendarAction = {
      action: "create" as const,
      event: {
        summary: "Meeting with John",
        start: {
          dateTime: "2024-01-01T14:00:00Z",
          timeZone: "Europe/London",
        },
        end: {
          dateTime: "2024-01-01T15:00:00Z",
          timeZone: "Europe/London",
        },
      },
    };

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

    const { humanizeWeatherInfo } = await import(
      "../../services/humanizeWeatherInfo"
    );
    vi.mocked(humanizeWeatherInfo).mockResolvedValue(mockHumanizedResponse);

    const { TokenService } = await import("../../services/tokenService");
    vi.mocked(TokenService.getTokens).mockReturnValue({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
    });

    const mockCalendarService = {
      executeCalendarAction: vi
        .fn()
        .mockRejectedValue(new Error("Calendar error")),
    };

    vi.mocked(mockCalendarServiceFactory.create).mockReturnValue(
      mockCalendarService as unknown as CalendarService
    );

    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrThrow
    ).mockResolvedValue(mockWeatherQuery);
    vi.mocked(
      mockOpenAIService.runPromptWithJsonParsingOrNull
    ).mockResolvedValue(mockCalendarAction);

    const response = await app.inject({
      method: "GET",
      url: "/?query=What is the weather?&sessionId=test-session",
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload) as WeatherResponse;
    expect(data.location).toBe("London");
    expect(data.forecast).toBe(mockHumanizedResponse);
    expect(data.query).toBe("What is the weather?");
    expect(data.calendarResult).toBeUndefined();
  });
});

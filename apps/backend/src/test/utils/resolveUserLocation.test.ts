import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  resolveUserLocation,
  getTodayForTimezone,
} from "../../utils/resolveUserLocation";

vi.mock("env-var", () => ({
  default: {
    get: vi.fn((key: string) => ({
      required: () => ({
        asString: () => {
          if (key === "IPAPI_API_KEY") return "test-ipapi-key";
          return "test-value";
        },
      }),
      default: (value: string) => ({
        asString: () => {
          if (key === "IPAPI_API_KEY") return "test-ipapi-key";
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

describe("resolveUserLocation", () => {
  const mockLocationResponse = {
    ip: "192.168.1.1",
    version: "IPv4",
    city: "London",
    region: "England",
    region_code: "ENG",
    country_code: "GB",
    country_code_iso3: "GBR",
    country_name: "United Kingdom",
    country_capital: "London",
    country_tld: ".uk",
    continent_code: "EU",
    in_eu: true,
    postal: "SW1A 1AA",
    latitude: 51.5074,
    longitude: -0.1278,
    latlong: "51.5074,-0.1278",
    timezone: "Europe/London",
    utc_offset: "+0000",
    country_calling_code: "+44",
    currency: "GBP",
    currency_name: "British Pound",
    languages: "en-GB,cy-GB,gd",
    country_area: 244820.0,
    country_population: 65110000,
    asn: "AS2856",
    org: "BT Public Internet Service",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should resolve user location successfully", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLocationResponse,
    } as Response);

    const result = await resolveUserLocation("192.168.1.1");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://ipapi.co/192.168.1.1/json/?key=test-ipapi-key",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
    expect(result).toEqual({
      city: "London",
      countryName: "United Kingdom",
      timezone: "Europe/London",
    });
  });

  it("should handle rate limit errors", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    await expect(resolveUserLocation("192.168.1.1")).rejects.toThrow(
      "IP API rate limit exceeded"
    );
  });

  it("should handle authentication errors", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    await expect(resolveUserLocation("192.168.1.1")).rejects.toThrow(
      "IP API authentication failed"
    );
  });

  it("should handle invalid IP format", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    await expect(resolveUserLocation("invalid-ip")).rejects.toThrow(
      "Invalid IP address format"
    );
  });

  it("should handle timeout errors", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error("AbortError");
          error.name = "AbortError";
          reject(error);
        }, 100);
      });
    });

    await expect(resolveUserLocation("192.168.1.1")).rejects.toThrow(
      "IP location lookup timed out"
    );
  });

  it("should handle invalid response format", async () => {
    const invalidResponse = {
      city: "London",
    };

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    await expect(resolveUserLocation("192.168.1.1")).rejects.toThrow(
      "Invalid response format from IP API"
    );
  });

  it("should handle network errors", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(resolveUserLocation("192.168.1.1")).rejects.toThrow(
      "Failed to resolve user location"
    );
  });
});

describe("getTodayForTimezone", () => {
  it("should return correct date for valid timezone", () => {
    const result = getTodayForTimezone("Europe/London");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should return fallback date for invalid timezone", () => {
    const result = getTodayForTimezone("Invalid/Timezone");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

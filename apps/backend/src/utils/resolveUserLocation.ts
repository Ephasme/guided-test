import { DateTime } from "luxon";
import { z } from "zod";
import {
  AppError,
  ExternalServiceError,
  TimeoutError,
  ValidationError,
  RateLimitError,
} from "./errors";

const IPAPIResponseSchema = z.object({
  ip: z.string().optional(),
  version: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  region_code: z.string().optional(),
  country_code: z.string().optional(),
  country_code_iso3: z.string().optional(),
  country_name: z.string().min(1, "Country name is required"),
  country_capital: z.string().optional(),
  country_tld: z.string().optional(),
  continent_code: z.string().optional(),
  in_eu: z.boolean().optional(),
  postal: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  latlong: z.string().optional(),
  timezone: z.string().optional().default("UTC"),
  utc_offset: z.string().optional(),
  country_calling_code: z.string().optional(),
  currency: z.string().optional(),
  currency_name: z.string().optional(),
  languages: z.string().optional(),
  country_area: z.number().optional(),
  country_population: z.number().optional(),
  asn: z.string().optional(),
  org: z.string().optional(),
  hostname: z.string().optional(),
});

type LocationData = {
  city: string;
  countryName: string;
  timezone: string;
};

import { config } from "../config";

export async function resolveUserLocation(ip: string): Promise<LocationData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `https://ipapi.co/${ip}/json/?key=${config.ipapi.apiKey}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 429) {
        throw new RateLimitError("IP API rate limit exceeded");
      }
      if (res.status === 403) {
        throw new ExternalServiceError(
          "IP API authentication failed",
          "IP API"
        );
      }
      if (res.status === 400) {
        throw new ValidationError("Invalid IP address format");
      }
      throw new ExternalServiceError(
        `IP API failed with status ${res.status}`,
        "IP API"
      );
    }

    const rawData = await res.json();

    const validationResult = IPAPIResponseSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error(
        "IP API response validation failed:",
        validationResult.error
      );
      throw new ExternalServiceError(
        "Invalid response format from IP API",
        "IP API"
      );
    }

    const data = validationResult.data;

    return {
      city: data.city,
      countryName: data.country_name,
      timezone: data.timezone,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError("IP location lookup timed out");
    }
    console.error("Location resolution failed:", error);
    throw new ExternalServiceError(
      "Failed to resolve user location",
      "IP API",
      error instanceof Error ? error : undefined
    );
  }
}

export function getTodayForTimezone(timezone: string): string {
  try {
    const today = DateTime.now().setZone(timezone).toISODate();

    if (!today) {
      throw new Error(
        `Invalid timezone: ${timezone}. Unable to generate date.`
      );
    }

    return today;
  } catch (error) {
    console.error("Timezone conversion failed:", error);
    return DateTime.now().toISODate() || "2024-01-01";
  }
}

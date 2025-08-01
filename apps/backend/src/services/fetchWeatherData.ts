import { WeatherAPIQuery } from "../types/WeatherAPIQuerySchema";
import {
  WeatherAPIResponseSchema,
  WeatherAPIResponse,
} from "../types/WeatherAPIResponse";
import { config } from "../config";

export async function fetchWeatherData(
  query: WeatherAPIQuery
): Promise<WeatherAPIResponse> {
  const params = new URLSearchParams({
    key: config.weather.apiKey,
    q: query.q,
    days: String(query.days),
    alerts: query.alerts ?? "yes",
    aqi: query.aqi ?? "yes",
    lang: query.lang ?? "en",
  });

  if (query.dt) params.append("dt", query.dt);
  if (query.hour !== undefined) params.append("hour", String(query.hour));

  const url = `${config.weather.apiUrl}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.error("WeatherAPI error response:", body);
    throw new Error(`WeatherAPI failed with status ${res.status}`);
  }

  const rawData = await res.json();

  // Validate the response with Zod schema
  const validationResult = WeatherAPIResponseSchema.safeParse(rawData);
  if (!validationResult.success) {
    console.error(
      "WeatherAPI response validation failed:",
      validationResult.error
    );
    throw new Error("Invalid response from WeatherAPI");
  }

  return validationResult.data;
}

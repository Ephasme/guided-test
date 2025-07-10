import { WeatherAPIQuery } from "../types/WeatherAPIQuerySchema";
import { get } from "env-var";

const WEATHER_API_URL = get("WEATHER_API_URL").required().asString();
const WEATHER_API_KEY = get("WEATHER_API_KEY").required().asString();

export async function fetchWeatherData(query: WeatherAPIQuery) {
  const params = new URLSearchParams({
    key: WEATHER_API_KEY,
    q: query.q,
    days: String(query.days),
    alerts: query.alerts ?? "yes",
    aqi: query.aqi ?? "yes",
    lang: query.lang ?? "en",
  });

  if (query.dt) params.append("dt", query.dt);
  if (query.hour !== undefined) params.append("hour", String(query.hour));

  const url = `${WEATHER_API_URL}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.error("WeatherAPI error response:", body);
    throw new Error(`WeatherAPI failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}

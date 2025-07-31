import type { WeatherResponse } from "@guided/shared";
import { getPublicIP } from "../utils/getPublicIP";

export const fetchWeather = async (
  query: string,
  sessionId?: string
): Promise<WeatherResponse> => {
  try {
    const clientIP = await getPublicIP();
    const params = new URLSearchParams({
      query: query,
      clientIP: clientIP,
    });

    if (sessionId) {
      params.append("sessionId", sessionId);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `http://localhost:3000/weather?${params.toString()}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from weather API");
    }

    return data as WeatherResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Weather request timed out");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to fetch weather data");
  }
};

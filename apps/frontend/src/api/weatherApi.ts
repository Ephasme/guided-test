import type { WeatherResponse } from "@guided/shared";
import { getPublicIP } from "../utils/getPublicIP";

export const fetchWeather = async (
  query: string,
  sessionId?: string
): Promise<WeatherResponse> => {
  const clientIP = await getPublicIP();
  const params = new URLSearchParams({
    query: query,
    clientIP: clientIP,
  });

  if (sessionId) {
    params.append("sessionId", sessionId);
  }

  const response = await fetch(
    `http://localhost:3000/weather?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

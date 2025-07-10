import type { WeatherResponse } from "@guided/shared";
import { getPublicIP } from "../utils/getPublicIP";

export const fetchWeather = async (query: string): Promise<WeatherResponse> => {
  const clientIP = await getPublicIP();
  const response = await fetch(
    `http://localhost:3000/weather?query=${encodeURIComponent(
      query
    )}&clientIP=${clientIP}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

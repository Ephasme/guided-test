import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../api/weatherApi";

export const useWeatherQuery = (query: string | null, sessionId?: string) => {
  return useQuery({
    queryKey: ["weather", query, sessionId],
    queryFn: () => fetchWeather(query!, sessionId),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

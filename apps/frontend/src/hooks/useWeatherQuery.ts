import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../api/weatherApi";

export const useWeatherQuery = (query: string | null) => {
  return useQuery({
    queryKey: ["weather", query],
    queryFn: () => fetchWeather(query!),
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

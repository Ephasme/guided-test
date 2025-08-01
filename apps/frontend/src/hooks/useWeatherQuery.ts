import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../api/weatherApi";
import { usePublicIP } from "./usePublicIP";

export const useWeatherQuery = (query: string | null, sessionId?: string) => {
  const { data: clientIP } = usePublicIP();

  return useQuery({
    queryKey: ["weather", query, sessionId, clientIP],
    queryFn: () => fetchWeather(query!, clientIP!, sessionId),
    enabled: !!query && !!clientIP,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

import { useQuery } from "@tanstack/react-query";
import { getPublicIP } from "../utils/getPublicIP";

export const usePublicIP = () => {
  return useQuery({
    queryKey: ["publicIP"],
    queryFn: getPublicIP,
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

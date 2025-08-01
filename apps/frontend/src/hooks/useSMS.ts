import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSMSStatus, registerSMS, unregisterSMS } from "../api/smsApi";
import { usePublicIP } from "./usePublicIP";

export const useSMS = (sessionId: string | null) => {
  const queryClient = useQueryClient();
  const { data: clientIP } = usePublicIP();

  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ["sms", "status", sessionId],
    queryFn: () => fetchSMSStatus(sessionId!),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const registerMutation = useMutation({
    mutationFn: ({
      sessionId,
      phoneNumber,
      clientIP,
    }: {
      sessionId: string;
      phoneNumber: string;
      clientIP: string;
    }) => registerSMS(sessionId, phoneNumber, clientIP),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms", "status", sessionId] });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: (sessionId: string) => unregisterSMS(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms", "status", sessionId] });
    },
  });

  const registerSMSNotification = async (phoneNumber: string) => {
    if (!sessionId || !clientIP) return;
    await registerMutation.mutateAsync({ sessionId, phoneNumber, clientIP });
  };

  const unregisterSMSNotification = async () => {
    if (!sessionId) return;
    await unregisterMutation.mutateAsync(sessionId);
  };

  return {
    status,
    isLoadingStatus,
    statusError,
    registerSMSNotification,
    unregisterSMSNotification,
    isRegistering: registerMutation.isPending,
    isUnregistering: unregisterMutation.isPending,
    registerError: registerMutation.error,
    unregisterError: unregisterMutation.error,
  };
};

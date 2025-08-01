export interface SMSStatus {
  notificationsEnabled: boolean;
  phoneNumber?: string;
}

export const fetchSMSStatus = async (sessionId: string): Promise<SMSStatus> => {
  const response = await fetch(`http://localhost:3000/sms/status`, {
    headers: {
      "x-session-id": sessionId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch SMS status");
  }

  return response.json();
};

export const registerSMS = async (
  sessionId: string,
  phoneNumber: string,
  clientIP: string
): Promise<void> => {
  const response = await fetch(`http://localhost:3000/sms/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
    },
    body: JSON.stringify({
      phoneNumber,
      clientIP,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to register SMS number");
  }
};

export const unregisterSMS = async (sessionId: string): Promise<void> => {
  const response = await fetch(`http://localhost:3000/sms/unregister`, {
    method: "DELETE",
    headers: {
      "x-session-id": sessionId,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to unregister SMS number");
  }
};

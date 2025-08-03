import { API_BASE_URL } from "../config/api";

export const verifySession = async (sessionId: string): Promise<boolean> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/session/${sessionId}`
  );
  return response.ok;
};

export const logoutSession = async (sessionId: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/session/${sessionId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to logout");
  }
};

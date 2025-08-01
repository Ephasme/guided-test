export const verifySession = async (sessionId: string): Promise<boolean> => {
  const response = await fetch(
    `http://localhost:3000/auth/session/${sessionId}`
  );
  return response.ok;
};

export const logoutSession = async (sessionId: string): Promise<void> => {
  const response = await fetch(
    `http://localhost:3000/auth/session/${sessionId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to logout");
  }
};

import { useState, useEffect } from "react";
import {
  GOOGLE_CLIENT_ID,
  REDIRECT_URI,
  GOOGLE_API_SCOPES,
} from "../config/auth";

interface AuthState {
  sessionId: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    sessionId: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const sessionId = localStorage.getItem("google_session_id");
    if (sessionId) {
      verifySession(sessionId);
    }
  }, []);

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/auth/session/${sessionId}`
      );
      if (response.ok) {
        setAuthState({
          sessionId,
          isAuthenticated: true,
        });
      } else {
        localStorage.removeItem("google_session_id");
        setAuthState({
          sessionId: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      localStorage.removeItem("google_session_id");
      setAuthState({
        sessionId: null,
        isAuthenticated: false,
      });
    }
  };

  const initiateGoogleAuth = () => {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GOOGLE_API_SCOPES.join(" "));
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    const state = Math.random().toString(36).substring(7);
    authUrl.searchParams.set("state", state);
    localStorage.setItem("oauth_state", state);

    window.location.href = authUrl.toString();
  };

  const handleSessionCallback = async (sessionId: string) => {
    localStorage.setItem("google_session_id", sessionId);
    await verifySession(sessionId);
  };

  const logout = async () => {
    const sessionId = localStorage.getItem("google_session_id");
    if (sessionId) {
      try {
        await fetch(`http://localhost:3000/auth/session/${sessionId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }

    localStorage.removeItem("google_session_id");
    setAuthState({
      sessionId: null,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    initiateGoogleAuth,
    handleSessionCallback,
    logout,
  };
};

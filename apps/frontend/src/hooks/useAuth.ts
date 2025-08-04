import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verifySession, logoutSession } from "../api/authApi";
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
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    sessionId: null,
    isAuthenticated: false,
  });

  const sessionId = localStorage.getItem("google_session_id");

  const { data: isSessionValid, isLoading: isVerifyingSession } = useQuery({
    queryKey: ["auth", "session", sessionId],
    queryFn: () => verifySession(sessionId!),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      localStorage.removeItem("google_session_id");
      setAuthState({
        sessionId: null,
        isAuthenticated: false,
      });
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      localStorage.removeItem("google_session_id");
      setAuthState({
        sessionId: null,
        isAuthenticated: false,
      });
    },
  });

  useEffect(() => {
    if (!sessionId) {
      setAuthState({
        sessionId: null,
        isAuthenticated: false,
      });
    } else if (isSessionValid !== undefined) {
      if (isSessionValid) {
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
    }
  }, [sessionId, isSessionValid]);

  useEffect(() => {
    return () => {
      const oauthState = localStorage.getItem("oauth_state");
      if (oauthState) {
        const stateTimestamp = localStorage.getItem("oauth_state_timestamp");
        if (stateTimestamp) {
          const age = Date.now() - parseInt(stateTimestamp);
          if (age > 10 * 60 * 1000) {
            localStorage.removeItem("oauth_state");
            localStorage.removeItem("oauth_state_timestamp");
          }
        }
      }
    };
  }, []);

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
    localStorage.setItem("oauth_state_timestamp", Date.now().toString());

    window.location.href = authUrl.toString();
  };

  const handleSessionCallback = async (sessionId: string, state?: string) => {
    if (state) {
      const storedState = localStorage.getItem("oauth_state");
      if (!storedState || storedState !== state) {
        console.error("OAuth state validation failed");
        localStorage.removeItem("oauth_state");
        return;
      }
      localStorage.removeItem("oauth_state");
    }

    localStorage.setItem("google_session_id", sessionId);
    queryClient.invalidateQueries({ queryKey: ["auth", "session", sessionId] });
  };

  const logout = async () => {
    if (sessionId) {
      await logoutMutation.mutateAsync(sessionId);
    }
    // Immediately clear auth state and invalidate queries
    localStorage.removeItem("google_session_id");
    setAuthState({
      sessionId: null,
      isAuthenticated: false,
    });
    queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    queryClient.clear();
  };

  return {
    ...authState,
    isVerifyingSession,
    initiateGoogleAuth,
    handleSessionCallback,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
};

import { z } from "zod";

// OAuth callback query parameters schema
export const OAuthCallbackQuerySchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().min(1, "State parameter is required for security"),
});

export type OAuthCallbackQuery = z.infer<typeof OAuthCallbackQuerySchema>;

// Session parameter schema
export const SessionParamSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export type SessionParam = z.infer<typeof SessionParamSchema>;

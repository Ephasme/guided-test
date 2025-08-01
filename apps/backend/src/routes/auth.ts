import { FastifyPluginAsync } from "fastify";
import { google } from "googleapis";
import { TokenService } from "../services/tokenService";
import {
  OAuthCallbackQuerySchema,
  SessionParamSchema,
} from "../types/AuthSchemas";
import { config } from "../config";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/callback", async (request, reply) => {
    const result = OAuthCallbackQuerySchema.safeParse(request.query);
    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid query parameters",
        details: result.error.issues,
      });
    }

    const { code, state } = result.data;

    try {
      const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        "http://localhost:3000/auth/callback"
      );

      const { tokens } = await oauth2Client.getToken(code);

      const sessionId = TokenService.generateSessionId();

      TokenService.storeTokens(sessionId, {
        access_token: tokens.access_token || "",
        refresh_token: tokens.refresh_token || "",
        expires_in: tokens.expiry_date || 0,
      });

      const frontendUrl = new URL("http://localhost:5173");
      frontendUrl.searchParams.set("session_id", sessionId);
      frontendUrl.searchParams.set("state", state);

      return reply.redirect(frontendUrl.toString());
    } catch (error) {
      console.error("OAuth error:", error);
      return reply
        .status(500)
        .send({ error: "Failed to exchange code for tokens" });
    }
  });

  fastify.get("/session/:sessionId", async (request, reply) => {
    const result = SessionParamSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid session ID",
        details: result.error.issues,
      });
    }

    const { sessionId } = result.data;

    if (!TokenService.hasTokens(sessionId)) {
      return reply.status(404).send({ error: "Session not found" });
    }

    return reply.send({
      success: true,
      hasTokens: true,
    });
  });

  fastify.delete("/session/:sessionId", async (request, reply) => {
    const result = SessionParamSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid session ID",
        details: result.error.issues,
      });
    }

    const { sessionId } = result.data;

    TokenService.removeTokens(sessionId);

    return reply.send({ success: true });
  });
};

export default authRoutes;

import { FastifyPluginAsync } from "fastify";
import { google } from "googleapis";
import env from "env-var";
import { TokenService } from "../services/tokenService";

const GOOGLE_CLIENT_ID = env.get("GOOGLE_CLIENT_ID").required().asString();
const GOOGLE_CLIENT_SECRET = env
  .get("GOOGLE_CLIENT_SECRET")
  .required()
  .asString();

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/callback", async (request, reply) => {
    const { code } = request.query as { code: string };

    if (!code) {
      return reply
        .status(400)
        .send({ error: "Authorization code is required" });
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
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

      return reply.redirect(frontendUrl.toString());
    } catch (error) {
      console.error("OAuth error:", error);
      return reply
        .status(500)
        .send({ error: "Failed to exchange code for tokens" });
    }
  });

  fastify.get("/session/:sessionId", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };

    if (!TokenService.hasTokens(sessionId)) {
      return reply.status(404).send({ error: "Session not found" });
    }

    return reply.send({
      success: true,
      hasTokens: true,
    });
  });

  fastify.delete("/session/:sessionId", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };

    TokenService.removeTokens(sessionId);

    return reply.send({ success: true });
  });
};

export default authRoutes;

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
  // Handle OAuth callback from Google redirect (GET request)
  fastify.get("/callback", async (request, reply) => {
    const { code } = request.query as { code: string };

    if (!code) {
      return reply
        .status(400)
        .send({ error: "Authorization code is required" });
    }

    try {
      console.log(
        "OAuth callback received with code:",
        code.substring(0, 20) + "..."
      );
      console.log(
        "Using GOOGLE_CLIENT_ID:",
        GOOGLE_CLIENT_ID ? "SET" : "NOT SET"
      );
      console.log(
        "Using GOOGLE_CLIENT_SECRET:",
        GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET"
      );

      // Create OAuth2Client with the backend redirect URI
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/auth/callback"
      );

      console.log("Attempting to exchange code for tokens...");
      const { tokens } = await oauth2Client.getToken(code);
      console.log("Token exchange successful, tokens received:", {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      });

      // Generate secure session ID
      const sessionId = TokenService.generateSessionId();
      console.log("Generated session ID:", sessionId);

      // Store tokens securely on backend
      TokenService.storeTokens(sessionId, {
        access_token: tokens.access_token || "",
        refresh_token: tokens.refresh_token || "",
        expires_in: tokens.expiry_date || 0,
        user_id: "user", // In production, get actual user ID
      });

      // Redirect to frontend with session ID only
      const frontendUrl = new URL("http://localhost:5173");
      frontendUrl.searchParams.set("session_id", sessionId);
      console.log("Redirecting to frontend:", frontendUrl.toString());

      return reply.redirect(frontendUrl.toString());
    } catch (error) {
      console.error("OAuth error details:", {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        status: (error as any)?.status,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return reply
        .status(500)
        .send({ error: "Failed to exchange code for tokens" });
    }
  });

  // Get current session status
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

  // Logout - remove tokens
  fastify.delete("/session/:sessionId", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };

    TokenService.removeTokens(sessionId);

    return reply.send({ success: true });
  });
};

export default authRoutes;

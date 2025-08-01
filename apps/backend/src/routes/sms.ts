import { SMSRegistrationSchema } from "../types/UserProfile";
import { SMSRoutesPlugin } from "../types/SMSRoutes";
import { resolveUserLocation } from "../utils/resolveUserLocation";
import { validateAndFormatPhoneNumber } from "../utils/validatePhoneNumber";

const smsRoutes: SMSRoutesPlugin = async (fastify, options) => {
  const userStore = options.userStore;

  fastify.post("/register", async (request, reply) => {
    const result = SMSRegistrationSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const { phoneNumber, clientIP } = result.data;
    const sessionId = request.headers["x-session-id"] as string;

    if (!sessionId) {
      return reply.status(401).send({ error: "Session ID required" });
    }

    let formattedPhoneNumber: string;
    try {
      formattedPhoneNumber = validateAndFormatPhoneNumber(phoneNumber);
    } catch (error) {
      return reply.status(400).send({
        error: "Invalid phone number format",
        details:
          error instanceof Error
            ? error.message
            : "Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)",
      });
    }

    try {
      let user = await userStore.getUser(sessionId);

      if (!user) {
        user = await userStore.createUser(sessionId);
      }

      // Resolve user's location based on their IP
      let resolvedLocation: string | undefined;
      let timezone: string | undefined;

      try {
        console.log(`Resolving location for IP: ${clientIP}`);
        const locationData = await resolveUserLocation(clientIP);
        resolvedLocation = `${locationData.city}, ${locationData.countryName}`;
        timezone = locationData.timezone;
        console.log(
          `Resolved location: ${resolvedLocation}, timezone: ${timezone}`
        );
      } catch (locationError) {
        console.error("Failed to resolve user location:", locationError);
        // Continue without location resolution - user can still register
      }

      await userStore.updateUser(sessionId, {
        smsPhoneNumber: formattedPhoneNumber,
        ...(resolvedLocation && { resolvedLocation }),
        ...(timezone && { timezone }),
      });

      return reply.send({
        success: true,
        message: "SMS phone number registered successfully",
      });
    } catch (error) {
      console.error("Failed to register SMS number:", error);
      return reply.status(500).send({ error: "Failed to register SMS number" });
    }
  });

  fastify.delete("/unregister", async (request, reply) => {
    const sessionId = request.headers["x-session-id"] as string;

    if (!sessionId) {
      return reply.status(401).send({ error: "Session ID required" });
    }

    try {
      const user = await userStore.getUser(sessionId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      await userStore.updateUser(sessionId, {
        smsPhoneNumber: undefined,
      });

      return reply.send({
        success: true,
        message: "SMS phone number unregistered successfully",
      });
    } catch (error) {
      console.error("Failed to unregister SMS number:", error);
      return reply
        .status(500)
        .send({ error: "Failed to unregister SMS number" });
    }
  });

  fastify.get("/status", async (request, reply) => {
    const sessionId = request.headers["x-session-id"] as string;

    if (!sessionId) {
      return reply.status(401).send({ error: "Session ID required" });
    }

    try {
      const user = await userStore.getUser(sessionId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({
        notificationsEnabled: !!user.smsPhoneNumber,
        phoneNumber: user.smsPhoneNumber,
      });
    } catch (error) {
      console.error("Failed to get SMS status:", error);
      return reply.status(500).send({ error: "Failed to get SMS status" });
    }
  });
};

export default smsRoutes;

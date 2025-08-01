import Fastify from "fastify";
import cors from "@fastify/cors";
import weatherRoutes from "./routes/weather";
import authRoutes from "./routes/auth";
import smsRoutes from "./routes/sms";
import { UserStore } from "./services/userStore";
import { NotificationStore } from "./services/notificationStore";
import { TwilioService } from "./services/twilioService";
import { CalendarServiceFactory } from "./services/calendarServiceFactory";
import { NotificationService } from "./services/notificationService";
import { NotificationScheduler } from "./jobs/notificationScheduler";
import OpenAI from "openai";
import { Twilio } from "twilio";
import { config } from "./config";

async function startServer() {
  const server = Fastify();
  const calendarServiceFactory = new CalendarServiceFactory();
  const userStore = new UserStore();
  const notificationStore = new NotificationStore();
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
  });
  const twilioClient = new Twilio(
    config.twilio.accountSid,
    config.twilio.authToken
  );
  const twilioService = new TwilioService(
    twilioClient,
    config.twilio.messagingServiceSid
  );

  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  server.register(weatherRoutes, {
    prefix: "/weather",
    calendarServiceFactory,
    openai,
  });
  server.register(authRoutes, { prefix: "/auth" });
  server.register(smsRoutes, {
    prefix: "/sms",
    userStore,
  });

  const notificationService = new NotificationService(
    userStore,
    notificationStore,
    twilioService,
    calendarServiceFactory,
    openai
  );
  const notificationScheduler = new NotificationScheduler(
    notificationService,
    config.notification.intervalMs
  );
  notificationScheduler.start();

  server.listen({ port: config.server.port }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server running on http://localhost:${config.server.port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

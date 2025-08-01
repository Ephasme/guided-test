import Fastify from "fastify";
import cors from "@fastify/cors";
import weatherRoutes from "./routes/weather";
import authRoutes from "./routes/auth";
import { CalendarServiceFactory } from "./services/calendarServiceFactory";

async function startServer() {
  const server = Fastify();
  const calendarServiceFactory = new CalendarServiceFactory();

  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  server.register(weatherRoutes, {
    prefix: "/weather",
    calendarServiceFactory,
  });
  server.register(authRoutes, { prefix: "/auth" });

  server.listen({ port: 3000 }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log("Server running on http://localhost:3000");
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

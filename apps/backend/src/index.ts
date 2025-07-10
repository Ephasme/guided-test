import Fastify from "fastify";
import cors from "@fastify/cors";
import weatherRoutes from "./routes/weather";

async function startServer() {
  const server = Fastify();

  // Enable CORS
  await server.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true,
  });

  server.register(weatherRoutes, { prefix: "/weather" });

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

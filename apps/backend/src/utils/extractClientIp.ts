import { FastifyRequest } from "fastify";

export function extractClientIp(request: FastifyRequest): string {
  const forwardedFor = request.headers["x-forwarded-for"];
  const ip = forwardedFor || request.ip;

  if (Array.isArray(ip)) {
    return ip[0];
  } else if (typeof ip === "string") {
    return ip.split(",")[0].trim();
  } else {
    return request.ip;
  }
}

import { FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError, ValidationError, NotFoundError } from "./errors";

// Combined IP schema for both IPv4 and IPv6
const ipSchema = z.union([z.ipv4(), z.ipv6()]);

function isValidIP(ip: string): boolean {
  return ipSchema.safeParse(ip).success;
}

function extractFirstValidIP(ips: string[]): string | null {
  for (const ip of ips) {
    const trimmedIp = ip.trim();
    if (isValidIP(trimmedIp)) {
      return trimmedIp;
    }
  }

  return null;
}

export function extractClientIp(request: FastifyRequest): string {
  try {
    const forwardedFor = request.headers["x-forwarded-for"];
    const realIP = request.headers["x-real-ip"];
    const cfConnectingIP = request.headers["cf-connecting-ip"]; // Cloudflare

    // Try different IP sources in order of preference
    const ipSources = [cfConnectingIP, realIP, forwardedFor, request.ip].filter(
      Boolean
    );

    if (ipSources.length === 0) {
      throw new NotFoundError("No IP address headers found in request");
    }

    // Try to find a valid IP from all sources
    for (const ipSource of ipSources) {
      if (Array.isArray(ipSource)) {
        const validIP = extractFirstValidIP(ipSource);
        if (validIP) return validIP;
      } else if (typeof ipSource === "string") {
        const validIP = extractFirstValidIP([ipSource]);
        if (validIP) return validIP;
      }
    }

    throw new ValidationError("No valid IP address found in request headers");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("IP extraction failed:", error);
    throw new AppError("Failed to extract client IP address", 400);
  }
}

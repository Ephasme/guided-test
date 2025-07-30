import { z } from "zod";

export const WeatherQuerySchema = z.object({
  query: z.string().min(3),
  clientIP: z.string().optional(),
  sessionId: z.string().optional(),
});

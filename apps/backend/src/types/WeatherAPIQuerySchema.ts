import { z } from "zod";
export const WeatherAPIQuerySchema = z.object({
  q: z.string().min(1, "Missing location (q)"),
  days: z.number().int().min(1).max(14),
  dt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  hour: z.number().int().min(0).max(23).optional(),
  alerts: z.enum(["yes", "no"]).optional(),
  aqi: z.enum(["yes", "no"]).optional(),
  lang: z.string().length(2).optional(),
});

export type WeatherAPIQuery = z.infer<typeof WeatherAPIQuerySchema>;

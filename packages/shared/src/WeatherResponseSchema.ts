import { z } from "zod";

export const WeatherResponseSchema = z.object({
  location: z.string().min(1, "Location is required"),
  forecast: z.string().min(1, "Forecast is required"),
  query: z.string().min(1, "Query is required"),
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

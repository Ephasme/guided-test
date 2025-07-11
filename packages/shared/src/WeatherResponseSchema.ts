import { z } from "zod";

// Calendar Action Schema for shared types
export const CalendarActionSchema = z.object({
  type: z.enum(["insert", "get"]),
  requestBody: z.record(z.any()), // Flexible object for Google APIs parameters
});

export type CalendarAction = z.infer<typeof CalendarActionSchema>;

export const WeatherResponseSchema = z.object({
  location: z.string().min(1, "Location is required"),
  forecast: z.string().min(1, "Forecast is required"),
  query: z.string().min(1, "Query is required"),
  calendarAction: CalendarActionSchema.optional(), // Optional calendar action
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

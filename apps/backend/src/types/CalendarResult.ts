import { z } from "zod";
import { calendar_v3 } from "googleapis";

// Use the actual Google Calendar API types
type GoogleCalendarEvent = calendar_v3.Schema$Event;

// Base calendar result schema
const BaseCalendarResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Event creation result
const CreateEventResultSchema = BaseCalendarResultSchema.extend({
  action: z.literal("create"),
  event: z.custom<GoogleCalendarEvent>(), // Google Calendar event object
});

// Event search result
const FindEventsResultSchema = BaseCalendarResultSchema.extend({
  action: z.literal("find"),
  events: z.array(z.custom<GoogleCalendarEvent>()), // Array of Google Calendar event objects
});

// Single event result
const GetEventResultSchema = BaseCalendarResultSchema.extend({
  action: z.literal("get"),
  event: z.custom<GoogleCalendarEvent>(), // Google Calendar event object
});

// Discriminated union of all possible calendar results
export const CalendarResultSchema = z.discriminatedUnion("action", [
  CreateEventResultSchema,
  FindEventsResultSchema,
  GetEventResultSchema,
]);

export type CalendarResult = z.infer<typeof CalendarResultSchema>;

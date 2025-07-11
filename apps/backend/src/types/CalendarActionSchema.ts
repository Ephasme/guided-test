import { z } from "zod";

// Natural calendar action schema
export const CalendarActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    event: z.object({
      summary: z.string(),
      start: z.object({
        dateTime: z.string(),
        timeZone: z.string(),
      }),
      end: z.object({
        dateTime: z.string(),
        timeZone: z.string(),
      }),
      description: z.string().optional(),
      location: z.string().optional(),
      attendees: z.array(z.object({ email: z.string() })).optional(),
      reminders: z.object({ useDefault: z.boolean() }).optional(),
    }),
  }),
  z.object({
    action: z.literal("find"),
    query: z.object({
      timeMin: z.string().optional(),
      timeMax: z.string().optional(),
      searchTerm: z.string().optional(),
      maxResults: z.number().optional(),
      orderBy: z.literal("startTime").optional(),
    }),
  }),
  z.object({
    action: z.literal("get"),
    eventId: z.string(),
  }),
]);

export type CalendarAction = z.infer<typeof CalendarActionSchema>;

import { z } from "zod";
import { calendar_v3 } from "googleapis";

type GoogleCalendarEvent = calendar_v3.Schema$Event;

const BaseCalendarResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const CreateEventResultSchema = BaseCalendarResultSchema.extend({
  action: z.literal("create"),
  event: z.custom<GoogleCalendarEvent>(),
});

const FindEventsResultSchema = BaseCalendarResultSchema.extend({
  action: z.literal("find"),
  events: z.array(z.custom<GoogleCalendarEvent>()),
});

const GetEventResultSchema = BaseCalendarResultSchema.extend({
  action: z.literal("get"),
  event: z.custom<GoogleCalendarEvent>(),
});
export const CalendarResultSchema = z.discriminatedUnion("action", [
  CreateEventResultSchema,
  FindEventsResultSchema,
  GetEventResultSchema,
]);

export type CalendarResult = z.infer<typeof CalendarResultSchema>;

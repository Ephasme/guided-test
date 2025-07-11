import { z } from "zod";
import { calendar_v3 } from "googleapis";

// Discriminated union for calendar actions
export const CalendarActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("insert"),
    requestBody: z.custom<calendar_v3.Schema$Event>(),
  }),
  z.object({
    type: z.literal("get"),
    params: z.custom<calendar_v3.Params$Resource$Events$Get>(),
  }),
  z.object({
    type: z.literal("list"),
    params: z.custom<calendar_v3.Params$Resource$Events$List>(),
  }),
]);

export type CalendarAction = z.infer<typeof CalendarActionSchema>;

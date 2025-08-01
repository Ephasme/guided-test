import { z } from "zod";

export const UserProfileSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  smsPhoneNumber: z.string().optional(),
  timezone: z.string().optional(),
  defaultLocation: z.string().optional(),
  resolvedLocation: z.string().optional(),
  notificationPreferences: z
    .object({
      enabled: z.boolean().default(true),
      advanceNoticeMinutes: z.number().default(60),
    })
    .optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const SMSRegistrationSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  clientIP: z.string().min(1, "Client IP is required"),
});

export type SMSRegistration = z.infer<typeof SMSRegistrationSchema>;

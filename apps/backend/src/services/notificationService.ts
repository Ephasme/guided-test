import { CalendarService } from "./calendarService";
import { CalendarServiceFactory } from "./calendarServiceFactory";
import { TwilioService } from "./twilioService";
import { getWeatherForNotification } from "./notificationWeatherService";
import { UserStore } from "./userStore";
import { NotificationStore } from "./notificationStore";
import { TokenService } from "./tokenService";
import {
  NotificationWeatherContext,
  NotificationWeatherResult,
} from "../types/NotificationWeather";
import OpenAI from "openai";
import { calendar_v3 } from "googleapis";
import { buildSMSMessagePrompt } from "../utils/buildSMSMessagePrompt";
import { AppError } from "../utils/errors";
import { DateTime } from "luxon";

type GoogleCalendarEvent = calendar_v3.Schema$Event;

export class NotificationService {
  constructor(
    private userStore: UserStore,
    private notificationStore: NotificationStore,
    private twilioService: TwilioService,
    private calendarServiceFactory: CalendarServiceFactory,
    private openai: OpenAI
  ) {}

  async processNotifications(): Promise<void> {
    try {
      const usersWithSMS = await this.userStore.findUsersWithSMS();

      console.log(`Found ${usersWithSMS.length} users with SMS`);

      for (const user of usersWithSMS) {
        await this.processUserNotifications(user.sessionId);
      }
    } catch (error) {
      console.error("Failed to process notifications:", error);
    }
  }

  private async processUserNotifications(sessionId: string): Promise<void> {
    try {
      const tokens = TokenService.getTokens(sessionId);
      if (!tokens) {
        console.log(`No tokens found for session ${sessionId}`);
        return;
      }

      const user = await this.userStore.getUser(sessionId);
      if (!user?.smsPhoneNumber) {
        return;
      }

      const calendarService = this.calendarServiceFactory.create(
        tokens.access_token
      );
      const upcomingMeetings = await this.getUpcomingMeetings(calendarService);

      if (upcomingMeetings.length === 0) {
        console.log(`No upcoming meetings found for user ${sessionId}`);
        return;
      } else {
        console.log(
          `Found ${upcomingMeetings.length} upcoming meetings for user ${sessionId}`
        );
      }

      for (const meeting of upcomingMeetings) {
        await this.processMeetingNotification(
          sessionId,
          user.smsPhoneNumber,
          meeting
        );
      }
    } catch (error) {
      console.error(
        `Failed to process notifications for session ${sessionId}:`,
        error
      );
    }
  }

  private async getUpcomingMeetings(calendarService: CalendarService) {
    const now = DateTime.now();
    const oneHourFromNow = now.plus({ hours: 1 });
    const twoHoursFromNow = now.plus({ hours: 2 });

    const result = await calendarService.executeCalendarAction({
      action: "find",
      query: {
        timeMin: oneHourFromNow.toISO(),
        timeMax: twoHoursFromNow.toISO(),
        maxResults: 10,
      },
    });

    if (!result.success || result.action !== "find" || !result.events) {
      return [];
    }

    return result.events.filter((event: GoogleCalendarEvent) => {
      const startTime = DateTime.fromISO(
        event.start?.dateTime || event.start?.date || ""
      );
      if (!startTime.isValid) {
        return false;
      }

      const timeUntilMeeting = startTime.diff(now, "minutes").minutes;
      return timeUntilMeeting <= 60;
    });
  }

  private async processMeetingNotification(
    sessionId: string,
    phoneNumber: string,
    meeting: GoogleCalendarEvent
  ): Promise<void> {
    const eventId = meeting.id;
    if (!eventId) {
      console.error("Meeting has no ID, skipping notification");
      return;
    }

    const meetingStart = DateTime.fromISO(
      meeting.start?.dateTime || meeting.start?.date || ""
    );
    if (!meetingStart.isValid) {
      console.error("Invalid meeting start time, skipping notification");
      return;
    }

    const shouldSend = await this.notificationStore.shouldSendNotification(
      sessionId,
      eventId,
      meetingStart.toJSDate()
    );

    if (!shouldSend) {
      console.log(
        `Skipping notification for meeting ${eventId} - already sent or outside window`
      );
      return;
    }

    try {
      const meetingLocation = meeting.location || meeting.description || "";
      const user = await this.userStore.getUser(sessionId);

      console.log(`Meeting location: "${meetingLocation}"`);
      console.log(`User resolved location: "${user?.resolvedLocation}"`);
      console.log(`User default location: "${user?.defaultLocation}"`);

      const weatherContext: NotificationWeatherContext = {
        meetingLocation,
        meetingTime: meetingStart.toJSDate(),
        userTimezone: user?.timezone || "UTC",
        meetingDuration: this.calculateMeetingDuration(meeting),
        userDefaultLocation: user?.resolvedLocation || user?.defaultLocation,
      };

      const weatherResult = await getWeatherForNotification(
        weatherContext,
        this.openai
      );

      const meetingTitle = meeting.summary || "Meeting";
      const meetingTime = meetingStart.toLocaleString(DateTime.TIME_SIMPLE);

      const messageBody = await this.generateSMSMessage(
        meetingTitle,
        meetingTime,
        weatherResult
      );

      await this.twilioService.sendMessage(phoneNumber, messageBody);

      await this.notificationStore.markAsSent(sessionId, eventId);

      console.log(`Sent weather notification for meeting: ${meetingTitle}`);
    } catch (error) {
      console.error(
        `Failed to send notification for meeting ${meeting.id}:`,
        error
      );
    }
  }

  private async generateSMSMessage(
    meetingTitle: string,
    meetingTime: string,
    weatherResult: NotificationWeatherResult
  ): Promise<string> {
    try {
      const prompt = buildSMSMessagePrompt(
        meetingTitle,
        meetingTime,
        weatherResult
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await this.openai.chat.completions.create(
        {
          model: "gpt-3.5-turbo-0125",
          temperature: 0.7,
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new AppError("OpenAI returned empty response for SMS message");
      }

      const trimmedContent = content.trim();
      return trimmedContent;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("SMS message generation timed out", 408);
      }
      console.error("SMS message generation failed:", error);
      throw new AppError("Failed to generate SMS message");
    }
  }

  private calculateMeetingDuration(meeting: GoogleCalendarEvent): number {
    if (!meeting.start || !meeting.end) {
      return 60; // Default 1 hour
    }

    const startDateTime = meeting.start.dateTime || meeting.start.date;
    const endDateTime = meeting.end.dateTime || meeting.end.date;

    if (!startDateTime || !endDateTime) {
      return 60; // Default 1 hour if we can't determine duration
    }

    const startTime = DateTime.fromISO(startDateTime);
    const endTime = DateTime.fromISO(endDateTime);

    if (!startTime.isValid || !endTime.isValid) {
      return 60; // Default 1 hour if invalid dates
    }

    return Math.round(endTime.diff(startTime, "minutes").minutes);
  }
}

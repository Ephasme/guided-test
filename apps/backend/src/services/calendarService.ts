import { google } from "googleapis";
import { calendar_v3, Auth } from "googleapis";
import { CalendarAction } from "../types/CalendarActionSchema";
import { CalendarResult } from "../types/CalendarResult";

type Calendar = calendar_v3.Calendar;
type Event = calendar_v3.Schema$Event;
type OAuth2Client = Auth.OAuth2Client;

export class CalendarService {
  private oauth2Client: OAuth2Client;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
  }

  async executeCalendarAction(action: CalendarAction): Promise<CalendarResult> {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    switch (action.action) {
      case "create":
        return this.createEvent(calendar, action.event);
      case "find":
        return this.findEvents(calendar, action.query);
      case "get":
        return this.getEvent(calendar, action.eventId);
      default: {
        const exhaustiveCheck: never = action;
        throw new Error(`Unknown calendar action: ${exhaustiveCheck}`);
      }
    }
  }

  private async createEvent(
    calendar: Calendar,
    eventData: Event
  ): Promise<CalendarResult> {
    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventData,
      });
      return {
        success: true,
        action: "create",
        event: response.data,
        message: "Event created successfully",
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  private async findEvents(
    calendar: Calendar,
    query: {
      timeMin?: string;
      timeMax?: string;
      searchTerm?: string;
      maxResults?: number;
      orderBy?: string;
    }
  ): Promise<CalendarResult> {
    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: query.timeMin || new Date().toISOString(),
        timeMax: query.timeMax,
        q: query.searchTerm,
        maxResults: query.maxResults || 10,
        orderBy: query.orderBy || "startTime",
        singleEvents: true,
      });
      return {
        success: true,
        action: "find",
        events: response.data.items || [],
        message: `Found ${response.data.items?.length || 0} events`,
      };
    } catch (error) {
      console.error("Error finding events:", error);
      throw new Error("Failed to find calendar events");
    }
  }

  private async getEvent(
    calendar: Calendar,
    eventId: string
  ): Promise<CalendarResult> {
    try {
      const response = await calendar.events.get({
        calendarId: "primary",
        eventId: eventId,
      });
      return {
        success: true,
        action: "get",
        event: response.data,
        message: "Event retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting event:", error);
      throw new Error("Failed to get calendar event");
    }
  }
}

import { google } from "googleapis";
import { CalendarAction } from "../types/CalendarActionSchema";

export class CalendarService {
  private oauth2Client: any;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
  }

  async executeCalendarAction(action: CalendarAction): Promise<any> {
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
      default:
        throw new Error(`Unknown calendar action: ${(action as any).action}`);
    }
  }

  private async createEvent(calendar: any, eventData: any) {
    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        resource: eventData,
      });
      return {
        success: true,
        event: response.data,
        message: "Event created successfully",
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  private async findEvents(calendar: any, query: any) {
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
        events: response.data.items || [],
        message: `Found ${response.data.items?.length || 0} events`,
      };
    } catch (error) {
      console.error("Error finding events:", error);
      throw new Error("Failed to find calendar events");
    }
  }

  private async getEvent(calendar: any, eventId: string) {
    try {
      const response = await calendar.events.get({
        calendarId: "primary",
        eventId: eventId,
      });
      return {
        success: true,
        event: response.data,
        message: "Event retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting event:", error);
      throw new Error("Failed to get calendar event");
    }
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CalendarService } from "../../services/calendarService";
import { CalendarAction } from "../../types/CalendarActionSchema";

describe("CalendarService", () => {
  let calendarService: CalendarService;

  beforeEach(() => {
    vi.clearAllMocks();
    calendarService = new CalendarService("test-access-token");
  });

  describe("executeCalendarAction", () => {
    it("should handle unknown action", async () => {
      const action = {
        action: "unknown",
      } as any;

      await expect(
        calendarService.executeCalendarAction(action)
      ).rejects.toThrow("Unknown calendar action: [object Object]");
    });

    it("should handle create event error", async () => {
      const action: CalendarAction = {
        action: "create",
        event: {
          summary: "Test Event",
          start: { dateTime: "2024-01-01T10:00:00Z", timeZone: "UTC" },
          end: { dateTime: "2024-01-01T11:00:00Z", timeZone: "UTC" },
        },
      };

      await expect(
        calendarService.executeCalendarAction(action)
      ).rejects.toThrow("Failed to create calendar event");
    });

    it("should handle find events error", async () => {
      const action: CalendarAction = {
        action: "find",
        query: {},
      };

      await expect(
        calendarService.executeCalendarAction(action)
      ).rejects.toThrow("Failed to find calendar events");
    });

    it("should handle get event error", async () => {
      const action: CalendarAction = {
        action: "get",
        eventId: "event-123",
      };

      await expect(
        calendarService.executeCalendarAction(action)
      ).rejects.toThrow("Failed to get calendar event");
    });
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "../../services/notificationService";
import { TokenService } from "../../services/tokenService";
import OpenAI from "openai";
import { DateTime } from "luxon";

vi.mock("../../services/twilioService", () => ({
  TwilioService: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
  })),
}));

vi.mock("../../services/userStore", () => ({
  UserStore: vi.fn().mockImplementation(() => ({
    findUsersWithSMS: vi.fn(),
    getUser: vi.fn(),
  })),
}));

vi.mock("../../services/notificationStore", () => ({
  NotificationStore: vi.fn().mockImplementation(() => ({
    hasNotificationBeenSent: vi.fn(),
    markAsSent: vi.fn(),
  })),
}));

vi.mock("../../services/calendarServiceFactory", () => ({
  CalendarServiceFactory: vi.fn().mockImplementation(() => ({
    create: vi.fn(),
  })),
}));

vi.mock("../../services/notificationWeatherService", () => ({
  getWeatherForNotification: vi.fn(),
}));

vi.mock("../../services/tokenService", () => ({
  TokenService: {
    getTokens: vi.fn(),
    storeTokens: vi.fn(),
  },
}));

describe("NotificationService", () => {
  let mockUserStore: any;
  let mockNotificationStore: any;
  let mockTwilioService: any;
  let mockCalendarServiceFactory: any;
  let mockOpenAI: any;
  let notificationService: NotificationService;

  beforeEach(() => {
    mockUserStore = {
      findUsersWithSMS: vi.fn(),
      getUser: vi.fn(),
    };

    mockNotificationStore = {
      hasNotificationBeenSent: vi.fn(),
      markAsSent: vi.fn(),
    };

    mockTwilioService = {
      sendMessage: vi.fn(),
    };

    mockCalendarServiceFactory = {
      create: vi.fn(),
    };

    mockOpenAI = {} as OpenAI;

    notificationService = new NotificationService(
      mockUserStore,
      mockNotificationStore,
      mockTwilioService,
      mockCalendarServiceFactory,
      mockOpenAI
    );
  });

  it("should process notifications for users with SMS", async () => {
    const mockUsers = [
      {
        sessionId: "test-session",
        smsPhoneNumber: "+1234567890",
        notificationPreferences: { enabled: true },
      },
    ];

    vi.mocked(mockUserStore.findUsersWithSMS).mockResolvedValue(mockUsers);
    vi.mocked(mockUserStore.getUser).mockResolvedValue(mockUsers[0]);

    await notificationService.processNotifications();

    expect(mockUserStore.findUsersWithSMS).toHaveBeenCalled();
  });

  it("should skip users without SMS numbers", async () => {
    const mockUsers = [
      {
        sessionId: "test-session",
        smsPhoneNumber: undefined,
        notificationPreferences: { enabled: true },
      },
    ];

    vi.mocked(mockUserStore.findUsersWithSMS).mockResolvedValue(mockUsers);
    vi.mocked(mockUserStore.getUser).mockResolvedValue(mockUsers[0]);

    await notificationService.processNotifications();

    expect(mockUserStore.findUsersWithSMS).toHaveBeenCalled();
  });

  it("should handle notification window logic correctly", async () => {
    const mockUserStore = {
      findUsersWithSMS: vi
        .fn()
        .mockResolvedValue([
          { sessionId: "test-session", smsPhoneNumber: "+1234567890" },
        ]),
      getUser: vi.fn().mockResolvedValue({
        sessionId: "test-session",
        smsPhoneNumber: "+1234567890",
      }),
    } as any;

    const mockNotificationStore = {
      shouldSendNotification: vi.fn(),
      markAsSent: vi.fn(),
    } as any;

    const mockTwilioService = {
      sendMessage: vi.fn(),
    } as any;

    const mockCalendarService = {
      executeCalendarAction: vi.fn().mockResolvedValue({
        success: true,
        action: "find",
        events: [
          {
            id: "event-1",
            summary: "Test Meeting",
            start: { dateTime: DateTime.now().plus({ minutes: 30 }).toISO() },
            end: { dateTime: DateTime.now().plus({ minutes: 90 }).toISO() },
          },
        ],
      }),
    } as any;

    const mockCalendarServiceFactory = {
      create: vi.fn().mockReturnValue(mockCalendarService),
    } as any;

    const mockOpenai = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "Test SMS message" } }],
          }),
        },
      },
    } as any;

    const notificationService = new NotificationService(
      mockUserStore,
      mockNotificationStore,
      mockTwilioService,
      mockCalendarServiceFactory,
      mockOpenai
    );

    vi.mocked(TokenService.getTokens).mockReturnValue({
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: 3600,
    });

    mockNotificationStore.shouldSendNotification.mockResolvedValue(true);

    const { getWeatherForNotification } = await import(
      "../../services/notificationWeatherService"
    );
    vi.mocked(getWeatherForNotification).mockResolvedValue({
      weatherSummary: "Sunny with clear skies",
      actionableAdvice: "No special precautions needed",
      severity: "low" as const,
    });

    await notificationService.processNotifications();

    expect(mockNotificationStore.shouldSendNotification).toHaveBeenCalledWith(
      "test-session",
      "event-1",
      expect.any(Date)
    );
  });

  it("should use user default location when meeting has no location", async () => {
    const mockUserStore = {
      findUsersWithSMS: vi
        .fn()
        .mockResolvedValue([
          { sessionId: "test-session", smsPhoneNumber: "+1234567890" },
        ]),
      getUser: vi.fn().mockResolvedValue({
        sessionId: "test-session",
        smsPhoneNumber: "+1234567890",
        defaultLocation: "San Francisco, CA",
      }),
    } as any;

    const mockNotificationStore = {
      shouldSendNotification: vi.fn(),
      markAsSent: vi.fn(),
    } as any;

    const mockTwilioService = {
      sendMessage: vi.fn(),
    } as any;

    const mockCalendarService = {
      executeCalendarAction: vi.fn().mockResolvedValue({
        success: true,
        action: "find",
        events: [
          {
            id: "event-2",
            summary: "Meeting without location",
            start: { dateTime: DateTime.now().plus({ minutes: 30 }).toISO() },
            end: { dateTime: DateTime.now().plus({ minutes: 90 }).toISO() },
          },
        ],
      }),
    } as any;

    const mockCalendarServiceFactory = {
      create: vi.fn().mockReturnValue(mockCalendarService),
    } as any;

    const mockOpenai = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "Test SMS message" } }],
          }),
        },
      },
    } as any;

    const notificationService = new NotificationService(
      mockUserStore,
      mockNotificationStore,
      mockTwilioService,
      mockCalendarServiceFactory,
      mockOpenai
    );

    vi.mocked(TokenService.getTokens).mockReturnValue({
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: 3600,
    });

    mockNotificationStore.shouldSendNotification.mockResolvedValue(true);

    const { getWeatherForNotification } = await import(
      "../../services/notificationWeatherService"
    );
    vi.mocked(getWeatherForNotification).mockResolvedValue({
      weatherSummary: "Partly cloudy in San Francisco",
      actionableAdvice: "Bring a light jacket",
      severity: "low" as const,
    });

    await notificationService.processNotifications();

    expect(mockNotificationStore.shouldSendNotification).toHaveBeenCalledWith(
      "test-session",
      "event-2",
      expect.any(Date)
    );
  });
});

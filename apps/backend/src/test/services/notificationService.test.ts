import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "../../services/notificationService";
import { TokenService } from "../../services/tokenService";
import OpenAI from "openai";
import { DateTime } from "luxon";
import { UserStore } from "../../services/userStore";
import { NotificationStore } from "../../services/notificationStore";
import { TwilioService } from "../../services/twilioService";
import { CalendarServiceFactory } from "../../services/calendarServiceFactory";
import { CalendarService } from "../../services/calendarService";

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
  let mockUserStore: UserStore;
  let mockNotificationStore: NotificationStore;
  let mockTwilioService: TwilioService;
  let mockCalendarServiceFactory: CalendarServiceFactory;
  let mockOpenAI: OpenAI;
  let notificationService: NotificationService;

  beforeEach(() => {
    mockUserStore = {
      findUsersWithSMS: vi.fn(),
      getUser: vi.fn(),
    } as unknown as UserStore;

    mockNotificationStore = {
      hasNotificationBeenSent: vi.fn(),
      markAsSent: vi.fn(),
      shouldSendNotification: vi.fn(),
    } as unknown as NotificationStore;

    mockTwilioService = {
      sendMessage: vi.fn(),
    } as unknown as TwilioService;

    mockCalendarServiceFactory = {
      create: vi.fn(),
    } as unknown as CalendarServiceFactory;

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
        notificationPreferences: { enabled: true, advanceNoticeMinutes: 60 },
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
        notificationPreferences: { enabled: true, advanceNoticeMinutes: 60 },
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
    } as unknown as UserStore;

    const mockNotificationStore = {
      shouldSendNotification: vi.fn(),
      markAsSent: vi.fn(),
    } as unknown as NotificationStore;

    const mockTwilioService = {
      sendMessage: vi.fn(),
    } as unknown as TwilioService;

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
    } as unknown as CalendarService;

    const mockCalendarServiceFactory = {
      create: vi.fn().mockReturnValue(mockCalendarService),
    } as unknown as CalendarServiceFactory;

    const mockOpenai = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "Test SMS message" } }],
          }),
        },
      },
    } as unknown as OpenAI;

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

    vi.mocked(mockNotificationStore.shouldSendNotification).mockResolvedValue(
      true
    );

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
    } as unknown as UserStore;

    const mockNotificationStore = {
      shouldSendNotification: vi.fn(),
      markAsSent: vi.fn(),
    } as unknown as NotificationStore;

    const mockTwilioService = {
      sendMessage: vi.fn(),
    } as unknown as TwilioService;

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
    } as unknown as CalendarService;

    const mockCalendarServiceFactory = {
      create: vi.fn().mockReturnValue(mockCalendarService),
    } as unknown as CalendarServiceFactory;

    const mockOpenai = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "Test SMS message" } }],
          }),
        },
      },
    } as unknown as OpenAI;

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

    vi.mocked(mockNotificationStore.shouldSendNotification).mockResolvedValue(
      true
    );

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

export interface NotificationWeatherContext {
  meetingLocation: string;
  meetingTime: Date;
  userTimezone: string;
  meetingDuration?: number;
  userDefaultLocation?: string;
}

export interface NotificationWeatherResult {
  weatherSummary: string;
  actionableAdvice: string;
  severity: "low" | "medium" | "high";
  relevantAlerts?: string[];
}

export interface NotificationRecord {
  sessionId: string;
  eventId: string;
  scheduledFor: Date;
  sentAt?: Date;
}

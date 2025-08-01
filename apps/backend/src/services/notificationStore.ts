import { NotificationRecord } from "../types/NotificationWeather";
import { DateTime } from "luxon";

export class NotificationStore {
  private notifications = new Map<string, NotificationRecord>();

  private getNotificationKey(sessionId: string, eventId: string): string {
    return `${sessionId}:${eventId}`;
  }

  async scheduleNotification(record: NotificationRecord): Promise<void> {
    const key = this.getNotificationKey(record.sessionId, record.eventId);
    this.notifications.set(key, record);
  }

  async markAsSent(sessionId: string, eventId: string): Promise<void> {
    const key = this.getNotificationKey(sessionId, eventId);
    const notification = this.notifications.get(key);
    if (notification) {
      notification.sentAt = new Date();
      this.notifications.set(key, notification);
    }
  }

  async getPendingNotifications(): Promise<NotificationRecord[]> {
    const now = new Date();
    return Array.from(this.notifications.values()).filter(
      (notification) => !notification.sentAt && notification.scheduledFor <= now
    );
  }

  async cleanupOldNotifications(): Promise<void> {
    const oneDayAgo = DateTime.now().minus({ days: 1 });
    const keysToDelete: string[] = [];

    for (const [key, notification] of this.notifications.entries()) {
      if (notification.sentAt) {
        const sentAtDateTime = DateTime.fromJSDate(notification.sentAt);
        if (sentAtDateTime.isValid && sentAtDateTime < oneDayAgo) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach((key) => this.notifications.delete(key));
  }

  async hasNotificationBeenSent(
    sessionId: string,
    eventId: string
  ): Promise<boolean> {
    const key = this.getNotificationKey(sessionId, eventId);
    const notification = this.notifications.get(key);
    return notification?.sentAt !== undefined;
  }

  async shouldSendNotification(
    sessionId: string,
    eventId: string,
    meetingStartTime: Date
  ): Promise<boolean> {
    const key = this.getNotificationKey(sessionId, eventId);
    const notification = this.notifications.get(key);

    if (!notification) {
      await this.initializeNotification(sessionId, eventId, meetingStartTime);
      return true;
    }

    if (notification.sentAt) {
      return false;
    }

    const now = DateTime.now();
    const meetingStartDateTime = DateTime.fromJSDate(meetingStartTime);
    const timeUntilMeeting = meetingStartDateTime.diff(now, "minutes").minutes;

    if (timeUntilMeeting < 0) {
      return false;
    }

    if (timeUntilMeeting > 60) {
      return false;
    }

    return true;
  }

  private async initializeNotification(
    sessionId: string,
    eventId: string,
    meetingStartTime: Date
  ): Promise<void> {
    const notification: NotificationRecord = {
      sessionId,
      eventId,
      scheduledFor: meetingStartTime,
    };

    const key = this.getNotificationKey(sessionId, eventId);
    this.notifications.set(key, notification);
  }
}

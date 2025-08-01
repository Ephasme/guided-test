import { NotificationService } from "../services/notificationService";

export class NotificationScheduler {
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    private notificationService: NotificationService,
    private intervalMs: number
  ) {}

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      await this.runNotificationCheck();
    }, this.intervalMs);

    this.runNotificationCheck();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
  }

  private async runNotificationCheck(): Promise<void> {
    try {
      await this.notificationService.processNotifications();
    } catch (error) {
      console.error("Notification check failed:", error);
    }
  }
}

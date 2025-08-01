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
      console.log("Notification scheduler is already running");
      return;
    }

    console.log(
      `Starting notification scheduler with ${this.intervalMs}ms intervals`
    );
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
    console.log("Notification scheduler stopped");
  }

  private async runNotificationCheck(): Promise<void> {
    try {
      console.log("Running notification check...");
      await this.notificationService.processNotifications();
      console.log("Notification check completed");
    } catch (error) {
      console.error("Notification check failed:", error);
    }
  }
}

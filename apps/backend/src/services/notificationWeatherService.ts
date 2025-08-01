import OpenAI from "openai";
import { generateNotificationWeatherSummary } from "../utils/generateNotificationWeatherSummary";
import { resolveMeetingLocation } from "../utils/resolveMeetingLocation";
import {
  NotificationWeatherContext,
  NotificationWeatherResult,
} from "../types/NotificationWeather";

export async function getWeatherForNotification(
  context: NotificationWeatherContext,
  openai: OpenAI
): Promise<NotificationWeatherResult> {
  try {
    const resolvedLocation = await resolveMeetingLocation(
      context.meetingLocation,
      context.userDefaultLocation
    );

    const weatherContext: NotificationWeatherContext = {
      ...context,
      meetingLocation: resolvedLocation,
    };

    const weatherSummary = await generateNotificationWeatherSummary(
      openai,
      weatherContext
    );

    return weatherSummary;
  } catch (error) {
    console.error("Failed to get weather for notification:", error);
    throw new Error("Failed to get weather data for notification");
  }
}

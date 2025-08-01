import OpenAI from "openai";
import {
  NotificationWeatherContext,
  NotificationWeatherResult,
} from "../types/NotificationWeather";
import { buildNotificationWeatherSummaryPrompt } from "./buildNotificationWeatherSummaryPrompt";
import { AppError } from "./errors";

export async function generateNotificationWeatherSummary(
  openai: OpenAI,
  context: NotificationWeatherContext
): Promise<NotificationWeatherResult> {
  try {
    const prompt = buildNotificationWeatherSummaryPrompt(context);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await openai.chat.completions.create(
      {
        model: "gpt-3.5-turbo-0125",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new AppError(
        "OpenAI returned empty response for notification weather"
      );
    }

    return parseNotificationWeatherResult(content);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("Weather notification generation timed out", 408);
    }
    console.error("Weather notification generation failed:", error);
    throw new AppError("Failed to generate weather notification");
  }
}

function parseNotificationWeatherResult(
  content: string
): NotificationWeatherResult {
  try {
    const parsed = JSON.parse(content);

    if (
      !parsed.weatherSummary ||
      !parsed.actionableAdvice ||
      !parsed.severity
    ) {
      throw new Error("Invalid notification weather result structure");
    }

    return {
      weatherSummary: parsed.weatherSummary,
      actionableAdvice: parsed.actionableAdvice,
      severity: parsed.severity,
      relevantAlerts: parsed.relevantAlerts || [],
    };
  } catch (error) {
    console.error(
      "Failed to parse notification weather result:",
      content,
      error
    );
    throw new AppError("Invalid weather notification response format");
  }
}

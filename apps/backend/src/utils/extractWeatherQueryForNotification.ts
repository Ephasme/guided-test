import OpenAI from "openai";
import {
  WeatherAPIQuery,
  WeatherAPIQuerySchema,
} from "../types/WeatherAPIQuerySchema";
import { NotificationWeatherContext } from "../types/NotificationWeather";
import { buildNotificationWeatherQueryPrompt } from "./buildNotificationWeatherQueryPrompt";

export async function extractWeatherQueryForNotification(
  openai: OpenAI,
  context: NotificationWeatherContext
): Promise<WeatherAPIQuery> {
  const prompt = buildNotificationWeatherQueryPrompt(context);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(raw);
    return WeatherAPIQuerySchema.parse(parsed);
  } catch {
    console.error("Failed to parse notification weather query:", raw);
    throw new Error("Invalid WeatherAPI query for notification");
  }
}

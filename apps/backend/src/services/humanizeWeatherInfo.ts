import OpenAI from "openai";
import { WeatherAPIResponse } from "../types/WeatherAPIResponse";
import { buildWeatherResponsePrompt } from "../utils/buildWeatherResponsePrompt";
import { AppError } from "../utils/errors";
import { CalendarResult } from "../types/CalendarResult";

export async function humanizeWeatherInfo(
  openai: OpenAI,
  weatherData: WeatherAPIResponse,
  originalQuery: string,
  calendarData?: CalendarResult
): Promise<string> {
  try {
    const prompt = buildWeatherResponsePrompt(
      weatherData,
      originalQuery,
      calendarData
    );

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
      throw new AppError("OpenAI returned empty response");
    }

    return content;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("Weather response generation timed out", 408);
    }
    console.error("Weather humanization failed:", error);
    throw new AppError("Failed to generate weather response");
  }
}

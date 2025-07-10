import OpenAI from "openai";
import { WeatherAPIResponse } from "../types/WeatherAPIResponse";
import { buildWeatherResponsePrompt } from "../utils/buildWeatherResponsePrompt";

export async function humanizeWeatherInfo(
  openai: OpenAI,
  weatherData: WeatherAPIResponse,
  originalQuery: string
): Promise<string> {
  const prompt = buildWeatherResponsePrompt(weatherData, originalQuery);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.7, // Slightly higher for more natural responses
    messages: [{ role: "user", content: prompt }],
  });

  return (
    response.choices[0]?.message?.content ||
    "Unable to generate weather response"
  );
}

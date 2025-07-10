import OpenAI from "openai";
import {
  WeatherAPIQuery,
  WeatherAPIQuerySchema,
} from "../types/WeatherAPIQuerySchema";
import { buildWeatherQueryPrompt } from "./buildWeatherQueryPrompt";

export async function generateWeatherAPIQueryFromUserInput(
  openai: OpenAI,
  userQuery: string,
  today: string,
  locationName: string
): Promise<WeatherAPIQuery> {
  const prompt = buildWeatherQueryPrompt(userQuery, today, locationName);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(raw);
    return WeatherAPIQuerySchema.parse(parsed);
  } catch (err) {
    console.error("Failed to parse GPT response:", raw);
    throw new Error("Invalid WeatherAPI query generated from LLM");
  }
}

import OpenAI from "openai";
import {
  CalendarAction,
  CalendarActionSchema,
} from "../types/CalendarActionSchema";
import { buildCalendarActionPrompt } from "./buildCalendarActionPrompt";

export async function extractCalendarActionFromUserInput(
  openai: OpenAI,
  userQuery: string,
  weatherInfo: string
): Promise<CalendarAction | undefined> {
  const prompt = buildCalendarActionPrompt(userQuery, weatherInfo);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content || "";

  console.log("raw", raw);

  try {
    if (raw.trim() === "null") return undefined;
    const parsed = JSON.parse(raw);
    return CalendarActionSchema.parse(parsed);
  } catch {
    console.error("Failed to parse calendar action:", raw);
    return undefined;
  }
}

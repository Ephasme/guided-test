import { OpenAIService } from "../services/openaiService";
import {
  CalendarAction,
  CalendarActionSchema,
} from "../types/CalendarActionSchema";
import { buildCalendarActionPrompt } from "./buildCalendarActionPrompt";

export async function extractCalendarActionFromUserInput(
  openaiService: OpenAIService,
  userQuery: string,
  weatherInfo: string
): Promise<CalendarAction | undefined> {
  try {
    const result = await openaiService.runPromptWithJsonParsingOrNull(
      CalendarActionSchema,
      () => buildCalendarActionPrompt(userQuery, weatherInfo)
    );
    return result ?? undefined;
  } catch (error) {
    console.error("Failed to extract calendar action:", error);
    return undefined;
  }
}

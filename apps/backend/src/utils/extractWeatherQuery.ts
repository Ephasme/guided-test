import { OpenAIService } from "../services/openaiService";
import {
  WeatherAPIQuery,
  WeatherAPIQuerySchema,
} from "../types/WeatherAPIQuerySchema";
import { buildWeatherQueryPrompt } from "./buildWeatherQueryPrompt";

export async function extractWeatherQueryFromUserInput(
  openaiService: OpenAIService,
  userQuery: string,
  today: string,
  locationName: string
): Promise<WeatherAPIQuery> {
  return await openaiService.runPromptWithJsonParsingOrThrow(
    WeatherAPIQuerySchema,
    () => buildWeatherQueryPrompt(userQuery, today, locationName)
  );
}

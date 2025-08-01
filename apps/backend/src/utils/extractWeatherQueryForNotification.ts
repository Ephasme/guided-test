import { OpenAIService } from "../services/openaiService";
import {
  WeatherAPIQuery,
  WeatherAPIQuerySchema,
} from "../types/WeatherAPIQuerySchema";
import { NotificationWeatherContext } from "../types/NotificationWeather";
import { buildNotificationWeatherQueryPrompt } from "./buildNotificationWeatherQueryPrompt";

export async function extractWeatherQueryForNotification(
  openaiService: OpenAIService,
  context: NotificationWeatherContext
): Promise<WeatherAPIQuery> {
  return await openaiService.runPromptWithJsonParsingOrThrow(
    WeatherAPIQuerySchema,
    () => buildNotificationWeatherQueryPrompt(context)
  );
}

import {
  WeatherQuerySchema,
  WeatherResponseSchema,
  WeatherResponse,
} from "@guided/shared";
import { extractWeatherQueryFromUserInput } from "../utils/extractWeatherQuery";
import { extractCalendarActionFromUserInput } from "../utils/extractCalendarAction";
import {
  resolveUserLocation,
  getTodayForTimezone,
} from "../utils/resolveUserLocation";
import { extractClientIp } from "../utils/extractClientIp";
import { fetchWeatherData } from "../services/fetchWeatherData";
import { humanizeWeatherInfo } from "../services/humanizeWeatherInfo";
import { TokenService } from "../services/tokenService";
import { CalendarResult } from "../types/CalendarResult";
import { WeatherRoutesPlugin } from "../types/WeatherRoutes";

const weatherRoutes: WeatherRoutesPlugin = async (fastify, options) => {
  const { calendarServiceFactory, openaiService } = options;

  fastify.get("/", async (request, reply): Promise<WeatherResponse> => {
    const result = WeatherQuerySchema.safeParse(request.query);
    if (!result.success) {
      return reply.status(400).send({ error: "Invalid query" });
    }
    const { query, clientIP, sessionId } = result.data;

    const ip = clientIP || extractClientIp(request);
    const { city, countryName, timezone } = await resolveUserLocation(ip);
    const locationName = `${city}, ${countryName}`;
    const today = getTodayForTimezone(timezone);

    const weatherApiQuery = await extractWeatherQueryFromUserInput(
      openaiService,
      query,
      today,
      locationName
    );

    const weatherData = await fetchWeatherData(weatherApiQuery);

    const weatherSummary = weatherData.current?.condition?.text || "";
    const calendarAction = await extractCalendarActionFromUserInput(
      openaiService,
      query,
      weatherSummary
    );

    let calendarResult: CalendarResult | undefined = undefined;
    if (calendarAction && sessionId) {
      try {
        const tokens = TokenService.getTokens(sessionId);
        if (tokens) {
          const calendarService = calendarServiceFactory.create(
            tokens.access_token
          );
          calendarResult = await calendarService.executeCalendarAction(
            calendarAction
          );
        }
      } catch (error) {
        console.error("Calendar action failed:", error);
      }
    }

    const weatherResponse = await humanizeWeatherInfo(
      openaiService,
      weatherData,
      query,
      calendarResult
    );

    const response = {
      location: weatherData.location.name,
      forecast: weatherResponse,
      query,
      calendarResult: calendarResult
        ? { message: calendarResult.message }
        : undefined,
    };

    return WeatherResponseSchema.parse(response);
  });
};

export default weatherRoutes;

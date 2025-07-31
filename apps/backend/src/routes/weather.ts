import { FastifyPluginAsync } from "fastify";
import {
  WeatherQuerySchema,
  WeatherResponseSchema,
  WeatherResponse,
} from "@guided/shared";
import env from "env-var";
import { OpenAI } from "openai";
import { extractWeatherQueryFromUserInput } from "../utils/extractWeatherQuery";
import { extractCalendarActionFromUserInput } from "../utils/extractCalendarAction";
import {
  resolveUserLocation,
  getTodayForTimezone,
} from "../utils/resolveUserLocation";
import { extractClientIp } from "../utils/extractClientIp";
import { fetchWeatherData } from "../services/fetchWeatherData";
import { humanizeWeatherInfo } from "../services/humanizeWeatherInfo";
import { CalendarService } from "../services/calendarService";
import { TokenService } from "../services/tokenService";
import { CalendarResult } from "../types/CalendarResult";

const OPENAI_API_KEY = env.get("OPENAI_API_KEY").required().asString();

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const weatherRoutes: FastifyPluginAsync = async (fastify) => {
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

    // Step 1: Extract weather query
    const weatherApiQuery = await extractWeatherQueryFromUserInput(
      openai,
      query,
      today,
      locationName
    );

    // Step 2: Fetch weather data
    const weatherData = await fetchWeatherData(weatherApiQuery);

    // Step 3: Optionally extract calendar action
    const weatherSummary = weatherData.current?.condition?.text || "";
    const calendarAction = await extractCalendarActionFromUserInput(
      openai,
      query,
      weatherSummary
    );

    console.log("calendarAction", calendarAction);

    // Step 4: Execute calendar action if present and session is available
    let calendarResult: CalendarResult | undefined = undefined;
    if (calendarAction && sessionId) {
      try {
        const tokens = TokenService.getTokens(sessionId);
        if (tokens) {
          const calendarService = new CalendarService(tokens.access_token);
          calendarResult = await calendarService.executeCalendarAction(
            calendarAction
          );
          console.log("Calendar action result:", calendarResult);
        }
      } catch (error) {
        console.error("Calendar action failed:", error);
        // Don't fail the entire request, just log the error
      }
    }

    // Step 5: Humanize weather info
    const weatherResponse = await humanizeWeatherInfo(
      openai,
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

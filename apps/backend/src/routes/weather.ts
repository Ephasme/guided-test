import { FastifyPluginAsync } from "fastify";
import {
  WeatherQuerySchema,
  WeatherResponseSchema,
  WeatherResponse,
} from "@guided/shared";
import env from "env-var";
import { OpenAI } from "openai";
import { generateWeatherAPIQueryFromUserInput } from "../utils/generateWeatherAPIQuery";
import {
  resolveUserLocation,
  getTodayForTimezone,
} from "../utils/resolveUserLocation";
import { extractClientIp } from "../utils/extractClientIp";
import { fetchWeatherData } from "../services/fetchWeatherData";
import { humanizeWeatherInfo } from "../services/humanizeWeatherInfo";

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
    const { query, clientIP } = result.data;

    const ip = clientIP || extractClientIp(request);
    const { city, countryName, timezone } = await resolveUserLocation(ip);
    const locationName = `${city}, ${countryName}`;
    const today = getTodayForTimezone(timezone);

    const weatherQuery = await generateWeatherAPIQueryFromUserInput(
      openai,
      query,
      today,
      locationName
    );

    const weatherData = await fetchWeatherData(weatherQuery);

    const weatherResponse = await humanizeWeatherInfo(
      openai,
      weatherData,
      query
    );

    console.log(weatherResponse);

    const response = {
      location: weatherData.location.name,
      forecast: weatherResponse,
      query,
    };

    return WeatherResponseSchema.parse(response);
  });
};

export default weatherRoutes;

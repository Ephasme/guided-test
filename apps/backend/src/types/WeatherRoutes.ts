import { FastifyPluginAsync } from "fastify";
import { CalendarServiceFactory } from "../services/calendarServiceFactory";
import { OpenAIService } from "../services/openaiService";

export interface WeatherRoutesOptions {
  calendarServiceFactory: CalendarServiceFactory;
  openaiService: OpenAIService;
}

export type WeatherRoutesPlugin = FastifyPluginAsync<WeatherRoutesOptions>;

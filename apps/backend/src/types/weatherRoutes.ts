import { FastifyPluginAsync } from "fastify";
import { CalendarServiceFactory } from "../services/calendarServiceFactory";

export interface WeatherRoutesOptions {
  calendarServiceFactory: CalendarServiceFactory;
}

export type WeatherRoutesPlugin = FastifyPluginAsync<WeatherRoutesOptions>;

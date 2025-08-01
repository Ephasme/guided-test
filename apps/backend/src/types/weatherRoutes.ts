import { FastifyPluginAsync } from "fastify";
import { CalendarServiceFactory } from "../services/calendarServiceFactory";
import OpenAI from "openai";

export interface WeatherRoutesOptions {
  calendarServiceFactory: CalendarServiceFactory;
  openai: OpenAI;
}

export type WeatherRoutesPlugin = FastifyPluginAsync<WeatherRoutesOptions>;

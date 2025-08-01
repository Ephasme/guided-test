import { FastifyPluginAsync } from "fastify";
import { UserStore } from "../services/userStore";

export interface SMSRoutesOptions {
  userStore: UserStore;
}

export type SMSRoutesPlugin = FastifyPluginAsync<SMSRoutesOptions>;

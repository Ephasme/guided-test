import OpenAI from "openai";
import { z } from "zod";
import { createRetryPromptBuilder } from "../utils/createRetryPromptBuilder";

export interface OpenAIServiceConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  rawResponses: string[];
}

export class OpenAIService {
  private client: OpenAI;
  private config: Required<OpenAIServiceConfig>;

  constructor(client: OpenAI, config: OpenAIServiceConfig = {}) {
    this.client = client;
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      baseDelay: config.baseDelay ?? 1000,
      maxDelay: config.maxDelay ?? 5000,
    };
  }

  private async retryWithJsonParsing<T>(
    schema: z.ZodSchema<T>,
    promptBuilder: (attempt: number, previousError?: string) => string,
    config: RetryConfig = {}
  ): Promise<RetryResult<T>> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 5000 } = config;

    const rawResponses: string[] = [];
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = promptBuilder(attempt, lastError);

        const response = await this.client.chat.completions.create({
          model: "gpt-3.5-turbo-0125",
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        });

        const raw = response.choices[0]?.message?.content || "";
        rawResponses.push(raw);

        if (raw.trim() === "null") {
          return {
            success: true,
            data: undefined,
            attempts: attempt,
            rawResponses,
          };
        }

        const parsed = JSON.parse(raw);
        const validated = schema.parse(parsed);

        return {
          success: true,
          data: validated,
          attempts: attempt,
          rawResponses,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        lastError = errorMessage;

        console.error(`Attempt ${attempt} failed:`, errorMessage);
        console.error(`Raw response:`, rawResponses[rawResponses.length - 1]);

        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to parse JSON after ${maxRetries} attempts. Last error: ${errorMessage}`,
            attempts: attempt,
            rawResponses,
          };
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: "Unexpected retry loop exit",
      attempts: maxRetries,
      rawResponses,
    };
  }

  async runPromptWithJsonParsing<T>(
    schema: z.ZodSchema<T>,
    promptBuilder: () => string,
    allowNull: boolean = false
  ): Promise<T | undefined> {
    const retryPromptBuilder = createRetryPromptBuilder(
      promptBuilder,
      allowNull
    );

    const result = await this.retryWithJsonParsing(
      schema,
      retryPromptBuilder,
      this.config
    );

    if (!result.success) {
      console.error("OpenAI service failed after retries:", result.error);
      console.error("Raw responses:", result.rawResponses);
      throw new Error(
        `OpenAI service failed after ${this.config.maxRetries} attempts`
      );
    }

    return result.data;
  }

  async runPromptWithJsonParsingOrThrow<T>(
    schema: z.ZodSchema<T>,
    promptBuilder: () => string
  ): Promise<T> {
    const result = await this.runPromptWithJsonParsing(
      schema,
      promptBuilder,
      false
    );
    if (result === undefined) {
      throw new Error("Expected JSON response but got null");
    }
    return result;
  }

  async runPromptWithJsonParsingOrNull<T>(
    schema: z.ZodSchema<T>,
    promptBuilder: () => string
  ): Promise<T | null> {
    return (
      (await this.runPromptWithJsonParsing(schema, promptBuilder, true)) ?? null
    );
  }

  async createChatCompletion(
    prompt: string,
    signal?: AbortSignal
  ): Promise<string> {
    const response = await this.client.chat.completions.create(
      {
        model: "gpt-3.5-turbo-0125",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      },
      { signal }
    );

    return response.choices[0]?.message?.content || "";
  }
}

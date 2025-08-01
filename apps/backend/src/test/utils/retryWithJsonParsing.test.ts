import { describe, it, expect, vi, beforeEach } from "vitest";
import OpenAI from "openai";
import { z } from "zod";
import { OpenAIService } from "../../services/openaiService";

const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe("retryWithJsonParsing", () => {
  let mockOpenAI: OpenAI;
  let openaiService: OpenAIService;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    } as unknown as OpenAI;

    openaiService = new OpenAIService(mockOpenAI);
  });

  it("should succeed on first attempt", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: '{"name":"John","age":30}',
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    const result = await openaiService.runPromptWithJsonParsing(
      TestSchema,
      () => "Test prompt"
    );

    expect(result).toEqual({ name: "John", age: 30 });
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it("should succeed on retry after initial failure", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: '{"name":"John","age":30}',
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create)
      .mockRejectedValueOnce(new Error("Invalid JSON"))
      .mockResolvedValue(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

    const result = await openaiService.runPromptWithJsonParsing(
      TestSchema,
      () => "Test prompt"
    );

    expect(result).toEqual({ name: "John", age: 30 });
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it("should handle null responses when allowNull is true", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "null",
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    const result = await openaiService.runPromptWithJsonParsing(
      TestSchema,
      () => "Test prompt",
      true
    );

    expect(result).toBeUndefined();
  });

  it("should fail after max retries", async () => {
    vi.mocked(mockOpenAI.chat.completions.create).mockRejectedValue(
      new Error("API Error")
    );

    await expect(
      openaiService.runPromptWithJsonParsing(TestSchema, () => "Test prompt")
    ).rejects.toThrow("OpenAI service failed after 3 attempts");

    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(3);
  });

  it("should handle malformed JSON responses", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: '{"name":"John","age":30',
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    await expect(
      openaiService.runPromptWithJsonParsing(TestSchema, () => "Test prompt")
    ).rejects.toThrow("OpenAI service failed after 3 attempts");
  });
});

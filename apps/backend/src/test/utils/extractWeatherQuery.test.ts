import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractWeatherQueryFromUserInput } from "../../utils/extractWeatherQuery";
import { WeatherAPIQuery } from "../../types/WeatherAPIQuerySchema";
import { OpenAIService } from "../../services/openaiService";
import OpenAI from "openai";

vi.mock("../../utils/buildWeatherQueryPrompt", () => ({
  buildWeatherQueryPrompt: vi.fn(() => "Mock prompt"),
}));

describe("extractWeatherQueryFromUserInput", () => {
  const mockOpenAI = {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  };

  const mockOpenAIService = new OpenAIService(mockOpenAI as unknown as OpenAI);

  const mockWeatherQuery: WeatherAPIQuery = {
    q: "London",
    days: 3,
    alerts: "yes",
    aqi: "yes",
    lang: "en",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract weather query successfully", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify(mockWeatherQuery),
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    const result = await extractWeatherQueryFromUserInput(
      mockOpenAIService,
      "What is the weather in London?",
      "2024-01-01",
      "London, United Kingdom"
    );

    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
      model: "gpt-3.5-turbo-0125",
      temperature: 0,
      messages: [{ role: "user", content: "Mock prompt" }],
    });
    expect(result).toEqual(mockWeatherQuery);
  });

  it("should handle invalid JSON response", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "Invalid JSON",
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAIService,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("OpenAI service failed after 3 attempts");
  });

  it("should handle empty response content", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "",
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAIService,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("OpenAI service failed after 3 attempts");
  });

  it("should handle missing choices", async () => {
    const mockResponse = {
      choices: [],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAIService,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("OpenAI service failed after 3 attempts");
  });

  it("should handle missing message content", async () => {
    const mockResponse = {
      choices: [
        {
          message: {},
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAIService,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("OpenAI service failed after 3 attempts");
  });

  it("should handle malformed JSON", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content:
              '{"q": "London", "days": 3, "alerts": "yes", "aqi": "yes", "lang": "en"',
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAIService,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("OpenAI service failed after 3 attempts");
  });
});

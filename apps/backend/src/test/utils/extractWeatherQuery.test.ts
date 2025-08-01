/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractWeatherQueryFromUserInput } from "../../utils/extractWeatherQuery";
import { WeatherAPIQuery } from "../../types/WeatherAPIQuerySchema";

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
      mockResponse as any
    );

    const result = await extractWeatherQueryFromUserInput(
      mockOpenAI as any,
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
      mockResponse as any
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAI as any,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("Invalid WeatherAPI query generated from LLM");
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
      mockResponse as any
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAI as any,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("Invalid WeatherAPI query generated from LLM");
  });

  it("should handle missing choices in response", async () => {
    const mockResponse = {
      choices: [],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as any
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAI as any,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("Invalid WeatherAPI query generated from LLM");
  });

  it("should handle schema validation failure", async () => {
    const invalidQuery = {
      q: "London",
      days: "invalid",
    };

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify(invalidQuery),
          },
        },
      ],
    };

    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as any
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAI as any,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("Invalid WeatherAPI query generated from LLM");
  });

  it("should handle OpenAI API errors", async () => {
    vi.mocked(mockOpenAI.chat.completions.create).mockRejectedValue(
      new Error("OpenAI API error")
    );

    await expect(
      extractWeatherQueryFromUserInput(
        mockOpenAI as any,
        "What is the weather?",
        "2024-01-01",
        "London, United Kingdom"
      )
    ).rejects.toThrow("OpenAI API error");
  });
});

import { describe, it, expect, vi } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ExternalServiceError,
  TimeoutError,
  RateLimitError,
  handleAsyncError,
} from "../../utils/errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create AppError with default values", () => {
      const error = new AppError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("AppError");
    });

    it("should create AppError with custom values", () => {
      const error = new AppError("Custom error", 400, false);

      expect(error.message).toBe("Custom error");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
    });
  });

  describe("ValidationError", () => {
    it("should create ValidationError with default status code", () => {
      const error = new ValidationError("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    it("should create ValidationError with details", () => {
      const details = { field: "email", value: "invalid" };
      const error = new ValidationError("Invalid email", details);

      expect(error.details).toEqual(details);
    });
  });

  describe("AuthenticationError", () => {
    it("should create AuthenticationError with default message", () => {
      const error = new AuthenticationError();

      expect(error.message).toBe("Authentication failed");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("AuthenticationError");
    });

    it("should create AuthenticationError with custom message", () => {
      const error = new AuthenticationError("Invalid token");

      expect(error.message).toBe("Invalid token");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("NotFoundError", () => {
    it("should create NotFoundError with default message", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("NotFoundError");
    });

    it("should create NotFoundError with custom message", () => {
      const error = new NotFoundError("User not found");

      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("ExternalServiceError", () => {
    it("should create ExternalServiceError with service name", () => {
      const error = new ExternalServiceError("API failed", "Weather API");

      expect(error.message).toBe("API failed");
      expect(error.statusCode).toBe(502);
      expect(error.service).toBe("Weather API");
      expect(error.name).toBe("ExternalServiceError");
    });

    it("should create ExternalServiceError with original error", () => {
      const originalError = new Error("Network timeout");
      const error = new ExternalServiceError(
        "API failed",
        "Weather API",
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });
  });

  describe("TimeoutError", () => {
    it("should create TimeoutError with default message", () => {
      const error = new TimeoutError();

      expect(error.message).toBe("Request timed out");
      expect(error.statusCode).toBe(408);
      expect(error.name).toBe("TimeoutError");
    });

    it("should create TimeoutError with custom message", () => {
      const error = new TimeoutError("Database query timed out");

      expect(error.message).toBe("Database query timed out");
      expect(error.statusCode).toBe(408);
    });
  });

  describe("RateLimitError", () => {
    it("should create RateLimitError with default message", () => {
      const error = new RateLimitError();

      expect(error.message).toBe("Rate limit exceeded");
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe("RateLimitError");
    });

    it("should create RateLimitError with custom message", () => {
      const error = new RateLimitError("Too many requests per minute");

      expect(error.message).toBe("Too many requests per minute");
      expect(error.statusCode).toBe(429);
    });
  });
});

describe("handleAsyncError", () => {
  it("should return result when function succeeds", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const wrappedFn = handleAsyncError(mockFn);

    const result = await wrappedFn("arg1", "arg2");

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should rethrow AppError without modification", async () => {
    const appError = new ValidationError("Invalid input");
    const mockFn = vi.fn().mockRejectedValue(appError);
    const wrappedFn = handleAsyncError(mockFn);

    await expect(wrappedFn()).rejects.toThrow(appError);
  });

  it("should wrap non-AppError in AppError", async () => {
    const originalError = new Error("Database connection failed");
    const mockFn = vi.fn().mockRejectedValue(originalError);
    const wrappedFn = handleAsyncError(mockFn);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(wrappedFn()).rejects.toThrow("Internal server error");
    expect(consoleSpy).toHaveBeenCalledWith("Unexpected error:", originalError);

    consoleSpy.mockRestore();
  });

  it("should handle synchronous errors", async () => {
    const mockFn = vi.fn().mockImplementation(() => {
      throw new Error("Synchronous error");
    });
    const wrappedFn = handleAsyncError(mockFn);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(wrappedFn()).rejects.toThrow("Internal server error");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

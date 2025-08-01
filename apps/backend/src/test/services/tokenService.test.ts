import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TokenService } from "../../services/tokenService";

vi.mock("env-var", () => ({
  default: {
    get: vi.fn((key: string) => ({
      default: () => ({
        asString: () => {
          if (key === "ENCRYPTION_KEY")
            return "test-encryption-key-32-chars-long";
          return "test-value";
        },
      }),
    })),
  },
}));

describe("TokenService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateSessionId", () => {
    it("should generate a unique session ID", () => {
      const sessionId1 = TokenService.generateSessionId();
      const sessionId2 = TokenService.generateSessionId();

      expect(sessionId1).toBeDefined();
      expect(sessionId1).toHaveLength(64);
      expect(sessionId1).not.toBe(sessionId2);
      expect(sessionId1).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("storeTokens and getTokens", () => {
    it("should store and retrieve tokens successfully", () => {
      const sessionId = "test-session-id";
      const tokens = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      };

      TokenService.storeTokens(sessionId, tokens);
      const retrievedTokens = TokenService.getTokens(sessionId);

      expect(retrievedTokens).toEqual(tokens);
    });

    it("should return null for non-existent session", () => {
      const result = TokenService.getTokens("non-existent-session");
      expect(result).toBeNull();
    });

    it("should handle multiple sessions", () => {
      const session1 = "session-1";
      const session2 = "session-2";
      const tokens1 = {
        access_token: "token-1",
        refresh_token: "refresh-1",
        expires_in: 3600,
      };
      const tokens2 = {
        access_token: "token-2",
        refresh_token: "refresh-2",
        expires_in: 7200,
      };

      TokenService.storeTokens(session1, tokens1);
      TokenService.storeTokens(session2, tokens2);

      expect(TokenService.getTokens(session1)).toEqual(tokens1);
      expect(TokenService.getTokens(session2)).toEqual(tokens2);
    });
  });

  describe("removeTokens", () => {
    it("should remove tokens for a session", () => {
      const sessionId = "test-session-id";
      const tokens = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      };

      TokenService.storeTokens(sessionId, tokens);
      expect(TokenService.getTokens(sessionId)).toEqual(tokens);

      TokenService.removeTokens(sessionId);
      expect(TokenService.getTokens(sessionId)).toBeNull();
    });

    it("should handle removing non-existent session", () => {
      expect(() =>
        TokenService.removeTokens("non-existent-session")
      ).not.toThrow();
    });
  });

  describe("hasTokens", () => {
    it("should return true for existing session", () => {
      const sessionId = "test-session-id";
      const tokens = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      };

      TokenService.storeTokens(sessionId, tokens);
      expect(TokenService.hasTokens(sessionId)).toBe(true);
    });

    it("should return false for non-existent session", () => {
      expect(TokenService.hasTokens("non-existent-session")).toBe(false);
    });

    it("should return false after removing tokens", () => {
      const sessionId = "test-session-id";
      const tokens = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      };

      TokenService.storeTokens(sessionId, tokens);
      expect(TokenService.hasTokens(sessionId)).toBe(true);

      TokenService.removeTokens(sessionId);
      expect(TokenService.hasTokens(sessionId)).toBe(false);
    });
  });

  describe("encryption", () => {
    it("should encrypt and decrypt tokens correctly", () => {
      const sessionId = "test-session-id";
      const originalTokens = {
        access_token: "very-sensitive-access-token",
        refresh_token: "very-sensitive-refresh-token",
        expires_in: 3600,
      };

      TokenService.storeTokens(sessionId, originalTokens);
      const retrievedTokens = TokenService.getTokens(sessionId);

      expect(retrievedTokens).toEqual(originalTokens);
    });

    it("should handle special characters in tokens", () => {
      const sessionId = "test-session-id";
      const tokensWithSpecialChars = {
        access_token: "token-with-special-chars!@#$%^&*()",
        refresh_token: "refresh-with-special-chars!@#$%^&*()",
        expires_in: 3600,
      };

      TokenService.storeTokens(sessionId, tokensWithSpecialChars);
      const retrievedTokens = TokenService.getTokens(sessionId);

      expect(retrievedTokens).toEqual(tokensWithSpecialChars);
    });
  });
});

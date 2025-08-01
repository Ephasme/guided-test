import { describe, it, expect } from "vitest";
import { createRetryPromptBuilder } from "../../utils/createRetryPromptBuilder";

describe("createRetryPromptBuilder", () => {
  describe("createRetryPromptBuilder", () => {
    it("should return original prompt on first attempt", () => {
      const basePromptBuilder = () => "Test prompt";
      const retryBuilder = createRetryPromptBuilder(basePromptBuilder);

      const result = retryBuilder(1);

      expect(result).toBe("Test prompt");
    });

    it("should enhance prompt on retry attempts", () => {
      const basePromptBuilder = () => "Test prompt";
      const retryBuilder = createRetryPromptBuilder(basePromptBuilder);

      const result = retryBuilder(2);

      expect(result).toContain("⚠️ CRITICAL");
      expect(result).toContain("Test prompt");
    });

    it("should include null option when allowNull is true", () => {
      const basePromptBuilder = () => "Test prompt";
      const retryBuilder = createRetryPromptBuilder(basePromptBuilder, true);

      const result = retryBuilder(2);

      expect(result).toContain(" or 'null'");
    });

    it("should not include null option when allowNull is false", () => {
      const basePromptBuilder = () => "Test prompt";
      const retryBuilder = createRetryPromptBuilder(basePromptBuilder, false);

      const result = retryBuilder(2);

      expect(result).not.toContain(" or 'null'");
    });

    it("should include previous error message", () => {
      const basePromptBuilder = () => "Test prompt";
      const retryBuilder = createRetryPromptBuilder(basePromptBuilder);

      const result = retryBuilder(2, "Invalid JSON");

      expect(result).toContain('Previous response was invalid: "Invalid JSON"');
    });

    it("should use different prefixes for different attempts", () => {
      const basePromptBuilder = () => "Test prompt";
      const retryBuilder = createRetryPromptBuilder(basePromptBuilder);

      const attempt2 = retryBuilder(2);
      const attempt3 = retryBuilder(3);
      const attempt4 = retryBuilder(4);

      expect(attempt2).toContain("⚠️ CRITICAL");
      expect(attempt3).toContain("🚨 URGENT");
      expect(attempt4).toContain("💥 FINAL WARNING");
    });
  });
});

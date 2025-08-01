import { describe, it, expect } from "vitest";
import {
  validateAndFormatPhoneNumber,
  isValidPhoneNumber,
} from "../../utils/validatePhoneNumber";

describe("validateAndFormatPhoneNumber", () => {
  it("should format French phone numbers correctly", () => {
    expect(validateAndFormatPhoneNumber("0123456789")).toBe("+33123456789");
    expect(validateAndFormatPhoneNumber("0652942901")).toBe("+33652942901");
  });

  it("should handle international format", () => {
    expect(validateAndFormatPhoneNumber("+33123456789")).toBe("+33123456789");
    expect(validateAndFormatPhoneNumber("+12345678901")).toBe("+12345678901");
  });

  it("should handle 00 format", () => {
    expect(validateAndFormatPhoneNumber("0033123456789")).toBe("+33123456789");
  });

  it("should throw error for invalid formats", () => {
    expect(() => validateAndFormatPhoneNumber("123")).toThrow();
    expect(() => validateAndFormatPhoneNumber("01234567890")).toThrow();
    expect(() => validateAndFormatPhoneNumber("abc")).toThrow();
  });
});

describe("isValidPhoneNumber", () => {
  it("should return true for valid phone numbers", () => {
    expect(isValidPhoneNumber("0123456789")).toBe(true);
    expect(isValidPhoneNumber("+33123456789")).toBe(true);
    expect(isValidPhoneNumber("0652942901")).toBe(true);
  });

  it("should return false for invalid phone numbers", () => {
    expect(isValidPhoneNumber("123")).toBe(false);
    expect(isValidPhoneNumber("01234567890")).toBe(false);
    expect(isValidPhoneNumber("abc")).toBe(false);
  });
});

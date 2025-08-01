import { describe, it, expect } from "vitest";
import {
  validatePhoneNumber,
  formatPhoneNumberForDisplay,
} from "./validatePhoneNumber";

describe("validatePhoneNumber", () => {
  it("should validate French phone numbers", () => {
    expect(validatePhoneNumber("0123456789")).toEqual({ isValid: true });
    expect(validatePhoneNumber("0652942901")).toEqual({ isValid: true });
  });

  it("should validate international format", () => {
    expect(validatePhoneNumber("+33123456789")).toEqual({ isValid: true });
    expect(validatePhoneNumber("+12345678901")).toEqual({ isValid: true });
  });

  it("should validate 00 format", () => {
    expect(validatePhoneNumber("0033123456789")).toEqual({ isValid: true });
  });

  it("should reject invalid formats", () => {
    expect(validatePhoneNumber("123")).toEqual({
      isValid: false,
      error:
        "Invalid phone number format. Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)",
    });
    expect(validatePhoneNumber("01234567890")).toEqual({
      isValid: false,
      error:
        "Invalid phone number format. Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)",
    });
    expect(validatePhoneNumber("abc")).toEqual({
      isValid: false,
      error:
        "Invalid phone number format. Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)",
    });
  });

  it("should reject empty phone numbers", () => {
    expect(validatePhoneNumber("")).toEqual({
      isValid: false,
      error: "Phone number is required",
    });
  });
});

describe("formatPhoneNumberForDisplay", () => {
  it("should format French phone numbers for display", () => {
    expect(formatPhoneNumberForDisplay("0123456789")).toBe("+33123456789");
    expect(formatPhoneNumberForDisplay("0652942901")).toBe("+33652942901");
  });

  it("should keep international format as is", () => {
    expect(formatPhoneNumberForDisplay("+33123456789")).toBe("+33123456789");
    expect(formatPhoneNumberForDisplay("+12345678901")).toBe("+12345678901");
  });

  it("should return original for unrecognized formats", () => {
    expect(formatPhoneNumberForDisplay("123")).toBe("123");
  });
});

import { isValidPhoneNumber, formatNumber } from "libphonenumber-js";

export function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  error?: string;
} {
  if (!phoneNumber.trim()) {
    return { isValid: false, error: "Phone number is required" };
  }

  try {
    const isValid = isValidPhoneNumber(phoneNumber, "FR");
    if (!isValid) {
      return {
        isValid: false,
        error:
          "Invalid phone number format. Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)",
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error:
        "Invalid phone number format. Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)",
    };
  }
}

export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  try {
    if (isValidPhoneNumber(phoneNumber, "FR")) {
      return formatNumber(phoneNumber, "FR", "E.164");
    }
  } catch {
    // Fall through to return original
  }
  return phoneNumber;
}

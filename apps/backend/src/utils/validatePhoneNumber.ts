import {
  isValidPhoneNumber as isValidPhoneNumberLib,
  formatNumber,
} from "libphonenumber-js";

export function validateAndFormatPhoneNumber(phoneNumber: string): string {
  try {
    if (!isValidPhoneNumberLib(phoneNumber, "FR")) {
      throw new Error("Invalid phone number");
    }
    return formatNumber(phoneNumber, "FR", "E.164");
  } catch {
    throw new Error(
      "Invalid phone number format. Please use international format (e.g., +33123456789) or French format (e.g., 0123456789)"
    );
  }
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  try {
    return isValidPhoneNumberLib(phoneNumber, "FR");
  } catch {
    return false;
  }
}

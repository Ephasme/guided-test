import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSMS } from "../hooks/useSMS";
import {
  validatePhoneNumber,
  formatPhoneNumberForDisplay,
} from "../utils/validatePhoneNumber";

export function SMSRegistration() {
  const { sessionId, isAuthenticated } = useAuth();
  const {
    status,
    isLoadingStatus,
    statusError,
    registerSMSNotification,
    unregisterSMSNotification,
    isRegistering,
    isUnregistering,
    registerError,
    unregisterError,
  } = useSMS(sessionId);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!sessionId || !phoneNumber.trim()) return;

    const validation = validatePhoneNumber(phoneNumber.trim());
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid phone number format");
      return;
    }

    try {
      await registerSMSNotification(phoneNumber.trim());
      setPhoneNumber("");
      setValidationError(null);
    } catch (error) {
      console.error("Failed to register SMS:", error);
    }
  };

  const handleUnregister = async () => {
    if (!sessionId) return;

    try {
      await unregisterSMSNotification();
    } catch (error) {
      console.error("Failed to unregister SMS:", error);
    }
  };

  if (!sessionId || !isAuthenticated) {
    return null;
  }

  const isLoading = isLoadingStatus || isRegistering || isUnregistering;
  const error = statusError || registerError || unregisterError;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 mb-2">
          📱 SMS Weather Notifications
        </h3>
        <p className="text-sm text-gray-600">
          Get weather alerts before your meetings via SMS
        </p>
      </div>

      {status?.notificationsEnabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-800">
                ✅ SMS notifications enabled
              </p>
              <p className="text-xs text-green-600">
                {status.phoneNumber
                  ? formatPhoneNumberForDisplay(status.phoneNumber)
                  : ""}
              </p>
            </div>
            <button
              onClick={handleUnregister}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUnregistering ? "Disabling..." : "Disable"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (e.target.value.trim()) {
                  const validation = validatePhoneNumber(e.target.value.trim());
                  setValidationError(
                    validation.isValid ? null : validation.error || null
                  );
                } else {
                  setValidationError(null);
                }
              }}
              placeholder="+33123456789 or 0123456789"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleRegister}
              disabled={isLoading || !phoneNumber.trim() || !!validationError}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRegistering ? "Enabling..." : "Enable"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Enter your phone number to receive weather notifications before
            meetings
          </p>
          {validationError && (
            <p className="text-xs text-red-600">{validationError}</p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      )}
    </div>
  );
}

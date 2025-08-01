import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getPublicIP } from "../utils/getPublicIP";
import {
  validatePhoneNumber,
  formatPhoneNumberForDisplay,
} from "../utils/validatePhoneNumber";

interface SMSStatus {
  notificationsEnabled: boolean;
  phoneNumber?: string;
}

export function SMSRegistration() {
  const { sessionId } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SMSStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`http://localhost:3000/sms/status`, {
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setError(null);
      } else {
        setError("Failed to check SMS status");
      }
    } catch {
      setError("Failed to check SMS status");
    }
  }, [sessionId]);

  const registerSMS = async () => {
    if (!sessionId || !phoneNumber.trim()) return;

    const validation = validatePhoneNumber(phoneNumber.trim());
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid phone number format");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setValidationError(null);

    try {
      const clientIP = await getPublicIP();
      const response = await fetch(`http://localhost:3000/sms/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          clientIP,
        }),
      });

      if (response.ok) {
        setSuccess("SMS number registered successfully!");
        setPhoneNumber("");
        await checkStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to register SMS number");
      }
    } catch {
      setError("Failed to register SMS number");
    } finally {
      setIsLoading(false);
    }
  };

  const unregisterSMS = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:3000/sms/unregister`, {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        setSuccess("SMS number unregistered successfully!");
        await checkStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to unregister SMS number");
      }
    } catch {
      setError("Failed to unregister SMS number");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [sessionId, checkStatus]);

  if (!sessionId) {
    return null;
  }

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
              onClick={unregisterSMS}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Disabling..." : "Disable"}
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
              onClick={registerSMS}
              disabled={isLoading || !phoneNumber.trim() || !!validationError}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Enabling..." : "Enable"}
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
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
    </div>
  );
}

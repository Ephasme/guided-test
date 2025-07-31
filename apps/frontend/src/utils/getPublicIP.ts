export const getPublicIP = async (): Promise<string> => {
  const maxRetries = 3;
  const timeout = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch("https://api.ipify.org?format=json", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object" || typeof data.ip !== "string") {
        throw new Error("Invalid response format from IP service");
      }

      return data.ip;
    } catch (error) {
      console.error(`IP lookup attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(
          "Unable to determine public IP address after multiple attempts"
        );
      }

      if (error instanceof Error && error.name === "AbortError") {
        console.warn("IP lookup timed out, retrying...");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Unable to determine public IP address");
};

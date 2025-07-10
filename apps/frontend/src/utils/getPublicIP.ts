export const getPublicIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to get public IP:", error);
    throw new Error("Unable to determine public IP address");
  }
};

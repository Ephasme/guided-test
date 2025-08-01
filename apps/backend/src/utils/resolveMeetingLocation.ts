export async function resolveMeetingLocation(
  meetingLocation: string,
  userDefaultLocation?: string
): Promise<string> {
  if (meetingLocation && meetingLocation.trim()) {
    return meetingLocation.trim();
  }

  if (userDefaultLocation) {
    return userDefaultLocation;
  }

  throw new Error("No location available for weather notification");
}

import { NotificationWeatherContext } from "../types/NotificationWeather";

export function buildNotificationWeatherQueryPrompt(
  context: NotificationWeatherContext
): string {
  return `You are a weather assistant helping to get weather data for a meeting notification.

Meeting Details:
- Location: ${context.meetingLocation}
- Time: ${context.meetingTime.toISOString()}
- Timezone: ${context.userTimezone}
- Duration: ${context.meetingDuration || 60} minutes

Generate a WeatherAPI query that will get the most relevant weather data for this meeting.
Focus on:
- Weather conditions during the meeting time
- Any weather alerts or warnings
- Temperature and precipitation for the meeting duration
- Wind conditions if relevant

Return a JSON object with the following structure:
{
  "q": "location string",
  "days": number of days to forecast,
  "hour": specific hour if needed,
  "dt": specific date if needed,
  "alerts": "yes",
  "aqi": "yes"
}`;
}

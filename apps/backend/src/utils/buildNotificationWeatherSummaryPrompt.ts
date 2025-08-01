import { NotificationWeatherContext } from "../types/NotificationWeather";

export function buildNotificationWeatherSummaryPrompt(
  context: NotificationWeatherContext
): string {
  return `You are creating a weather notification for an SMS message that will be sent 1 hour before a meeting.

Meeting Details:
- Location: ${context.meetingLocation || "Unknown location"}
- Time: ${context.meetingTime.toLocaleString()}
- Duration: ${context.meetingDuration} minutes
- User Timezone: ${context.userTimezone}

Your task is to provide actionable weather advice for this meeting. Consider:
1. The weather conditions at the meeting time and location
2. How the weather might affect travel to the meeting
3. What the person should bring or prepare for
4. Any weather-related considerations for the meeting itself

Provide a concise, actionable message that would be helpful to receive 1 hour before the meeting. Keep it under 160 characters for SMS compatibility.

Respond with a JSON object in this exact format:
{
  "weatherSummary": "Brief weather summary for the meeting time and location",
  "actionableAdvice": "Specific advice on what to bring or prepare for",
  "severity": "low|medium|high",
  "relevantAlerts": ["Any weather alerts or warnings"]
}

The severity should be:
- "low" for minor weather concerns
- "medium" for moderate weather issues
- "high" for significant weather problems

Respond ONLY with the JSON object. No extra text.`;
}

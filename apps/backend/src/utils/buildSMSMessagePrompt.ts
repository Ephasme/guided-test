import { NotificationWeatherResult } from "../types/NotificationWeather";

export function buildSMSMessagePrompt(
  meetingTitle: string,
  meetingTime: string,
  weatherResult: NotificationWeatherResult
): string {
  return `You are creating a weather notification SMS message for a meeting. The message should be:

- Short (1-2 sentences maximum)
- Actionable (tell them what to bring: umbrella, hat, sunscreen, etc.)
- Go straight to the point
- Mention any extreme weather (huge rain, hardcore heat, storms) with clear warnings
- Have a friendly, helpful tone

Meeting Details:
- Title: ${meetingTitle}
- Time: ${meetingTime}

Weather Information:
- Summary: ${weatherResult.weatherSummary}
- Actionable Advice: ${weatherResult.actionableAdvice}
- Severity: ${weatherResult.severity}
- Alerts: ${weatherResult.relevantAlerts?.join(", ") || "None"}

Generate a single, concise SMS message that combines this information. Keep it under 160 characters and make it immediately useful to someone heading to a meeting.`;
}

import { WeatherAPIResponse } from "../types/WeatherAPIResponse";
import { CalendarResult } from "../types/CalendarResult";

export function buildWeatherResponsePrompt(
  weatherData: WeatherAPIResponse,
  originalQuery: string,
  calendarData?: CalendarResult
): string {
  let prompt = `You are a helpful weather assistant. Your task is to analyze weather data and provide a clear, conversational response to the user's original query.

📊 Weather Data:
${JSON.stringify(weatherData, null, 2)}

🎯 Original User Query: "${originalQuery}"`;

  if (calendarData) {
    prompt += `

📅 Calendar Data:
${JSON.stringify(calendarData, null, 2)}

📝 Instructions:
- Provide a natural, conversational response that directly answers the user's question
- Include relevant weather details like temperature, conditions, precipitation chance, etc.
- If the user asked about specific times or dates, focus on those periods
- If there are weather alerts, mention them prominently
- Use appropriate units (Celsius/Fahrenheit based on the data)
- Be helpful and informative, but keep it conversational
- If calendar data is available, incorporate it into your response when relevant
- If the user asked about scheduling or calendar-related weather planning, use the calendar data to provide more personalized advice
- If the data doesn't contain what the user asked for, explain what information is available instead

Respond in a friendly, helpful tone as if you're talking to a friend about the weather.`;
  } else {
    prompt += `

📝 Instructions:
- Provide a natural, conversational response that directly answers the user's question
- Include relevant weather details like temperature, conditions, precipitation chance, etc.
- If the user asked about specific times or dates, focus on those periods
- If there are weather alerts, mention them prominently
- Use appropriate units (Celsius/Fahrenheit based on the data)
- Be helpful and informative, but keep it conversational
- If the data doesn't contain what the user asked for, explain what information is available instead

Respond in a friendly, helpful tone as if you're talking to a friend about the weather.`;
  }

  return prompt;
}

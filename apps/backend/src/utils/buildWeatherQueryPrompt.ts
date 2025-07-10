export function buildWeatherQueryPrompt(
  userQuery: string,
  today: string,
  locationName: string
): string {
  return `You are a weather assistant.

Your task is to convert a user's natural language weather request into a JSON object compatible with the WeatherAPI \`forecast.json\` endpoint.

📅 Today's date is: ${today}

📘 JSON schema:
{
  "q": "string",            // required: location (city name or coordinates)
  "days": number,           // 1–14
  "dt": "YYYY-MM-DD",       // optional: resolved from relative dates like "tomorrow"
  "hour": number,           // optional: 0–23
  "alerts": "yes" | "no",   // optional
  "aqi": "yes" | "no",      // optional
  "lang": "en"              // required: inferred from user query
}

⚠️ Rules:
- If no location is given by the user, use "${locationName}"
- If the user uses relative dates like "tomorrow", resolve them based on: ${today}
- Always include: "alerts": "yes", "aqi": "yes"
- Use "days": 1 unless user asks for multiple days
- Infer "lang" from the user query

Respond ONLY with the JSON object. No extra text.

User query: "${userQuery}"`;
}

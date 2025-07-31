import { DateTime } from "luxon";

export function buildCalendarActionPrompt(
  userQuery: string,
  weatherInfo?: string
): string {
  const now = DateTime.now();
  const today = now.startOf("day");
  const tomorrow = today.plus({ days: 1 });
  const endOfToday = today.endOf("day");
  const endOfTomorrow = tomorrow.endOf("day");

  return `You are a calendar assistant. Analyze the user's request and determine if they need calendar data to fulfill their request.

If the user's request requires calendar data (whether for calendar operations, weather queries, or any other purpose), respond with a JSON object describing what calendar data they need. If no calendar data is needed, respond with "null".

IMPORTANT: Always use actual ISO 8601 datetime strings (e.g., "2024-01-15T10:30:00Z") for timeMin and timeMax values.

AVAILABLE CALENDAR OPERATIONS:

1. Create a new event:
   {
     "action": "create",
     "event": {
       "summary": string,
       "start": { "dateTime": string (ISO 8601), "timeZone": string },
       "end": { "dateTime": string (ISO 8601), "timeZone": string },
       "description": string (optional),
       "location": string (optional),
       "attendees": [{ "email": string }] (optional),
       "reminders": { "useDefault": boolean } (optional)
     }
   }

2. Find/retrieve events (for any purpose that needs calendar data):
   {
     "action": "find",
     "query": {
       "timeMin": string (ISO 8601, optional),
       "timeMax": string (ISO 8601, optional),
       "searchTerm": string (optional),
       "maxResults": number (optional, default: 10),
       "orderBy": "startTime" (optional)
     }
   }

3. Get a specific event by ID:
   {
     "action": "get",
     "eventId": string
   }

EXAMPLES:
- "Add a meeting with John tomorrow at 2pm" → create event
- "What's my next meeting?" → find events with timeMin: "${now.toISO()}", orderBy: "startTime"
- "Show my meetings with John" → find events with searchTerm: "John"
- "What meetings do I have today?" → find events with timeMin: "${today.toISO()}", timeMax: "${endOfToday.toISO()}"
- "What's on my calendar tomorrow?" → find events with timeMin: "${tomorrow.toISO()}", timeMax: "${endOfTomorrow.toISO()}"
- "Get event abc123" → get specific event
- "What's the weather for my next meeting?" → find events with timeMin: "${now.toISO()}", orderBy: "startTime", maxResults: 1
- "What's the weather?" → null (no calendar data needed)

User query: "${userQuery}"
Weather info: "${weatherInfo || "None"}"`;
}

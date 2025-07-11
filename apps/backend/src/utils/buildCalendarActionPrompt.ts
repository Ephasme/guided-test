export function buildCalendarActionPrompt(
  userQuery: string,
  weatherInfo?: string
): string {
  return `You are a calendar assistant. Analyze the user's request and determine if they want to interact with their calendar.

If the user wants to interact with their calendar, respond with a JSON object describing what they want to do. If no calendar interaction is needed, respond with "null".

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

2. Find/retrieve events:
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
- "What's my next meeting?" → find events with timeMin: now, orderBy: "startTime"
- "Show my meetings with John" → find events with searchTerm: "John"
- "What's the weather for my next meeting?" → find events to get next meeting
- "Get event abc123" → get specific event
- "What's the weather?" → null (no calendar action)

User query: "${userQuery}"
Weather info: "${weatherInfo || "None"}"`;
}

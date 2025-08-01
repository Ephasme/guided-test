# Backend Service

This is the backend service for the weather notification system.

## Features

- Weather data fetching and processing
- Google Calendar integration
- SMS notifications via Twilio
- OpenAI-powered message generation

## SMS Notification System

The SMS notification system uses OpenAI to generate personalized, actionable weather messages. Instead of simple string interpolation, the system now:

1. **Fetches weather data** for the meeting location and time
2. **Generates a personalized message** using OpenAI with specific requirements:
   - Short (1-2 sentences maximum)
   - Actionable (bring umbrella, hat, sunscreen, etc.)
   - Goes straight to the point
   - Mentions extreme weather with clear warnings
   - Has a friendly, helpful tone
3. **Sends the message** via Twilio SMS

### Message Generation

The system uses the following utility:

- `buildSMSMessagePrompt.ts` - Creates the prompt for OpenAI with specific requirements

The message generation logic is encapsulated within the `NotificationService` as a private method, ensuring proper separation of concerns.

The generated messages are:

- Limited to 160 characters for SMS compatibility
- Personalized based on meeting details and weather conditions
- Focused on actionable advice for the user

### Example Messages

Instead of: "Weather update for Team Meeting at 2:00 PM: Bring an umbrella and light jacket"

The system now generates messages like:

- "Bring an umbrella for your meeting - light rain expected!"
- "Stay hydrated! Extreme heat warning for your 2pm meeting"
- "Dress warmly - cold front moving in before your meeting"

## Architecture

The system follows a clean separation of concerns:

- **TwilioService**: Generic SMS sending service that only handles Twilio API communication
- **NotificationService**: Orchestrates the notification flow, including message generation using OpenAI
- **Weather Services**: Handle weather data fetching and processing
- **Calendar Services**: Manage Google Calendar integration

## Environment Variables

Required environment variables:

- `OPENAI_API_KEY` - OpenAI API key for message generation
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number for sending SMS

## Development

```bash
pnpm install
pnpm test
pnpm dev
```

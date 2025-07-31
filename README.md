# Weather Assistant

A modern weather application that provides natural language weather queries with Google Calendar integration.

## 🚀 Features

- **Natural Language Queries**: Ask weather questions in plain English
- **Google Calendar Integration**: Get weather context for your meetings
- **Real-time Weather Data**: Powered by WeatherAPI
- **AI-Powered Responses**: Uses OpenAI to provide humanized weather information
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🏗️ Architecture

This is a monorepo built with:

- **Backend**: Fastify + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Shared**: Common types and schemas
- **Build Tool**: Turbo for monorepo management

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd guided-test
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # Backend
   cp apps/backend/env.example apps/backend/.env
   # Edit apps/backend/.env with your API keys
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

## 🔧 Configuration

### Required Environment Variables

#### Backend (apps/backend/.env)

```env
# Weather API
WEATHER_API_URL=https://api.weatherapi.com/v1/forecast.json
WEATHER_API_KEY=your_weather_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
```

## 🚀 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start all services in development mode

# Building
pnpm build        # Build all packages and applications

# Linting
pnpm lint         # Lint all packages and applications

# Cleaning
pnpm clean        # Clean all build artifacts
```

### Project Structure

```
guided-test/
├── apps/
│   ├── backend/          # Fastify API server
│   └── frontend/         # React application
├── packages/
│   └── shared/           # Shared types and schemas
└── Bruno/               # API testing collection
```

## 🧪 Testing

The project includes Bruno API testing collection for backend endpoints.

## 📝 API Documentation

### Weather Endpoint

`GET /weather`

Query parameters:

- `query` (required): Natural language weather query
- `clientIP` (optional): Client IP address
- `sessionId` (optional): Google Calendar session ID

### Auth Endpoints

- `GET /auth/callback` - Google OAuth callback
- `GET /auth/session/:sessionId` - Check session status
- `DELETE /auth/session/:sessionId` - Delete session

## 🔒 Security Considerations

- Tokens are encrypted and stored in memory (consider Redis for production)
- OAuth state validation prevents CSRF attacks
- Input validation using Zod schemas
- CORS configured for frontend communication

## 🚀 Deployment

### Backend Deployment

1. Build the application: `pnpm build`
2. Set production environment variables
3. Start the server: `pnpm start`

### Frontend Deployment

1. Build the application: `pnpm build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

ISC

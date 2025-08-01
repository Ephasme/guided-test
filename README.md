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

## 📦 Installation & Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 8.15.0 or higher (recommended package manager)

### 1. Clone and Install

```bash
# Clone the repository
git clone git@github.com:Ephasme/guided-test.git
cd guided-test

# Install dependencies
pnpm install
```

### 2. Environment Configuration

```bash
# Backend: Copy the environment example file
cp apps/backend/.env.example apps/backend/.env

# Frontend: Copy the environment example file
cp apps/frontend/.env.example apps/frontend/.env

# Edit both .env files with your API keys
```

#### Backend Environment Variables

Edit `apps/backend/.env` with your actual API keys:

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

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

#### Frontend Environment Variables

Edit `apps/frontend/.env` with your frontend configuration:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# OAuth Redirect URI (optional, defaults to http://localhost:3000/auth/callback)
VITE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google API Scopes (optional, defaults to calendar.readonly)
VITE_GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar.readonly
```

### 3. Start Development Servers

```bash
# Start all services in development mode
pnpm dev
```

This will start:

- **Backend**: Fastify server on port 3000
- **Frontend**: Vite dev server (typically on port 5173)
- **Shared library**: Build process in watch mode

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start all services in development mode

# Building
pnpm build        # Build all packages and applications

# Linting
pnpm lint         # Lint all packages and applications

# Testing
pnpm test         # Run all tests once
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Run tests with coverage report

# Cleaning
pnpm clean        # Clean all build artifacts
```

### Project Structure

```
guided-test/
├── apps/
│   ├── backend/          # Fastify API server
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── utils/    # Helper functions
│   │   │   └── types/    # Type definitions
│   │   └── test/         # Comprehensive test suite
│   │       ├── routes/   # Route integration tests
│   │       ├── services/ # Service unit tests
│   │       └── utils/    # Utility function tests
│   └── frontend/         # React application
│       ├── src/
│       │   ├── api/      # API client
│       │   ├── hooks/    # React hooks
│       │   └── utils/    # Frontend utilities
├── packages/
│   └── shared/           # Shared types and schemas
└── Bruno/               # API testing collection
```

## 🧪 Testing

The project includes a comprehensive test suite built with Vitest.

### Running Tests

```bash
# Run all tests once (non-watch mode)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test file
pnpm test apps/backend/test/routes/weather.test.ts
```

The test suite also includes Bruno API testing collection for manual API endpoint testing.

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

# Weather Assistant

A modern weather application that provides natural language weather queries with Google Calendar integration and SMS notifications.

## 🚀 Features

- **Natural Language Queries**: Ask weather questions in plain English
- **Google Calendar Integration**: Get weather context for your meetings
- **SMS Notifications**: Receive weather alerts for upcoming meetings via SMS
- **Real-time Weather Data**: Powered by WeatherAPI
- **AI-Powered Responses**: Uses OpenAI to provide humanized weather information
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🏗️ Architecture

This is a monorepo built with:

- **Backend**: Fastify + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Shared**: Common types and schemas
- **Build Tool**: Turbo for monorepo management

### 🤖 OpenAI Integration

The backend leverages OpenAI's GPT-3.5-turbo to intelligently process weather requests through a sophisticated prompt engineering system:

#### **Weather Query Processing**

1. **Natural Language Parsing**: User queries like "What's the weather like tomorrow?" are processed by OpenAI to extract structured WeatherAPI parameters
2. **Prompt Engineering**: The system uses carefully crafted prompts that include:
   - JSON schema definitions for WeatherAPI compatibility
   - Context about current date and user location
   - Rules for handling relative dates and location inference
3. **JSON Validation**: Responses are validated against Zod schemas to ensure API compatibility

#### **Weather Response Generation**

1. **Data Humanization**: Raw weather data from WeatherAPI is transformed into conversational responses
2. **Context Integration**: Calendar data (when available) is incorporated to provide personalized weather advice
3. **Multi-step Processing**:
   - Extract weather query parameters from user input
   - Fetch weather data from WeatherAPI
   - Generate humanized weather summaries
   - Integrate calendar actions when relevant

#### **Error Handling & Retry Logic**

- Automatic retry mechanism with exponential backoff
- JSON parsing validation with fallback strategies
- Timeout protection implemented at the service level (15-30 second limits)
- Limited graceful degradation: calendar actions fail silently, but weather query parsing and response generation fail completely when OpenAI is unavailable

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

### 3. Start Development Servers

```bash
# Start all services in development mode
pnpm dev
```

This will start:

- **Backend**: Fastify server on port 3000 (includes notification service)
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
│   │   │   ├── routes/   # API endpoints (weather, auth, sms)
│   │   │   ├── services/ # Business logic (calendar, notification, twilio)
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

### SMS Endpoints

- `POST /register` - Register phone number for SMS notifications

  - Headers: `x-session-id` (required)
  - Body: `{ phoneNumber: string, clientIP?: string }`

- `DELETE /unregister` - Unregister phone number from SMS notifications

  - Headers: `x-session-id` (required)

- `GET /status` - Get SMS notification status
  - Headers: `x-session-id` (required)

## 🔔 SMS Notifications

The application includes an automated SMS notification system that:

- **Monitors Calendar**: Checks for upcoming meetings in the next 1-2 hours
- **Weather Integration**: Fetches weather data for meeting locations
- **AI-Generated Messages**: Uses OpenAI to create personalized weather alerts
- **Twilio Integration**: Sends SMS messages via Twilio service
- **User Management**: Tracks user phone numbers and notification preferences

## 🔒 Security Considerations

- Tokens are encrypted and stored in memory (consider Redis for production)
- OAuth state validation prevents CSRF attacks
- Input validation using Zod schemas
- CORS configured for frontend communication
- Phone number validation and formatting

## 🚀 Production Readiness

This application is currently designed for development and demonstration purposes. Here are the key improvements needed to make it production-ready:

### 🗄️ Infrastructure & Data Management

- **Database Migration**: Replace in-memory storage with PostgreSQL for user data, sessions, and notification history
- **Redis Integration**: Use Redis for session management, caching, and job queues
- **Environment Management**: Implement proper environment configuration for different deployment stages
- **Containerization**: Dockerize the application for consistent deployment across environments
- **Load Balancing**: Implement horizontal scaling with load balancers for high availability

### 🔄 Notification Service Architecture

- **Separate Service**: Extract notification service into its own microservice
- **Job Scheduling**: Use CRON or a job scheduler (like Bull/BullMQ) for periodic notification checks
- **Queue Management**: Implement message queues (Redis/Bull) for reliable SMS delivery
- **Retry Logic**: Add exponential backoff and dead letter queues for failed notifications
- **Rate Limiting**: Implement SMS rate limiting to prevent abuse and control costs

### 🔐 Security Enhancements

- **HTTPS Enforcement**: Ensure all communications use HTTPS in production
- **API Rate Limiting**: Implement rate limiting for all API endpoints
- **Input Sanitization**: Add comprehensive input validation and sanitization
- **Audit Logging**: Implement detailed audit trails for user actions
- **Secrets Management**: Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)
- **CORS Configuration**: Restrict CORS to specific domains in production

### 📱 Mobile Application

- **React Native App**: Create a mobile application for better user experience
- **Push Notifications**: Implement push notifications alongside SMS
- **Offline Support**: Add offline capabilities for weather data caching
- **Native Calendar Integration**: Direct calendar access on mobile devices
- **Biometric Authentication**: Add fingerprint/face ID authentication

### 🔧 Technical Improvements

- **Monitoring & Observability**:

  - Implement APM (Application Performance Monitoring)
  - Add structured logging with correlation IDs
  - Set up health checks and readiness probes
  - Implement distributed tracing

- **Error Handling & Resilience**:

  - Circuit breaker pattern for external API calls
  - Graceful degradation when services are unavailable
  - Comprehensive error boundaries and fallback mechanisms

- **Performance Optimization**:
  - Implement caching layers (Redis, CDN)
  - Database query optimization and indexing
  - API response compression
  - Image optimization for weather icons

### 💼 Business Features

- **User Management**:

  - User registration and authentication system
  - Subscription management and billing integration
  - User preferences and customization options
  - Multi-tenant support for B2B customers

- **Analytics & Insights**:

  - Usage analytics and user behavior tracking
  - Weather data analytics and trends
  - Notification effectiveness metrics
  - A/B testing framework

- **Content & Localization**:
  - Multi-language support
  - Regional weather alerts and warnings
  - Customizable notification templates
  - Weather education content

### 🌐 API & Integration Enhancements

- **API Versioning**: Implement proper API versioning strategy
- **Webhook Support**: Allow external systems to subscribe to weather events
- **Third-party Integrations**:
  - Slack/Discord notifications
  - Email notifications as fallback
  - IFTTT/Zapier integration
  - Smart home device integration (Nest, Philips Hue)

### 📊 Data & Analytics

- **Weather Data Storage**: Store historical weather data for analytics
- **User Behavior Analytics**: Track how users interact with weather information
- **Predictive Analytics**: Implement ML models for weather prediction accuracy
- **Data Export**: Allow users to export their weather history

### 🚀 Deployment & DevOps

- **CI/CD Pipeline**: Automated testing and deployment
- **Infrastructure as Code**: Terraform/CloudFormation for infrastructure
- **Blue-Green Deployments**: Zero-downtime deployment strategy
- **Auto-scaling**: Automatic scaling based on load
- **Disaster Recovery**: Backup and recovery procedures

### 💰 Monetization & Business Model

- **Freemium Model**: Basic features free, premium features paid
- **API Access**: Provide API access for developers
- **White-label Solutions**: Allow businesses to rebrand the service
- **Weather Data Licensing**: Sell weather data insights to businesses
- **Partnership Opportunities**: Collaborate with weather stations and meteorologists

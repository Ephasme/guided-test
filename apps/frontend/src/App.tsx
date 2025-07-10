import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWeatherQuery } from "./hooks/useWeatherQuery";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function WeatherApp() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const weatherQuery = useWeatherQuery(submittedQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setSubmittedQuery(example);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌤️ Weather Assistant
          </h1>
          <p className="text-gray-600">
            Ask me anything about the weather in natural language
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What's the weather like tomorrow? Will it rain this weekend?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={weatherQuery.isFetching}
            />
            <button
              type="submit"
              disabled={weatherQuery.isFetching || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {weatherQuery.isFetching ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                "Ask Weather"
              )}
            </button>
          </div>
        </form>

        {/* Quick Examples */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What's the weather like tomorrow?",
              "Will it rain this weekend?",
              "How hot will it be next week?",
              "Is it going to snow?",
            ].map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                disabled={weatherQuery.isFetching}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {weatherQuery.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800 font-medium">Error:</span>
              <span className="text-red-700">
                {weatherQuery.error instanceof Error
                  ? weatherQuery.error.message
                  : "An error occurred"}
              </span>
            </div>
          </div>
        )}

        {/* Weather Results */}
        {weatherQuery.data && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {weatherQuery.data.forecast}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}

export default App;

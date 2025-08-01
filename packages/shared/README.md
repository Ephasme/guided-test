# @guided/shared

Shared TypeScript types and schemas for the guided-test project.

## Development

To start the development mode with automatic rebuilding:

```bash
pnpm dev
```

This will watch for changes in the source files and automatically rebuild the package.

## Build

To build the package once:

```bash
pnpm build
```

## Clean

To clean the build output:

```bash
pnpm clean
```

## Usage

The package exports TypeScript types and Zod schemas that can be used across the frontend and backend applications.

### Available Exports

- `WeatherQuerySchema` - Zod schema for weather query validation
- `WeatherResponseSchema` - Zod schema for weather response validation
- `WeatherResponse` - TypeScript type for weather response

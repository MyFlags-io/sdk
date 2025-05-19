# @myflags/next

Next.js bindings for MyFlags SDK. This package provides Next.js-specific functionality for feature flag management, including SSR support and automatic revalidation.

## Installation

```bash
npm install @myflags/next
# or
yarn add @myflags/next
# or
pnpm add @myflags/next
```

## Quick Start

First, wrap your application with the `MyFlagsProvider`:

```tsx
// app/layout.tsx
import { MyFlagsProvider } from "@myflags/next/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MyFlagsProvider
      config={{
        apiKey: "your-api-key",
        projectId: "your-project-id",
        environment: "production",
        retryCount: 3, // Optional, defaults to 3 retries
        retryDelay: 1000, // Optional, delay between retries in milliseconds
      }}
    >
      {children}
    </MyFlagsProvider>
  );
}
```

Or with combination with the server side initial flags rendering:

```tsx
// app/page.tsx
import { type MyFlagsConfig } from "@myflags/next";
import { getServerSideFlags } from "@myflags/next/server";
import { MyFlagsProvider } from "@myflags/next/client";

const config: MyFlagsConfig = {
  apiKey: "your-api-key",
  projectId: "your-project-id",
  environment: "production",
  retryCount: 3, // Optional, defaults to 3 retries
  retryDelay: 1000, // Optional, delay between retries in milliseconds
};

export default async function Page() {
  const defaultFlags = await getServerSideFlags(config);

  return (
    <MyFlagsProvider defaultFlags={defaultFlags} config={config}>
      {children}
    </MyFlagsProvider>
  );
}
```

## Usage

### Client-side Components

```tsx
"use client";

import { useFlag, useFlags } from "@myflags/next/client";

function MyComponent() {
  // Get a single flag
  const isNewFeatureEnabled = useFlag("new_feature");

  // Or get all flags
  const flags = useFlags();

  return (
    <div>
      {isNewFeatureEnabled && <NewFeatureComponent />}
      {/* or */}
      {flags.newFeature && <NewFeatureComponent />}
    </div>
  );
}
```

### Server Components (App Router)

```tsx
import { getServerSideFlags } from "@myflags/next/server";

export default async function Page() {
  const flags = await getServerSideFlags({
    apiKey: "your-api-key",
    projectId: "your-project-id",
    environment: "production",
    retryCount: 3, // Optional, defaults to 3 retries
    retryDelay: 1000, // Optional, delay between retries in milliseconds
  });

  return <div>{flags.newFeature && <NewFeatureComponent />}</div>;
}
```

### API Routes

```tsx
import { getApiFlags } from "@myflags/next/server";

export default async function handler(req, res) {
  const flags = await getApiFlags({
    apiKey: "your-api-key",
    projectId: "your-project-id",
    environment: "production",
    retryCount: 3, // Optional, defaults to 3 retries
    retryDelay: 1000, // Optional, delay between retries in milliseconds
  });

  res.status(200).json(flags);
}
```

## Configuration

The configuration object accepts the following properties:

```typescript
interface MyFlagsConfig {
  apiKey: string;
  projectId: string;
  environment: string;
  refreshInterval?: number; // Optional, defaults to 10 minutes (600000ms)
  retryCount?: number; // Optional, defaults to 3 retries for failed API requests
  retryDelay?: number; // Optional, defaults to 1000ms delay between retries
}
```

## Features

- **SSR Support**: Works seamlessly with Next.js server-side rendering
- **Automatic Revalidation**: Flags are automatically updated when changes occur
- **Type Safety**: Full TypeScript support
- **Efficient Caching**: Server-side caching to minimize API calls
- **React Hooks**: Easy-to-use hooks for client-side components
- **App Router Support**: Compatible with Next.js App Router
- **Pages Router Support**: Compatible with Next.js Pages Router

## API Reference

### Hooks

#### `useFlag(key: string, defaultValue?: boolean)`

Returns the value of a single flag.

```tsx
const isEnabled = useFlag("feature-key", false);
```

#### `useFlags()`

Returns all flags.

```tsx
const flags = useFlags();
```

### Server Functions

#### `getServerSideFlags(config: MyFlagsConfig)`

Retrieves flags on the server side.

```tsx
const flags = await getServerSideFlags(config);
```

#### `getApiFlags(config: MyFlagsConfig)`

Retrieves flags in API routes.

```tsx
const flags = await getApiFlags(config);
```

### Components

#### `MyFlagsProvider`

Provider component that manages the flags state.

```tsx
<MyFlagsProvider config={config}>{children}</MyFlagsProvider>
```

## License

MIT

# MyFlags SDK

[![Website](https://img.shields.io/badge/website-myflags.io-blue)](https://myflags.io)
[![npm](https://img.shields.io/npm/v/@myflags/core)](https://www.npmjs.com/package/@myflags/core)
[![npm](https://img.shields.io/npm/v/@myflags/react)](https://www.npmjs.com/package/@myflags/react)
[![npm](https://img.shields.io/npm/v/@myflags/next)](https://www.npmjs.com/package/@myflags/next)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **MyFlags** - The modern way to manage feature flags in your applications. Ship features faster, control releases with confidence, and deliver better user experiences.

## 📋 Overview

This monorepo contains the official SDK packages for [MyFlags](https://myflags.io), a powerful feature flag management platform. The SDK provides easy integration with your applications to help you manage feature flags, conduct A/B testing, and implement controlled rollouts.

## 📦 Packages

| Package | Description |
|---------|-------------|
| [@myflags/core](./packages/core) | Core functionality for feature flag management |
| [@myflags/react](./packages/react) | React bindings for the MyFlags SDK |
| [@myflags/next](./packages/next) | Next.js integration for the MyFlags SDK |

## 🚀 Getting Started

### Installation

Choose the package that best fits your project:

```bash
# Core package (for vanilla JS/TS projects)
npm install @myflags/core

# React integration
npm install @myflags/react

# Next.js integration
npm install @myflags/next
```

You can also use yarn or pnpm:

```bash
# Using yarn
yarn add @myflags/core

# Using pnpm
pnpm add @myflags/core
```

### Basic Usage

#### Core SDK

```typescript
import { MyFlagsSDK } from "@myflags/core";

// Initialize the SDK
const sdk = new MyFlagsSDK({
  apiKey: "your-api-key",
  projectId: "your-project-id",
  environment: "production",
});

// Check if a feature is enabled
const isFeatureEnabled = await sdk.getFlag("feature_key");

if (isFeatureEnabled) {
  // Feature is enabled
  showNewFeature();
} else {
  // Feature is disabled
  showExistingFeature();
}
```

#### React Integration

```tsx
import { MyFlagsProvider, useFlag } from "@myflags/react";

function App() {
  return (
    <MyFlagsProvider
      apiKey="your-api-key"
      projectId="your-project-id"
      environment="production"
    >
      <YourComponents />
    </MyFlagsProvider>
  );
}

function FeatureComponent() {
  // Use the hook to get flag value
  const isFeatureEnabled = useFlag("feature_key");
  
  return (
    <div>
      {isFeatureEnabled ? (
        <NewFeature />
      ) : (
        <ExistingFeature />
      )}
    </div>
  );
}
```

#### Next.js Integration

```tsx
// In _app.tsx or layout.tsx
import { MyFlagsProvider } from "@myflags/next";

export default function App({ Component, pageProps }) {
  return (
    <MyFlagsProvider
      apiKey={process.env.MYFLAGS_API_KEY}
      projectId={process.env.MYFLAGS_PROJECT_ID}
      environment={process.env.NODE_ENV}
    >
      <Component {...pageProps} />
    </MyFlagsProvider>
  );
}

// In your component
import { useFlag } from "@myflags/next";

function FeatureComponent() {
  const isFeatureEnabled = useFlag("feature_key");
  
  return isFeatureEnabled ? <NewFeature /> : <ExistingFeature />;
}
```

## 📚 Documentation

For detailed documentation, visit [docs.myflags.io](https://docs.myflags.io).

### Key Features

- **Simple Integration**: Easy to integrate with any JavaScript or TypeScript project
- **Framework Support**: First-class support for React and Next.js
- **Real-time Updates**: Subscribe to flag changes for immediate updates
- **Type Safety**: Full TypeScript support with type definitions
- **Performance**: Optimized for minimal performance impact
- **Offline Mode**: Graceful fallbacks when connectivity is lost

## 🧑‍💻 Development

This project uses pnpm workspaces and Turborepo for efficient monorepo management.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode
pnpm dev

# Run tests
pnpm test
```

## 🔗 Useful Links

- [MyFlags Website](https://myflags.io)
- [Documentation](https://myflags.io/documentation)
- [Dashboard](https://myflags.io/app/dashboard)
- [Twitter](https://twitter.com/myflags)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
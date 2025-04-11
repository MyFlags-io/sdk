# @myflags/react

React bindings for MyFlags SDK, providing hooks and components for easy feature flag management in React applications.

## Installation

```bash
npm install @myflags/react @myflags/core
# or
yarn add @myflags/react @myflags/core
# or
pnpm add @myflags/react @myflags/core
```

## Usage

### Provider Setup

```tsx
import { MyFlagsProvider } from '@myflags/react';

function App() {
  return (
    <MyFlagsProvider
      config={{
        apiKey: 'your-api-key',
        projectId: 'your-project-id',
        environment: 'production',
        refreshInterval: 600000, // optional, defaults to 10 minutes
      }}
    >
      <YourApp />
    </MyFlagsProvider>
  );
}
```

### Using Hooks

```tsx
import useFlag from '@myflags/react';

function MyComponent() {
  // Check if a feature is enabled
  const isEnabled = useFlag('feature-name');

  // With default value
  const isEnabledWithDefault = useFlag('feature-name', false);

  if (isEnabled) {
    return <div>New feature is enabled!</div>;
  }

  return <div>Feature is disabled</div>;
}
```

### Using Components

```tsx
import { FeatureFlag, FeatureValue } from '@myflags/react';

function MyComponent() {
  return (
    <div>
      <FeatureFlag name="feature-name">
        {(enabled) => (
          enabled ? <NewFeature /> : <OldFeature />
        )}
      </FeatureFlag>

      <FeatureValue name="theme-color" defaultValue="blue">
        {(color) => (
          <div style={{ color }}>Themed content</div>
        )}
      </FeatureValue>
    </div>
  );
}
```

## API Reference

### Components

#### MyFlagsProvider

The provider component that makes feature flags available to all child components.

```tsx
<MyFlagsProvider config={config}>
  <YourApp />
</MyFlagsProvider>
```

Props:
- `config`: Configuration object for the MyFlags SDK
  - `apiKey`: string (required) - Your MyFlags API key
  - `projectId`: string (optional) - Your project ID
  - `environment`: 'production' | 'development' | 'testing' (optional) - Environment to use
  - `refreshInterval`: number (optional) - Refresh interval in milliseconds

### Hooks

#### useFlag

Hook to check if a feature is enabled.

```typescript
const isEnabled = useFlag(name: string, defaultValue: boolean = false): boolean;
```

## Best Practices

1. **Provider Placement**
   - Place the `MyFlagsProvider` as high as possible in your component tree
   - Ensure the provider is mounted before any feature flag checks
   - Consider using environment variables for configuration

2. **Performance Optimization**
   - Use the `useFlag` hook for boolean flags
   - Memoize components that use feature flags with `React.memo`
   - Consider the refresh interval based on your needs

3. **Error Handling**
   - The SDK handles errors gracefully by returning default values
   - Provide fallback UI for when flags are unavailable
   - Monitor API responses for potential issues

4. **Testing**
   - Mock the MyFlags context in tests
   - Test both enabled and disabled states
   - Test error scenarios

## Example

```tsx
import { MyFlagsProvider } from '@myflags/react';
import useFlag from '@myflags/react';

function App() {
  return (
    <MyFlagsProvider
      config={{
        apiKey: 'your-api-key',
        projectId: 'your-project-id',
        environment: 'production',
      }}
    >
      <Header />
      <MainContent />
      <Footer />
    </MyFlagsProvider>
  );
}

function MainContent() {
  const isNewDashboardEnabled = useFlag('new-dashboard');
  
  return (
    <main>
      {isNewDashboardEnabled ? (
        <NewDashboard />
      ) : (
        <OldDashboard />
      )}
    </main>
  );
}
```

## Contributing

See the [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this package.

## License

This package is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 
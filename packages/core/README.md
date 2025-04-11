# @myflags/core

The core package of MyFlags SDK, providing the fundamental functionality for feature flag management.

## Installation

```bash
npm install @myflags/core
# or
yarn add @myflags/core
# or
pnpm add @myflags/core
```

## Usage

### Basic Setup

```typescript
import { MyFlagsSDK } from "@myflags/core";

// Initialize the SDK with your configuration
const sdk = new MyFlagsSDK({
  apiKey: "your-api-key",
  projectId: "your-project-id",
  environment: "production", // optional, defaults to 'production'
  refreshInterval: 600000, // optional, defaults to 10 minutes
});
```

### Checking Feature Flags

```typescript
// Get all feature flags
const flags = await sdk.getFlags();

// Check if a specific feature is enabled
const isEnabled = await sdk.getFlag("feature_key");
```

### Configuration Options

```typescript
interface MyFlagsConfig {
  apiKey: string; // Required: Your MyFlags API key
  projectId?: string; // Optional: Your project ID
  environment?: "production" | "development" | "testing"; // Optional: Environment
  refreshInterval?: number; // Optional: Refresh interval in milliseconds
}
```

## API Reference

### MyFlagsSDK

The main class for interacting with the MyFlags service.

#### Constructor Options

| Option          | Type                                       | Default      | Description                               |
| --------------- | ------------------------------------------ | ------------ | ----------------------------------------- |
| apiKey          | string                                     | -            | Your MyFlags API key                      |
| projectId       | string                                     | -            | Your project ID                           |
| environment     | 'production' \| 'development' \| 'testing' | 'production' | Environment to use                        |
| refreshInterval | number                                     | 600000       | Interval in milliseconds to refresh flags |

#### Methods

- `getFlags<T extends Flag>(): Promise<T>` - Get all feature flags
- `getFlag(key: string): Promise<boolean>` - Check if a specific feature is enabled

## Best Practices

1. **Initialization**

   - Initialize the SDK early in your application lifecycle
   - Store your API key securely
   - Use appropriate environment settings

2. **Error Handling**

   - The SDK handles errors gracefully by returning empty objects or false values
   - Implement appropriate fallback values in your application
   - Monitor API responses for potential issues

3. **Performance**

   - Use appropriate refresh intervals based on your needs
   - Consider implementing caching for frequently accessed flags
   - Monitor memory usage with large flag sets

4. **Security**
   - Never expose your API key in client-side code
   - Use environment variables for sensitive configuration
   - Implement proper access control for flag management

## Contributing

See the [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this package.

## License

This package is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

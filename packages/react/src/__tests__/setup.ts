import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock session storage
const mockStorage = new Map<string, string>();
vi.stubGlobal('sessionStorage', {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  clear: () => mockStorage.clear(),
});

// Mock the core SDK
vi.mock('@myflags/core', () => ({
  MyFlagsSDK: vi.fn().mockImplementation(() => ({
    getFlags: vi.fn().mockResolvedValue({
      feature1: true,
      feature2: false,
    }),
    config: {
      apiKey: 'test-api-key',
      projectId: 'test-project',
      environment: 'development',
    },
    client: {
      get: vi.fn(),
    },
  })),
  REFRESH_INTERVAL: 5000,
}));

// Setup fake timers
beforeEach(() => {
  vi.useFakeTimers();
  mockStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  mockStorage.clear();
}); 
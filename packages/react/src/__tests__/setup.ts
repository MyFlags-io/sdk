import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the core SDK
vi.mock('@myflags/core', () => ({
  MyFlagsSDK: vi.fn().mockImplementation(() => ({
    getFlags: vi.fn(),
    getFlag: vi.fn(),
  })),
}));

// Setup fake timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
}); 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MyFlagsProvider, useMyFlagsContext } from '../provider';
import { MyFlagsSDK } from '@myflags/core';

describe('MyFlagsProvider', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    projectId: 'test-project',
    environment: 'development' as const,
  };

  const mockFlags = {
    feature1: true,
    feature2: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(MyFlagsSDK).mockImplementation(function(this: any) {
      this.getFlags = vi.fn().mockResolvedValue(mockFlags);
      this.getFlag = vi.fn();
      return this;
    });
  });

  it('should provide flags to children', async () => {
    const TestComponent = () => {
      const flags = useMyFlagsContext();
      return <div data-testid="flags">{JSON.stringify(flags)}</div>;
    };

    render(
      <MyFlagsProvider config={mockConfig}>
        <TestComponent />
      </MyFlagsProvider>
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(screen.getByTestId('flags')).toHaveTextContent(JSON.stringify(mockFlags));
  });

  it('should refresh flags at specified interval', async () => {
    const mockGetFlags = vi.fn().mockResolvedValue(mockFlags);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(MyFlagsSDK).mockImplementation(function(this: any) {
      this.getFlags = mockGetFlags;
      this.getFlag = vi.fn();
      return this;
    });

    render(
      <MyFlagsProvider config={{ ...mockConfig, refreshInterval: 1000 }}>
        <div>Test</div>
      </MyFlagsProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(mockGetFlags).toHaveBeenCalledTimes(2); // Initial call + interval
  });

  it('should warn when used outside provider', () => {
    const TestComponent = () => {
      useMyFlagsContext();
      return null;
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useMyFlagsContext must be used within an MyFlagsProvider');
    consoleError.mockRestore();
  });
}); 
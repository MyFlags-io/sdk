import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MyFlagsProvider, useMyFlagsContext } from "../provider";
import { MyFlagsSDK } from "@myflags/core";

describe("MyFlagsProvider", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    projectId: "test-project",
    environment: "development" as const,
  };

  const mockFlags = {
    feature1: true,
    feature2: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should provide flags to children", async () => {
    const mockSDK = {
      getFlags: vi.fn().mockResolvedValue(mockFlags),
      getFlag: vi.fn(),
      subscribe: vi.fn().mockImplementation((callback) => {
        callback(mockFlags);
        return () => {};
      }),
      config: mockConfig,
    } as unknown as MyFlagsSDK;

    vi.mocked(MyFlagsSDK).mockImplementation(() => mockSDK);

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

    expect(screen.getByTestId("flags")).toHaveTextContent(
      JSON.stringify(mockFlags)
    );
  });

  it("should refresh flags at specified interval", async () => {
    const mockGetFlags = vi.fn().mockResolvedValue(mockFlags);
    const mockSubscribe = vi.fn().mockImplementation((callback) => {
      callback(mockFlags);
      return () => {};
    });

    const mockSDK = {
      getFlags: mockGetFlags,
      getFlag: vi.fn(),
      subscribe: mockSubscribe,
      config: mockConfig,
    } as unknown as MyFlagsSDK;

    vi.mocked(MyFlagsSDK).mockImplementation(() => mockSDK);

    render(
      <MyFlagsProvider config={{ ...mockConfig, refreshInterval: 1000 }}>
        <div>Test</div>
      </MyFlagsProvider>
    );

    // Wait for initial load
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    // Clear the initial call count
    mockGetFlags.mockClear();

    // Advance timer by refresh interval
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(mockGetFlags).toHaveBeenCalledTimes(1);
  });

  it("should warn when used outside provider", () => {
    const TestComponent = () => {
      useMyFlagsContext();
      return null;
    };

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useMyFlagsContext must be used within an MyFlagsProvider"
    );
    consoleError.mockRestore();
  });
});

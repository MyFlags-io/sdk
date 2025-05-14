import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MyFlagsSDK, Flag, MyFlagsConfig } from "@myflags/core";

import { MyFlagsProvider, useMyFlagsContext } from "../Provider";
import * as IndexedDBHook from "../hooks/useIndexedDB";

vi.mock("@myflags/core", () => {
  const MockSDK = vi.fn().mockImplementation((config: MyFlagsConfig) => ({
    config,
    baseUrl: "https://myflags.io/api",
    getFlags: vi.fn().mockResolvedValue({}),
    getFlag: vi.fn().mockResolvedValue(false),
    subscribe: vi.fn().mockImplementation((callback: (flags: Flag) => void) => {
      callback({});
      return () => {};
    }),
    fetch: vi.fn(),
  }));
  
  return {
    MyFlagsSDK: MockSDK,
    Flag: {},
    MyFlagsConfig: {},
  };
});

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

    vi.spyOn(IndexedDBHook, "useIndexedDB").mockImplementation(
      (_, initialValue) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [state, setState] = useState(initialValue);
        return [state, setState];
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should provide flags to children", async () => {
    const mockSubscribe = vi.fn().mockImplementation((callback) => {
      callback(mockFlags);
      return () => {};
    });

    vi.mocked(MyFlagsSDK).mockImplementation(() => ({
      config: mockConfig,
      baseUrl: "https://myflags.io/api",
      getFlags: vi.fn().mockResolvedValue(mockFlags),
      getFlag: vi.fn(),
      subscribe: mockSubscribe,
      fetch: vi.fn(),
    } as unknown as MyFlagsSDK));

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

    vi.mocked(MyFlagsSDK).mockImplementation(() => ({
      config: mockConfig,
      baseUrl: "https://myflags.io/api",
      getFlags: mockGetFlags,
      getFlag: vi.fn(),
      subscribe: mockSubscribe,
      fetch: vi.fn(),
    } as unknown as MyFlagsSDK));

    render(
      <MyFlagsProvider config={{ ...mockConfig, refreshInterval: 1000 }}>
        <div>Test</div>
      </MyFlagsProvider>
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockSubscribe).toHaveBeenCalled();
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
      "MyFlagsContext not found"
    );
    consoleError.mockRestore();
  });
});

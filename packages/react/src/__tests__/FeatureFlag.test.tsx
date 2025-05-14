import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyFlagsSDK } from "@myflags/core";
import { MyFlagsProvider } from "../Provider";
import { FeatureFlag } from "../components/FeatureFlag";
import * as IndexedDBHook from "../hooks/useIndexedDB";

// Mock the MyFlagsSDK
vi.mock("@myflags/core", () => {
  const MockSDK = vi.fn().mockImplementation(() => ({
    config: {
      apiKey: "test-api-key",
      projectId: "test-project",
      environment: "development",
    },
    baseUrl: "https://myflags.io/api",
    getFlags: vi.fn().mockResolvedValue({}),
    getFlag: vi.fn().mockResolvedValue(false),
    subscribe: vi.fn().mockImplementation((callback) => {
      callback({
        enabledFeature: true,
        disabledFeature: false,
      });
      return () => {};
    }),
    fetch: vi.fn(),
  }));
  
  return {
    MyFlagsSDK: MockSDK,
    // Re-export types
    Flag: {},
    MyFlagsConfig: {},
  };
});

describe("FeatureFlag component", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    projectId: "test-project",
    environment: "development" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the IndexedDB hook to avoid actual IndexedDB usage
    vi.spyOn(IndexedDBHook, "useIndexedDB").mockImplementation(
      (_, initialValue) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [state, setState] = useState(initialValue);
        return [state, setState];
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children when flag is enabled", () => {
    const expectedFlags = {
      enabledFeature: true,
      disabledFeature: false,
    };

    // Mock the subscription to return our expected flags
    vi.mocked(MyFlagsSDK).mockImplementation(() => ({
      config: mockConfig,
      baseUrl: "https://myflags.io/api",
      getFlags: vi.fn().mockResolvedValue(expectedFlags),
      getFlag: vi.fn(),
      subscribe: vi.fn().mockImplementation((callback) => {
        callback(expectedFlags);
        return () => {};
      }),
      fetch: vi.fn(),
    } as unknown as MyFlagsSDK));

    render(
      <MyFlagsProvider config={mockConfig}>
        <FeatureFlag name="enabledFeature">
          {(enabled) => (
            enabled ? <div data-testid="feature-content">Feature is enabled</div> : null
          )}
        </FeatureFlag>
      </MyFlagsProvider>
    );

    // The content should be visible since the flag is enabled
    expect(screen.getByTestId("feature-content")).toBeInTheDocument();
    expect(screen.getByTestId("feature-content")).toHaveTextContent("Feature is enabled");
  });

  it("should not render children when flag is disabled", () => {
    const expectedFlags = {
      enabledFeature: true,
      disabledFeature: false,
    };

    // Mock the subscription to return our expected flags
    vi.mocked(MyFlagsSDK).mockImplementation(() => ({
      config: mockConfig,
      baseUrl: "https://myflags.io/api",
      getFlags: vi.fn().mockResolvedValue(expectedFlags),
      getFlag: vi.fn(),
      subscribe: vi.fn().mockImplementation((callback) => {
        callback(expectedFlags);
        return () => {};
      }),
      fetch: vi.fn(),
    } as unknown as MyFlagsSDK));

    render(
      <MyFlagsProvider config={mockConfig}>
        <FeatureFlag name="disabledFeature">
          {(enabled) => (
            enabled ? (
              <div data-testid="feature-content">Feature is enabled</div>
            ) : (
              <div data-testid="disabled-content">Feature is disabled</div>
            )
          )}
        </FeatureFlag>
      </MyFlagsProvider>
    );

    // The disabled content should be visible since the flag is disabled
    expect(screen.queryByTestId("feature-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("disabled-content")).toBeInTheDocument();
    expect(screen.getByTestId("disabled-content")).toHaveTextContent("Feature is disabled");
  });

  it("should use defaultValue when flag doesn't exist", () => {
    const expectedFlags = {
      enabledFeature: true,
      disabledFeature: false,
    };

    // Mock the subscription to return our expected flags
    vi.mocked(MyFlagsSDK).mockImplementation(() => ({
      config: mockConfig,
      baseUrl: "https://myflags.io/api",
      getFlags: vi.fn().mockResolvedValue(expectedFlags),
      getFlag: vi.fn(),
      subscribe: vi.fn().mockImplementation((callback) => {
        callback(expectedFlags);
        return () => {};
      }),
      fetch: vi.fn(),
    } as unknown as MyFlagsSDK));

    render(
      <MyFlagsProvider config={mockConfig}>
        <FeatureFlag name="nonExistentFeature" defaultValue={true}>
          {(enabled) => (
            enabled ? (
              <div data-testid="feature-content">Feature is enabled by default</div>
            ) : (
              <div data-testid="disabled-content">Feature is disabled by default</div>
            )
          )}
        </FeatureFlag>
      </MyFlagsProvider>
    );

    // The content should be visible since we set defaultValue to true
    expect(screen.getByTestId("feature-content")).toBeInTheDocument();
    expect(screen.getByTestId("feature-content")).toHaveTextContent("Feature is enabled by default");
  });
}); 
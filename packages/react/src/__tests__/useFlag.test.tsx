import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyFlagsSDK } from "@myflags/core";
import { MyFlagsProvider } from "../Provider";
import useFlag from "../hooks/useFlag";
import * as IndexedDBHook from "../hooks/useIndexedDB";

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
        feature1: true,
        feature2: false,
      });
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

describe("useFlag hook", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    projectId: "test-project",
    environment: "development" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(IndexedDBHook, "useIndexedDB").mockImplementation(
      (_, initialValue) => {
        const [state, setState] = useState(initialValue);
        return [state, setState];
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a specific flag value when it exists", () => {
    const expectedFlags = {
      feature1: true,
      feature2: false,
    };

    vi.mocked(MyFlagsSDK).mockImplementation(
      () =>
        ({
          config: mockConfig,
          baseUrl: "https://myflags.io/api",
          getFlags: vi.fn().mockResolvedValue(expectedFlags),
          getFlag: vi.fn(),
          subscribe: vi.fn().mockImplementation((callback) => {
            callback(expectedFlags);
            return () => {};
          }),
          fetch: vi.fn(),
        } as unknown as MyFlagsSDK)
    );

    const TestComponent = () => {
      const flag1 = useFlag("feature1");
      const flag2 = useFlag("feature2");
      return (
        <div>
          <div data-testid="flag1">{String(flag1)}</div>
          <div data-testid="flag2">{String(flag2)}</div>
        </div>
      );
    };

    render(
      <MyFlagsProvider config={mockConfig}>
        <TestComponent />
      </MyFlagsProvider>
    );

    expect(screen.getByTestId("flag1")).toHaveTextContent("true");
    expect(screen.getByTestId("flag2")).toHaveTextContent("false");
  });

  it("should return default value when flag doesn't exist", () => {
    const expectedFlags = {
      feature1: true,
    };

    vi.mocked(MyFlagsSDK).mockImplementation(
      () =>
        ({
          config: mockConfig,
          baseUrl: "https://myflags.io/api",
          getFlags: vi.fn().mockResolvedValue(expectedFlags),
          getFlag: vi.fn(),
          subscribe: vi.fn().mockImplementation((callback) => {
            callback(expectedFlags);
            return () => {};
          }),
          fetch: vi.fn(),
        } as unknown as MyFlagsSDK)
    );

    const TestComponent = () => {
      const flag = useFlag("nonexistentFeature", false);
      const flagWithCustomDefault = useFlag("nonexistentFeature", true);
      return (
        <div>
          <div data-testid="flag">{String(flag)}</div>
          <div data-testid="flagWithCustomDefault">
            {String(flagWithCustomDefault)}
          </div>
        </div>
      );
    };

    render(
      <MyFlagsProvider config={mockConfig}>
        <TestComponent />
      </MyFlagsProvider>
    );

    expect(screen.getByTestId("flag")).toHaveTextContent("false");
    expect(screen.getByTestId("flagWithCustomDefault")).toHaveTextContent(
      "true"
    );
  });

  it("should throw error when used outside provider", () => {
    const TestComponent = () => {
      useFlag("feature1");
      return null;
    };

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow("MyFlagsContext not found");

    consoleError.mockRestore();
  });
});

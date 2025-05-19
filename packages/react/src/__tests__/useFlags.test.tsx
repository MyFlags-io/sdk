import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyFlagsSDK } from "@myflags/core";
import { MyFlagsProvider } from "../Provider";
import useFlags from "../hooks/useFlags";
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

describe("useFlags hook", () => {
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

  it("should return all flags from the context", () => {
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
      const flags = useFlags();
      return <div data-testid="flags">{JSON.stringify(flags)}</div>;
    };

    render(
      <MyFlagsProvider config={mockConfig}>
        <TestComponent />
      </MyFlagsProvider>
    );

    expect(screen.getByTestId("flags")).toHaveTextContent(
      JSON.stringify(expectedFlags)
    );
  });

  it("should throw error when used outside provider", () => {
    const TestComponent = () => {
      useFlags();
      return null;
    };

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow("MyFlagsContext not found");

    consoleError.mockRestore();
  });
});

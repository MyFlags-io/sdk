import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFlags from "../hooks/useFlags";
import { MyFlagsProvider } from "../provider";
import { MyFlagsSDK } from "@myflags/core";

describe("useFlags", () => {
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
    vi.mocked(MyFlagsSDK).mockImplementation(
      () =>
        ({
          getFlags: vi.fn().mockResolvedValue(mockFlags),
          getFlag: vi.fn(),
          config: mockConfig,
          client: {
            get: vi.fn(),
          },
        } as unknown as MyFlagsSDK)
    );
  });

  it("should return all flags", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MyFlagsProvider config={mockConfig}>{children}</MyFlagsProvider>
    );

    const { result } = renderHook(() => useFlags(), { wrapper });

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current).toEqual(mockFlags);
  });

  it("should return empty object when no flags are available", async () => {
    vi.mocked(MyFlagsSDK).mockImplementation(
      () =>
        ({
          getFlags: vi.fn().mockResolvedValue({}),
          getFlag: vi.fn(),
          config: mockConfig,
          client: {
            get: vi.fn(),
          },
        } as unknown as MyFlagsSDK)
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MyFlagsProvider config={mockConfig}>{children}</MyFlagsProvider>
    );

    const { result } = renderHook(() => useFlags(), { wrapper });

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current).toEqual({});
  });
});

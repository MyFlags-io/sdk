import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFlag from "../hooks/useFlag";
import { MyFlagsProvider } from "../Provider";
import { MyFlagsSDK } from "@myflags/core";

describe("useFlag", () => {
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
          config: mockConfig,
          client: {
            get: vi.fn(),
          },
        } as unknown as MyFlagsSDK)
    );
  });

  it("should return flag value when flag exists", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MyFlagsProvider config={mockConfig}>{children}</MyFlagsProvider>
    );

    const { result } = renderHook(() => useFlag("feature1"), { wrapper });

    // Wait for initial flags to load
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current).toBe(true);
  });

  it("should return default value when flag does not exist", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MyFlagsProvider config={mockConfig}>{children}</MyFlagsProvider>
    );

    const { result } = renderHook(() => useFlag("nonexistent", true), {
      wrapper,
    });

    // Wait for initial flags to load
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current).toBe(true);
  });

  it("should return false when flag does not exist and no default value provided", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MyFlagsProvider config={mockConfig}>{children}</MyFlagsProvider>
    );

    const { result } = renderHook(() => useFlag("nonexistent"), { wrapper });

    // Wait for initial flags to load
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current).toBe(false);
  });
});

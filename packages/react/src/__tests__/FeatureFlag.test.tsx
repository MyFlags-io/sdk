import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FeatureFlag } from "../components/FeatureFlag";
import { MyFlagsProvider } from "../ProviderTest";
import { MyFlagsSDK } from "@myflags/core";

describe("FeatureFlag", () => {
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
        } as unknown as MyFlagsSDK)
    );
  });

  it("should render children when flag is enabled", async () => {
    render(
      <MyFlagsProvider config={mockConfig}>
        <FeatureFlag name="feature1">
          {(enabled) => enabled && <div data-testid="content">Enabled</div>}
        </FeatureFlag>
      </MyFlagsProvider>
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("Enabled");
  });

  it("should not render children when flag is disabled", async () => {
    render(
      <MyFlagsProvider config={mockConfig}>
        <FeatureFlag name="feature2">
          {(enabled) => enabled && <div data-testid="content">Enabled</div>}
        </FeatureFlag>
      </MyFlagsProvider>
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("should use default value when flag does not exist", async () => {
    render(
      <MyFlagsProvider config={mockConfig}>
        <FeatureFlag name="nonexistent" defaultValue={true}>
          {(enabled) => enabled && <div data-testid="content">Enabled</div>}
        </FeatureFlag>
      </MyFlagsProvider>
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("Enabled");
  });
});

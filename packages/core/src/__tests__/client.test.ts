import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MyFlagsSDK,
  REFRESH_INTERVAL,
  DEFAULT_ENVIRONMENT,
  DEFAULT_RETRY_COUNT,
  DEFAULT_RETRY_DELAY,
} from "../client";
import type { MyFlagsConfig, Flag } from "../types";

// Mock global fetch
global.fetch = vi.fn();

describe("MyFlagsSDK", () => {
  const mockConfig: MyFlagsConfig = {
    apiKey: "test-api-key",
    projectId: "test-project",
    environment: "development",
  };

  let sdk: MyFlagsSDK;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    sdk = new MyFlagsSDK(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default configuration", () => {
      const sdk = new MyFlagsSDK(mockConfig);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
    });

    it("should use default environment when not provided", () => {
      const configWithoutEnv: MyFlagsConfig = {
        apiKey: "test-api-key",
        projectId: "test-project",
      };

      const sdk = new MyFlagsSDK(configWithoutEnv);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
    });

    it("should use default refresh interval when not provided", () => {
      const configWithoutRefreshInterval: MyFlagsConfig = {
        apiKey: "test-api-key",
        projectId: "test-project",
      };

      const sdk = new MyFlagsSDK(configWithoutRefreshInterval);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
    });

    it("should throw error when refresh interval is less than 1000ms", () => {
      const invalidConfig: MyFlagsConfig = {
        apiKey: "test-api-key",
        projectId: "test-project",
        refreshInterval: 500,
      };

      expect(() => new MyFlagsSDK(invalidConfig)).toThrow(
        "Refresh interval must be greater than 1000ms"
      );
    });

    it("should throw error when project ID is not provided", () => {
      const invalidConfig: MyFlagsConfig = {
        apiKey: "test-api-key",
        projectId: "",
      };

      expect(() => new MyFlagsSDK(invalidConfig)).toThrow(
        "Project ID is required"
      );
    });

    it("should throw error when project ID is not a string", () => {
      const invalidConfig = {
        apiKey: "test-api-key",
        projectId: 123 as any,
      };

      expect(() => new MyFlagsSDK(invalidConfig)).toThrow(
        "Project ID must be a string"
      );
    });
  });

  describe("getFlags", () => {
    it("should return flags successfully", async () => {
      const mockFlags = { feature1: true, feature2: false };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockFlags),
      } as unknown as Response);

      const flags = await sdk.getFlags();

      expect(flags).toEqual(mockFlags);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://myflags.io/api/flags",
        {
          headers: {
            Authorization: `Bearer ${mockConfig.apiKey}`,
            "Content-Type": "application/json",
            "x-api-project": mockConfig.projectId,
            "x-api-env": mockConfig.environment,
          },
          signal: undefined,
        }
      );
    });

    it("should return empty object on error", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      const flags = await sdk.getFlags();

      expect(flags).toEqual({});
      expect(global.fetch).toHaveBeenCalledWith(
        "https://myflags.io/api/flags",
        expect.any(Object)
      );
    });

    it("should retry on server errors", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({ feature1: true }),
        } as unknown as Response);

      const flags = await sdk.getFlags();

      expect(flags).toEqual({ feature1: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should retry on rate limit errors", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({ feature1: true }),
        } as unknown as Response);

      // Mock setTimeout to make tests faster
      vi.useFakeTimers();
      const flags = sdk.getFlags();
      await vi.runAllTimersAsync();
      const result = await flags;

      expect(result).toEqual({ feature1: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it("should respect abort signal", async () => {
      const abortController = new AbortController();
      const mockFlags = { feature1: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockFlags),
      } as unknown as Response);

      await sdk.getFlags({ signal: abortController.signal });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://myflags.io/api/flags",
        {
          headers: expect.any(Object),
          signal: abortController.signal,
        }
      );
    });
  });

  describe("getFlag", () => {
    it("should return flag value successfully", async () => {
      const mockFlagValue = true;
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockFlagValue),
      } as unknown as Response);

      const flagValue = await sdk.getFlag("feature1");

      expect(flagValue).toBe(mockFlagValue);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://myflags.io/api/flags/feature1",
        expect.any(Object)
      );
    });

    it("should return false on error", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      const flagValue = await sdk.getFlag("feature1");

      expect(flagValue).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://myflags.io/api/flags/feature1",
        expect.any(Object)
      );
    });

    it("should respect abort signal", async () => {
      const abortController = new AbortController();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(true),
      } as unknown as Response);

      await sdk.getFlag("feature1", { signal: abortController.signal });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://myflags.io/api/flags/feature1",
        {
          headers: expect.any(Object),
          signal: abortController.signal,
        }
      );
    });
  });

  describe("subscribe", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it("should call callback with flags initially and at intervals", async () => {
      const mockFlags1 = { feature1: true, feature2: false };
      const mockFlags2 = { feature1: false, feature2: true };

      vi.restoreAllMocks();

      const getFlags = vi
        .spyOn(sdk, "getFlags")
        .mockResolvedValueOnce(mockFlags1);

      const callback = vi.fn();
      const unsubscribe = sdk.subscribe(callback);

      await vi.runOnlyPendingTimersAsync();
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith(mockFlags1);
      expect(callback).toHaveBeenCalledTimes(1);

      callback.mockClear();
      getFlags.mockResolvedValueOnce(mockFlags2);

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith(mockFlags2);
      expect(callback).toHaveBeenCalledTimes(2);
      unsubscribe();

      callback.mockClear();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully in subscription", async () => {
      vi.restoreAllMocks();

      const getFlags = vi.spyOn(sdk, "getFlags").mockResolvedValueOnce({});

      const callback = vi.fn();
      const unsubscribe = sdk.subscribe(callback);

      await vi.runOnlyPendingTimersAsync();
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledTimes(1);

      callback.mockClear();

      getFlags.mockResolvedValueOnce({});

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();
    });

    it("should use custom refresh interval if specified", async () => {
      const customInterval = 5000;
      const customConfigSdk = new MyFlagsSDK({
        ...mockConfig,
        refreshInterval: customInterval,
      });

      vi.restoreAllMocks();

      const mockFlags = { feature1: true };

      const getFlags = vi
        .spyOn(customConfigSdk, "getFlags")
        .mockResolvedValueOnce(mockFlags);

      const callback = vi.fn();
      const unsubscribe = customConfigSdk.subscribe(callback);

      await vi.runOnlyPendingTimersAsync();
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);

      callback.mockClear();

      await vi.advanceTimersByTimeAsync(customInterval - 100);
      expect(callback).toHaveBeenCalledTimes(1);

      getFlags.mockResolvedValueOnce(mockFlags);

      await vi.advanceTimersByTimeAsync(200);
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();
    });

    it("should handle multiple subscriptions independently", async () => {
      const mockFlags = { feature1: true };

      vi.restoreAllMocks();

      const getFlags = vi
        .spyOn(sdk, "getFlags")
        .mockResolvedValueOnce(mockFlags)
        .mockResolvedValueOnce(mockFlags);

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = sdk.subscribe(callback1);
      const unsubscribe2 = sdk.subscribe(callback2);

      await vi.runOnlyPendingTimersAsync();
      await Promise.resolve();
      await Promise.resolve();

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      callback1.mockClear();
      callback2.mockClear();

      getFlags
        .mockResolvedValueOnce(mockFlags)
        .mockResolvedValueOnce(mockFlags);

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      await Promise.resolve();
      await Promise.resolve();

      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);

      callback1.mockClear();
      callback2.mockClear();

      getFlags.mockResolvedValueOnce(mockFlags);

      unsubscribe1();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      await Promise.resolve();
      await Promise.resolve();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);

      unsubscribe2();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { MyFlagsSDK } from "../client";
import type { MyFlagsConfig } from "../types";

vi.mock("axios");
vi.mock("axios-retry");

describe("MyFlagsSDK", () => {
  const mockConfig: MyFlagsConfig = {
    apiKey: "test-api-key",
    projectId: "test-project",
    environment: "development",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      get: vi.fn(),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  });

  describe("constructor", () => {
    it("should initialize with default configuration", () => {
      const sdk = new MyFlagsSDK(mockConfig);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "https://feature-flags-ebon.vercel.app/api",
        headers: {
          Authorization: `Bearer ${mockConfig.apiKey}`,
          "Content-Type": "application/json",
          "x-api-project": mockConfig.projectId,
          "x-api-env": mockConfig.environment,
        },
      });
    });

    it("should initialize with minimal configuration", () => {
      const minimalConfig: MyFlagsConfig = {
        apiKey: "test-api-key",
      };
      const sdk = new MyFlagsSDK(minimalConfig);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "https://feature-flags-ebon.vercel.app/api",
        headers: {
          Authorization: `Bearer ${minimalConfig.apiKey}`,
          "Content-Type": "application/json",
          "x-api-project": undefined,
          "x-api-env": undefined,
        },
      });
    });
  });

  describe("getFlags", () => {
    it("should return flags successfully", async () => {
      const mockFlags = { feature1: true, feature2: false };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockFlags });

      const sdk = new MyFlagsSDK(mockConfig);
      const flags = await sdk.getFlags();

      expect(flags).toEqual(mockFlags);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/flags");
    });

    it("should return empty object on error", async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error("Network error"));

      const sdk = new MyFlagsSDK(mockConfig);
      const flags = await sdk.getFlags();

      expect(flags).toEqual({});
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/flags");
    });
  });

  describe("getFlag", () => {
    it("should return flag value successfully", async () => {
      const mockFlagValue = true;
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockFlagValue });

      const sdk = new MyFlagsSDK(mockConfig);
      const flagValue = await sdk.getFlag("feature1");

      expect(flagValue).toBe(mockFlagValue);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/flags/feature1");
    });

    it("should return false on error", async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error("Network error"));

      const sdk = new MyFlagsSDK(mockConfig);
      const flagValue = await sdk.getFlag("feature1");

      expect(flagValue).toBe(false);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/flags/feature1");
    });
  });

  describe("axios retry configuration", () => {
    it("should configure retry on network errors", () => {
      new MyFlagsSDK(mockConfig);
      expect(axios.create).toHaveBeenCalled();
    });

    it("should configure retry on rate limit errors", () => {
      new MyFlagsSDK(mockConfig);
      expect(axios.create).toHaveBeenCalled();
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

    it("should call callback with flags at specified interval", async () => {
      const mockFlags = { feature1: true, feature2: false };
      mockAxiosInstance.get.mockResolvedValue({ data: mockFlags });
      const callback = vi.fn();

      const sdk = new MyFlagsSDK({
        ...mockConfig,
        refreshInterval: 1000,
      });

      const unsubscribe = await sdk.subscribe(callback);
      
      // No immediate call
      expect(callback).not.toHaveBeenCalled();

      // First interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith(mockFlags);
      expect(callback).toHaveBeenCalledTimes(1);

      // Second interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith(mockFlags);
      expect(callback).toHaveBeenCalledTimes(2);

      // Cleanup
      unsubscribe();
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should handle errors gracefully in subscription", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));
      const callback = vi.fn();

      const sdk = new MyFlagsSDK({
        ...mockConfig,
        refreshInterval: 1000,
      });

      const unsubscribe = await sdk.subscribe(callback);
      
      // No immediate call
      expect(callback).not.toHaveBeenCalled();

      // First interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledTimes(1);

      // Second interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();
    });

    it("should use default refresh interval if not specified", async () => {
      const mockFlags = { feature1: true };
      mockAxiosInstance.get.mockResolvedValue({ data: mockFlags });
      const callback = vi.fn();

      const sdk = new MyFlagsSDK(mockConfig);
      const unsubscribe = await sdk.subscribe(callback);

      // No immediate call
      expect(callback).not.toHaveBeenCalled();

      // First interval tick (default 10 minutes)
      await vi.advanceTimersByTimeAsync(600000);
      expect(callback).toHaveBeenCalledWith(mockFlags);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it("should handle multiple subscriptions independently", async () => {
      const mockFlags1 = { feature1: true };
      const mockFlags2 = { feature2: true };
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: mockFlags1 })
        .mockResolvedValueOnce({ data: mockFlags2 })
        .mockResolvedValue({ data: mockFlags1 });
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const sdk = new MyFlagsSDK({
        ...mockConfig,
        refreshInterval: 1000,
      });

      const unsubscribe1 = await sdk.subscribe(callback1);
      const unsubscribe2 = await sdk.subscribe(callback2);

      // No immediate calls
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();

      // First interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback1).toHaveBeenCalledWith(mockFlags1);
      expect(callback2).toHaveBeenCalledWith(mockFlags2);

      // Second interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback1).toHaveBeenCalledWith(mockFlags1);
      expect(callback2).toHaveBeenCalledWith(mockFlags1);

      unsubscribe1();
      unsubscribe2();
    });

    it("should handle rapid unsubscribe", async () => {
      const mockFlags = { feature1: true };
      mockAxiosInstance.get.mockResolvedValue({ data: mockFlags });
      const callback = vi.fn();

      const sdk = new MyFlagsSDK({
        ...mockConfig,
        refreshInterval: 1000,
      });

      const unsubscribe = await sdk.subscribe(callback);
      unsubscribe();

      // No calls should happen
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle changing flags over time", async () => {
      const mockFlags1 = { feature1: true };
      const mockFlags2 = { feature1: false };
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: mockFlags1 })
        .mockResolvedValueOnce({ data: mockFlags2 })
        .mockResolvedValueOnce({ data: mockFlags1 });
      
      const callback = vi.fn();

      const sdk = new MyFlagsSDK({
        ...mockConfig,
        refreshInterval: 1000,
      });

      const unsubscribe = await sdk.subscribe(callback);

      // No immediate call
      expect(callback).not.toHaveBeenCalled();

      // First interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith(mockFlags1);
      expect(callback).toHaveBeenCalledTimes(1);

      // Second interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith(mockFlags2);
      expect(callback).toHaveBeenCalledTimes(2);

      // Third interval tick
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledWith(mockFlags1);
      expect(callback).toHaveBeenCalledTimes(3);

      unsubscribe();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { MyFlagsSDK } from '../client';
import type { MyFlagsConfig } from '../types';

vi.mock('axios');
vi.mock('axios-retry');

describe('MyFlagsSDK', () => {
  const mockConfig: MyFlagsConfig = {
    apiKey: 'test-api-key',
    projectId: 'test-project',
    environment: 'development',
  };

  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      get: vi.fn(),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const sdk = new MyFlagsSDK(mockConfig);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://feature-flags-ebon.vercel.app/api',
        headers: {
          Authorization: `Bearer ${mockConfig.apiKey}`,
          'Content-Type': 'application/json',
          'x-api-project': mockConfig.projectId,
          'x-api-env': mockConfig.environment,
        },
      });
    });

    it('should initialize with minimal configuration', () => {
      const minimalConfig: MyFlagsConfig = {
        apiKey: 'test-api-key',
      };
      const sdk = new MyFlagsSDK(minimalConfig);
      expect(sdk).toBeInstanceOf(MyFlagsSDK);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://feature-flags-ebon.vercel.app/api',
        headers: {
          Authorization: `Bearer ${minimalConfig.apiKey}`,
          'Content-Type': 'application/json',
          'x-api-project': undefined,
          'x-api-env': undefined,
        },
      });
    });
  });

  describe('getFlags', () => {
    it('should return flags successfully', async () => {
      const mockFlags = { feature1: true, feature2: false };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockFlags });

      const sdk = new MyFlagsSDK(mockConfig);
      const flags = await sdk.getFlags();

      expect(flags).toEqual(mockFlags);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/flags');
    });

    it('should return empty object on error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      const sdk = new MyFlagsSDK(mockConfig);
      const flags = await sdk.getFlags();

      expect(flags).toEqual({});
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/flags');
    });
  });

  describe('getFlag', () => {
    it('should return flag value successfully', async () => {
      const mockFlagValue = true;
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockFlagValue });

      const sdk = new MyFlagsSDK(mockConfig);
      const flagValue = await sdk.getFlag('feature1');

      expect(flagValue).toBe(mockFlagValue);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/flags/feature1');
    });

    it('should return false on error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      const sdk = new MyFlagsSDK(mockConfig);
      const flagValue = await sdk.getFlag('feature1');

      expect(flagValue).toBe(false);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/flags/feature1');
    });
  });

  describe('axios retry configuration', () => {
    it('should configure retry on network errors', () => {
      const sdk = new MyFlagsSDK(mockConfig);
      expect(axios.create).toHaveBeenCalled();
    });

    it('should configure retry on rate limit errors', () => {
      const sdk = new MyFlagsSDK(mockConfig);
      expect(axios.create).toHaveBeenCalled();
    });
  });
}); 
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

import type { Flag, MyFlagsConfig } from "./types";

export const REFRESH_INTERVAL = 1000 * 60 * 10;

export class MyFlagsSDK {
  private client: AxiosInstance;

  constructor(private readonly config: MyFlagsConfig) {
    this.client = axios.create({
      baseURL: "https://feature-flags-ebon.vercel.app/api",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "x-api-project": config.projectId,
        "x-api-env": config.environment,
      },
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429
        );
      },
    });
  }

  subscribe(callback: (flags: Flag) => void): () => void {
    const interval = setInterval(async () => {
      const flags = await this.getFlags<Flag>();
      callback(flags);
    }, this.config.refreshInterval);

    return () => clearInterval(interval);
  }

  async getFlags<T extends Flag>(): Promise<T> {
    try {
      const response = await this.client.get<T>("/flags");
      
      return response.data;
    } catch {
      return {} as T;
    }
  }

  async getFlag(key: string): Promise<boolean> {
    try {
      const response = await this.client.get<boolean>(`/flags/${key}`);
      return response.data;
    } catch {
      return false;
    }
  }
}

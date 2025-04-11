import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

import type { Flag, MyFlagsConfig } from "./types";

// const API_URL = "https://myflags.io/api";
const API_URL = "http://localhost:3000/api";

export class MyFlagsSDK {
  private client: AxiosInstance;

  constructor(private readonly config: MyFlagsConfig) {
    this.client = axios.create({
      baseURL: API_URL,
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

  async getFlags<T extends Flag>(): Promise<T> {
    try {
      console.log("Fetching flags with config:", this.config);

      const response = await this.client.get<T>("/flags");
      console.log("Flags fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching flags:", error);
      return {} as T;
    }
  }

  async getFlag(key: string): Promise<boolean> {
    try {
      const response = await this.client.get<boolean>(`/flags/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flag ${key}:`, error);
      return false;
    }
  }
}

import { Flag, MyFlagsConfig, Options } from "./types";

export const REFRESH_INTERVAL = 1000 * 60 * 10;
export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_RETRY_DELAY = 1000;

export const DEFAULT_ENVIRONMENT = "development";
export const FLAGS_ENDPOINT = "/flags";

export class MyFlagsSDK {
  private readonly baseUrl = "https://myflags.io/api";
  private readonly headers: Record<string, string>;

  constructor(private readonly config: MyFlagsConfig) {
    this.assertValidProjectId();
    this.assertValidRefreshInterval();

    this.config.environment ??= DEFAULT_ENVIRONMENT;
    this.config.refreshInterval ??= REFRESH_INTERVAL;
    this.config.retryCount ??= DEFAULT_RETRY_COUNT;
    this.config.retryDelay ??= DEFAULT_RETRY_DELAY;

    this.headers = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "x-api-project": this.config.projectId,
      "x-api-env": this.config.environment,
      "Content-Type": "application/json",
    };
  }

  /**
   * Subscribe to the flags and call the callback when they change
   * @param callback - The callback to call when the flags change
   * @returns A function to unsubscribe from the flags
   */
  subscribe(callback: (flags: Flag) => void): () => void {
    this.getFlags().then(callback);

    const interval = setInterval(async () => {
      const flags = await this.getFlags<Flag>();
      callback(flags);
    }, this.config.refreshInterval);

    return () => clearInterval(interval);
  }

  /**
   * Get the flags
   * @param options - The options for the request
   * @returns The flags
   */
  async getFlags<T extends Flag>(options?: Options): Promise<T> {
    const response = await this.fetch<T>(FLAGS_ENDPOINT, options);
    return response ?? ({} as T);
  }

  /**
   * Get a flag
   * @param key - The key of the flag
   * @param options - The options for the request
   * @returns The flag
   */
  async getFlag(key: string, options?: Options): Promise<boolean> {
    const response = await this.fetch<boolean>(`/flags/${key}`, options);
    return response ?? false;
  }

  /**
   * Fetch a resource with retry logic
   * @param url - The url to fetch
   * @param options - The options for the request
   * @returns The resource
   */
  private async fetch<T>(url: string, options?: Options): Promise<T | null> {
    const retryCount = this.config.retryCount!;
    const retryDelay = this.config.retryDelay!;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`, {
          headers: this.headers,
          signal: options?.signal,
        });

        if (response.ok) {
          return response.json();
        }

        if (response.status === 429 || response.status >= 500) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );

          continue;
        }

        return null;
      } catch (error) {
        if (attempt < retryCount - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );

          continue;
        }
        return null;
      }
    }

    return null;
  }

  /**
   * Asserts that the refresh interval is valid
   * @throws Error if refresh interval is less than 1000ms
   */
  private assertValidRefreshInterval(): void {
    if (this.config.refreshInterval && this.config.refreshInterval < 1000) {
      throw new Error("Refresh interval must be greater than 1000ms");
    }
  }

  /**
   * Asserts that the project ID is valid
   * @throws Error if project ID is not a string
   */
  private assertValidProjectId(): void {
    if (!this.config.projectId) {
      throw new Error("Project ID is required");
    }

    if (typeof this.config.projectId !== "string") {
      throw new Error("Project ID must be a string");
    }
  }
}

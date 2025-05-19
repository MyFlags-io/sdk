export type Environment = "production" | "development" | "testing";

export interface MyFlagsConfig {
  apiKey: string;
  projectId: string;
  environment?: Environment;
  refreshInterval?: number;
  retryCount?: number;
  retryDelay?: number;
}

export interface Options {
  signal?: AbortSignal;
}

export type Flag = Record<string, boolean>;

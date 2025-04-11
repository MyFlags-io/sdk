export type Environment = "production" | "development" | "testing";

export interface MyFlagsConfig {
  apiKey: string;
  environment?: Environment;
  projectId?: string;
  refreshInterval?: number;
}

export type Flag = Record<string, boolean>;

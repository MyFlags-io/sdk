export type Environment = "production" | "development" | "testing";

export interface MyFlagsConfig {
  apiKey: string;
  environment?: Environment;
  projectId?: string;
}

export type Flag = Record<string, boolean>;

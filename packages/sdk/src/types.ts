export interface ApiConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, data: unknown): Promise<T>;
  put<T>(path: string, data: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
} 
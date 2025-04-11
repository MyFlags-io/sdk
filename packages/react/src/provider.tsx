import React, { createContext, useContext } from "react";
import { ApiConfig, ApiClient, ApiClientImpl } from "@myflags/core";

interface ApiContext {
  config: ApiConfig;
  client: ApiClient;
}

const ApiContext = createContext<ApiContext | null>(null);

export interface ApiProviderProps {
  config: ApiConfig;
  children: React.ReactNode;
}

export function ApiProvider({ config, children }: ApiProviderProps) {
  const client = new ApiClientImpl(config);

  return (
    <ApiContext.Provider value={{ config, client }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApiContext must be used within an ApiProvider");
  }
  return context;
}

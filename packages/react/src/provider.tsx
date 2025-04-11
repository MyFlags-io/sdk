import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Flag, MyFlagsConfig, MyFlagsSDK } from "@myflags/core";
import { useSessionStorage } from "./hooks/useSessionStorage";

interface MyFlagsProviderProps {
  config: MyFlagsConfig;
  children: React.ReactNode;
}

export const MyFlagsContext = createContext<Flag | null>(null);

export function MyFlagsProvider({
  config,
  children,
}: MyFlagsProviderProps): JSX.Element {
  const [flags, setFlags] = useSessionStorage<Flag>('flags', {});
  const [isMounted, setIsMounted] = useState(false);
  const [client] = useState<MyFlagsSDK>(new MyFlagsSDK(config));
  const refreshInterval = config.refreshInterval || 1000 * 60 * 10;

  const fetchFlags = useCallback(async () => {
    const fetchedFlags = await client.getFlags();
    setFlags(fetchedFlags);
  }, [client, setFlags]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    fetchFlags();
  }, [client, isMounted, fetchFlags]);

  useEffect(() => {
    const interval = setInterval(fetchFlags, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchFlags]);

  return (
    <MyFlagsContext.Provider value={flags}>{children}</MyFlagsContext.Provider>
  );
}

export function useMyFlagsContext(): Flag {
  const context = useContext(MyFlagsContext);
  if (!context) {
    throw new Error("useMyFlagsContext must be used within an MyFlagsProvider");
  }

  return context;
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { Flag, MyFlagsConfig, MyFlagsSDK } from "@myflags/core";
import { useIndexedDB } from "./hooks/useIndexedDB";

interface MyFlagsProviderProps {
  config: MyFlagsConfig;
  children: React.ReactNode;
}

export const MyFlagsContext = createContext<Flag | null>(null);

export function MyFlagsProvider(props: MyFlagsProviderProps): JSX.Element {
  const [flags, setFlags] = useIndexedDB<Flag>("flags", {});
  const [client] = useState(() => new MyFlagsSDK(props.config));

  useEffect(() => {
    const unsubscribe = client.subscribe(setFlags);
    return () => unsubscribe();
  }, [client]);

  return (
    <MyFlagsContext.Provider value={flags}>
      {props.children}
    </MyFlagsContext.Provider>
  );
}

export function useMyFlagsContext(): Flag {
  const context = useContext(MyFlagsContext);
  if (!context) throw new Error("MyFlagsContext not found");

  return context;
}

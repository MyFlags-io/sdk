"use client";

import { Flag, MyFlagsConfig } from "@myflags/core";
import { createContext, useContext, useEffect, useState } from "react";
import { MyFlagsNextSDK } from "../server";

export const MyNextFlagsContext = createContext<Flag>({});

export function MyFlagsProvider({
  defaultFlags = {},
  config,
  children,
}: {
  defaultFlags?: Flag;
  config: MyFlagsConfig;
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<Flag>(defaultFlags);

  useEffect(() => {
    const sdk = new MyFlagsNextSDK(config);
    const unsubscribe = sdk.subscribe((newFlags) => setFlags(newFlags));

    return () => unsubscribe();
  }, [config]);

  return (
    <MyNextFlagsContext.Provider value={flags}>
      {children}
    </MyNextFlagsContext.Provider>
  );
}

export function useMyNextFlags() {
  const context = useContext(MyNextFlagsContext);
  if (!context) {
    throw new Error("useMyNextFlags must be used within a MyFlagsProvider");
  }
  return context;
}

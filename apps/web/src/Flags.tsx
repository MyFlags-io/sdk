import React from "react";
import { useFlags } from "@myflags/react";

export const Flags = () => {
  const flags = useFlags();
  return <code>{JSON.stringify(flags, null, 2)}</code>;
};

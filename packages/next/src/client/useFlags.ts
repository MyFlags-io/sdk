"use client";

import { useContext } from "react";
import { MyNextFlagsContext } from "./MyFlagsProvider";
import { Flag } from "@myflags/core";

export function useFlags(): Flag {
  return useContext(MyNextFlagsContext);
}

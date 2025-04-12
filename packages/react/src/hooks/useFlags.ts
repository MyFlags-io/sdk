import { Flag } from "@myflags/core";
import { useMyFlagsContext } from "../Provider";

export default function useFlags(): Flag {
  const context = useMyFlagsContext();
  return context;
}

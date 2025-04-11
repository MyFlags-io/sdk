import { Flag } from "@myflags/core";
import { useMyFlagsContext } from "../provider";

export default function useFlags(): Flag {
  const context = useMyFlagsContext();
  return context;
}

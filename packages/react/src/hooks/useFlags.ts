import { Flag } from "@myflags/core";
import { useMyFlagsContext } from "../ProviderTest";

export default function useFlags(): Flag {
  const context = useMyFlagsContext();
  return context;
}

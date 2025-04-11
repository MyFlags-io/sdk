import { useMyFlagsContext } from "../provider";

export default function useFlags() {
  const context = useMyFlagsContext();
  return context;
}

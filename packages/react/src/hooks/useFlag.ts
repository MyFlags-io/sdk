import { useMyFlagsContext } from "../provider";

export default function useFlag(name: string, defaultValue: boolean = false) {
  const context = useMyFlagsContext();
  return context[name] || defaultValue;
}

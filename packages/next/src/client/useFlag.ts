import { useFlags } from "./useFlags";

export function useFlag(
  flagKey: string,
  defaultValue: boolean = false
): boolean {
  const flags = useFlags();
  return flags[flagKey] ?? defaultValue;
}

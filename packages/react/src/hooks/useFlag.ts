import { useMyFlagsContext } from "../Provider";

export default function useFlag(
  name: string,
  defaultValue: boolean = false
): boolean {
  const context = useMyFlagsContext();
  return context[name] || defaultValue;
}

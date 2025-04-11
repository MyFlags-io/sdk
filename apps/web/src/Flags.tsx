import { useFlags } from "@myflags/react";

export default function Flags(): JSX.Element {
  const flags = useFlags();
  return <code>{JSON.stringify(flags, null, 2)}</code>;
}

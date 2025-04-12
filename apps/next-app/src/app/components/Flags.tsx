'use client';

import { useFlags } from "@myflags/next/client";

export default function Flags(): JSX.Element {
  const flags = useFlags();
  return <div>{JSON.stringify(flags, null, 2)}</div>;
}

import React from "react";
import { useFlag } from "@myflags/react";

export default function Flag({ name }: { name: string }) {
  const flag = useFlag(name);

  console.log(name);

  return (
    <code>
      {name} : {JSON.stringify(flag, null, 2)}
    </code>
  );
}

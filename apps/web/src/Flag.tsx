import { useFlag } from "@myflags/react";

export default function Flag({ name }: { name: string }): JSX.Element {
  const flag = useFlag(name);

  return (
    <code>
      {name} : {JSON.stringify(flag, null, 2)}
    </code>
  );
}

import { MyFlagsConfig } from "@myflags/core";
import Flags from "./components/Flags";

import { getServerSideFlags } from "@myflags/next/server";
import { MyFlagsProvider } from "@myflags/next/client";

const config: MyFlagsConfig = {
  apiKey: "tk_ZCkSruyOO3DqGYsj7BzY6NP4qPx19G0f",
  environment: "development",
  projectId: "test",
  refreshInterval: 5000,
};

export default async function Home(): Promise<JSX.Element> {
  const flags = await getServerSideFlags(config);

  return (
    <MyFlagsProvider defaultFlags={flags} config={config}>
      <Flags />
    </MyFlagsProvider>
  );
}

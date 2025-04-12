import { MyFlagsConfig } from "@myflags/core";
import Flags from "./components/Flags";

import { getServerSideFlags } from "@myflags/next/server";
import { MyFlagsProvider } from "@myflags/next/client";

const config: MyFlagsConfig = {
  apiKey: "api-key",
  environment: "development",
  projectId: "project-id",
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

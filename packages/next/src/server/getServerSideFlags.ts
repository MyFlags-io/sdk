import { MyFlagsConfig } from "@myflags/core";
import { MyFlagsNextSDK } from "./MyFlagsNextSDK";

// Server-side helper for Next.js pages
export async function getServerSideFlags<T extends Record<string, boolean>>(
  config: MyFlagsConfig
): Promise<T> {
  const sdk = new MyFlagsNextSDK(config);
  const flags = await sdk.getFlags<T>();

  return flags;
}

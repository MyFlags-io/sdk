import { MyFlagsConfig } from "@myflags/core";
import { MyFlagsNextSDK } from "./MyFlagsNextSDK";

// Server-side helper for Next.js API routes
export async function getApiFlags<T extends Record<string, boolean>>(
  config: MyFlagsConfig
): Promise<T> {
  const sdk = new MyFlagsNextSDK(config);
  return sdk.getFlags<T>();
}

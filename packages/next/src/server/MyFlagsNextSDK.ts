import { Flag, MyFlagsConfig, MyFlagsSDK } from "@myflags/core";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class MyFlagsNextSDK extends MyFlagsSDK {
  private flagsCache: CacheEntry<Flag> | null = null;
  private flagCache: Map<string, CacheEntry<boolean>> = new Map();
  private refreshInterval: number;

  constructor(config: MyFlagsConfig) {
    super(config);
    this.refreshInterval = config.refreshInterval || 600000; // Default to 10 minutes in milliseconds
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.refreshInterval;
  }

  // Override getFlags to use map-based cache
  async getFlags<T extends Record<string, boolean>>(): Promise<T> {
    if (this.flagsCache && this.isCacheValid(this.flagsCache.timestamp)) {
      return this.flagsCache.value as T;
    }

    const flags = await super.getFlags<T>();
    this.flagsCache = {
      value: flags,
      timestamp: Date.now(),
    };

    return flags;
  }

  // Override getFlag to use map-based cache
  async getFlag(key: string): Promise<boolean> {
    const cachedFlag = this.flagCache.get(key);
    if (cachedFlag && this.isCacheValid(cachedFlag.timestamp)) {
      return cachedFlag.value;
    }

    const flag = await super.getFlag(key);
    this.flagCache.set(key, {
      value: flag,
      timestamp: Date.now(),
    });

    return flag;
  }
}

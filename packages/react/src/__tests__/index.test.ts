import { describe, it, expect } from "vitest";
import * as Exports from "../index";

describe("Index exports", () => {
  it("should export all expected components and hooks", () => {
    expect(Exports.FeatureFlag).toBeDefined();
    expect(Exports.useFlags).toBeDefined();
    expect(Exports.useFlag).toBeDefined();
    expect(Exports.MyFlagsProvider).toBeDefined();
  });
}); 
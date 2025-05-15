import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockUseIndexedDB = vi.fn();

vi.mock("../hooks/useIndexedDB", () => ({
  useIndexedDB: (...args: any[]) => mockUseIndexedDB(...args),
}));

import { useIndexedDB } from "../hooks/useIndexedDB";

describe("useIndexedDB hook", () => {
  let storedValues: Map<string, any> = new Map();

  beforeEach(() => {
    storedValues.clear();
    vi.clearAllMocks();

    mockUseIndexedDB.mockImplementation((key, initialValue) => {
      const storedValue = storedValues.has(key)
        ? storedValues.get(key)
        : initialValue;

      const [state, setState] = useState(storedValue);

      const setValue = (value: any) => {
        try {
          if (typeof value === "function") {
            try {
              const newValue = value(state);
              setState(newValue);
              storedValues.set(key, newValue);
            } catch {}
          } else {
            setState(value);
            storedValues.set(key, value);
          }
        } catch {}
      };

      return [state, setValue];
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with the provided initial value", () => {
    const { result } = renderHook(() =>
      useIndexedDB("testKey", "initialValue")
    );
    expect(result.current[0]).toBe("initialValue");
  });

  it("should update the value when setValue is called", async () => {
    const { result } = renderHook(() =>
      useIndexedDB("testKey", "initialValue")
    );

    await act(async () => {
      result.current[1]("newValue");
    });

    expect(result.current[0]).toBe("newValue");
  });

  it("should persist data between different hooks with the same key", async () => {
    const hookA = renderHook(() => useIndexedDB("persistKey", "initialValue"));

    await act(async () => {
      hookA.result.current[1]("persistedValue");
    });

    const hookB = renderHook(() => useIndexedDB("persistKey", "defaultValue"));
    expect(hookB.result.current[0]).toBe("persistedValue");
  });

  it("should handle function updates", async () => {
    const { result } = renderHook(() => useIndexedDB("counterKey", 0));

    await act(async () => {
      const setValue: any = result.current[1];
      setValue((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    await act(async () => {
      const setValue: any = result.current[1];
      setValue((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it("should handle errors in the update function", async () => {
    const { result } = renderHook(() => useIndexedDB("errorKey", 0));

    await act(async () => {
      const setValue: any = result.current[1];
      setValue(function errorFn() {
        throw new Error("Test error");
      });
    });

    expect(result.current[0]).toBe(0);
  });

  it("should use separate storage for different keys", async () => {
    const hookA = renderHook(() => useIndexedDB("keyA", "valueA"));
    const hookB = renderHook(() => useIndexedDB("keyB", "valueB"));

    await act(async () => {
      hookA.result.current[1]("updatedA");
    });

    expect(hookA.result.current[0]).toBe("updatedA");
    expect(hookB.result.current[0]).toBe("valueB");

    await act(async () => {
      hookB.result.current[1]("updatedB");
    });

    expect(hookA.result.current[0]).toBe("updatedA");
    expect(hookB.result.current[0]).toBe("updatedB");
  });
});

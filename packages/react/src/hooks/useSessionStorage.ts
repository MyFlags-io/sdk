import { useState, useCallback } from "react";

const SESSION_STORAGE_PREFIX = "myflags_";

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Get the initial value from sessionStorage synchronously
  const getStoredValue = (): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(
        `${SESSION_STORAGE_PREFIX}${key}`
      );
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
      return initialValue;
    }
  };

  // Initialize state with the value from sessionStorage
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to sessionStorage.
  const setValue = useCallback(
    (value: T) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(getStoredValue()) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            `${SESSION_STORAGE_PREFIX}${key}`,
            JSON.stringify(valueToStore)
          );
        }
      } catch (error) {
        console.error("Error writing to sessionStorage:", error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

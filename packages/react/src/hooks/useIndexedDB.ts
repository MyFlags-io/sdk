import { useState, useCallback, useEffect, useRef } from "react";

const DB_NAME = "myflags";
const DB_VERSION = 1;
const STORE_NAME = "flags";

export function useIndexedDB<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const pendingWrites = useRef<T[]>([]);

  const openDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject("IndexedDB not supported");
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject("Error opening IndexedDB");
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }, []);

  // Function to get value from IndexedDB
  const getValueFromDB = useCallback(async () => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return initialValue;
    }

    try {
      const db = await openDB();
      return new Promise<T>((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onerror = () => {
          resolve(initialValue);
        };

        request.onsuccess = () => {
          const result = request.result;
          db.close();
          if (result) {
            resolve(result.value);
          } else {
            resolve(initialValue);
          }
        };
      });
    } catch {
      return initialValue;
    }
  }, [key, initialValue, openDB]);

  // Function to set value in IndexedDB
  const setValueInDB = useCallback(
    async (valueToStore: T) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        console.warn("[MyFlags] IndexedDB not supported in this environment");
        return;
      }

      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.put({ id: key, value: valueToStore });

        transaction.oncomplete = () => {
          db.close();
        };

        transaction.onerror = () => {
          db.close();
        };
      } catch (error) {
        console.error("[MyFlags] Error in setValueInDB:", error);
      }
    },
    [key, openDB]
  );

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const value = await getValueFromDB();
        setStoredValue(value);
        setIsDbReady(true);
        
        // Process any pending writes
        if (pendingWrites.current.length > 0) {
          for (const value of pendingWrites.current) {
            await setValueInDB(value);
          }
          pendingWrites.current = [];
        }
      } catch {
        setIsDbReady(true);
      }
    };

    initializeDB();
  }, [getValueFromDB, setValueInDB]);

  const setValue = useCallback(
    (value: T) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (isDbReady) {
          setValueInDB(valueToStore);
        } else {
          pendingWrites.current.push(valueToStore);
        }
      } catch (error) {
        console.error("[MyFlags] Error in setValue:", error);
      }
    },
    [storedValue, isDbReady, setValueInDB]
  );

  return [storedValue, setValue];
}

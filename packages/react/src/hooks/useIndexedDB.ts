import { useState, useCallback, useEffect } from "react";

const DB_NAME = "myflags";
const DB_VERSION = 1;
const STORE_NAME = "flags";

export function useIndexedDB<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Initialize state with the initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isDbReady, setIsDbReady] = useState<boolean>(false);

  // Function to open database connection
  const openDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject("IndexedDB not supported");
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event);
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
      return new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onerror = () => {
          console.error("Error reading from IndexedDB");
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
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
      return initialValue;
    }
  }, [key, initialValue, openDB]);

  // Function to set value in IndexedDB
  const setValueInDB = useCallback(
    async (valueToStore: T) => {
      if (typeof window === "undefined" || !window.indexedDB) {
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
        
        transaction.onerror = (event) => {
          console.error("Error writing to IndexedDB:", event);
          db.close();
        };
      } catch (error) {
        console.error("Error accessing IndexedDB:", error);
      }
    },
    [key, openDB]
  );

  // Initialize on mount
  useEffect(() => {
    const initializeDB = async () => {
      try {
        const value = await getValueFromDB();
        setStoredValue(value);
        setIsDbReady(true);
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
        setIsDbReady(true); // Still set ready even on error to prevent hanging
      }
    };

    initializeDB();
  }, [getValueFromDB]);

  // Value setter that updates state and persists to IndexedDB
  const setValue = useCallback(
    (value: T) => {
      try {
        // Support function updates like useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        if (isDbReady) {
          setValueInDB(valueToStore);
        }
      } catch (error) {
        console.error("Error updating value:", error);
      }
    },
    [storedValue, isDbReady, setValueInDB]
  );

  return [storedValue, setValue];
} 
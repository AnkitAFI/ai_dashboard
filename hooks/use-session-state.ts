import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";

// Global in-memory store. 
// Survives Next.js client-side navigation (tab switching).
// Cleared completely on a hard page reload (F5).
const memoryStore = new Map<string, any>();

/**
 * useSessionState<T>
 *
 * A drop-in replacement for React.useState that persists the value in memory.
 * - Survives tab-to-tab navigation within the same session.
 * - Cleared automatically on page refresh or reload.
 */
export function useSessionState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  
  const [state, setStateRaw] = useState<T>(() => {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) as T;
    }
    return initialValue;
  });

  // Sync every state change back to the in-memory store.
  useEffect(() => {
    if (state === null || state === undefined) {
      memoryStore.delete(key);
    } else {
      memoryStore.set(key, state);
    }
  }, [key, state]);

  const setState: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      setStateRaw((prev) => {
        const next =
          typeof action === "function"
            ? (action as (prevState: T) => T)(prev)
            : action;
        
        if (next === null || next === undefined) {
          memoryStore.delete(key);
        } else {
          memoryStore.set(key, next);
        }
        
        return next;
      });
    },
    [key]
  );

  return [state, setState];
}

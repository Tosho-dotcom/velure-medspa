"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query. Returns `serverValue` during SSR and
 * hydration, then the live value (no setState-in-effect).
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const subscribeNoop = () => () => {};

/** False on the server and during hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

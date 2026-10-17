"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a function giving milliseconds since the form mounted. Sent as
 * `elapsedMs` so the n8n backend can drop instant (bot) posts.
 */
export function useFormAge(): () => number {
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);
  return useCallback(() => Date.now() - openedAt.current, []);
}

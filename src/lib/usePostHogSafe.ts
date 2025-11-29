"use client";

import { useCallback } from "react";
import posthog from "posthog-js";

export function usePostHogSafe() {
  const capture = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (typeof window === "undefined") return;
      try {
        posthog.capture(event, properties);
      } catch {
        // silently ignore
      }
    },
    []
  );

  return { capture };
}

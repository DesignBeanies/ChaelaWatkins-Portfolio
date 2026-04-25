import { useEffect, useState } from "react";

/**
 * Replacement for framer-motion’s `useReducedMotion` in App Router: Framer
 * can SSR with a null internal state and hydrate to a boolean, which causes
 * hydration errors. This version is always `false` on the server and on the
 * first client pass, then syncs to the real `prefers-reduced-motion` value
 * after mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

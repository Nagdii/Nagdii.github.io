import { useEffect, useState } from "react";

/**
 * Minimal hash router.
 *
 * Only paths beginning `#/` are treated as routes, so the plain section
 * anchors (`#experience`, `#contact`) keep working as ordinary scroll links.
 */
export function useHashRoute(): string {
  const read = () => (typeof window === "undefined" ? "" : window.location.hash);
  const [hash, setHash] = useState(read);

  useEffect(() => {
    const onChange = () => setHash(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return hash;
}

/** Returns the tool id when the current hash is a single tool route, else null. */
export function toolIdFromHash(hash: string): string | null {
  const m = hash.match(/^#\/tools\/([\w-]+)$/);
  return m ? m[1] : null;
}

/** True when the hash is the tools index, with or without a trailing slash. */
export function isToolsIndex(hash: string): boolean {
  return /^#\/tools\/?$/.test(hash);
}

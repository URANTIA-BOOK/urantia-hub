import { getProviders } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * True until /api/auth/providers reports no provider.
 * A filled deploy keeps Sign In. An empty key set hides it after the probe.
 */
export function useHasAuthProvider(): boolean {
  const [hasProvider, setHasProvider] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProviders()
      .then((providers) => {
        if (cancelled) return;
        setHasProvider(Boolean(providers && Object.keys(providers).length > 0));
      })
      .catch(() => {
        if (!cancelled) setHasProvider(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return hasProvider;
}

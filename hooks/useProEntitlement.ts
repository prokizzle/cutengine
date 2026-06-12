import { useCallback, useEffect, useState } from "react";
import { checkEntitlement } from "../lib/revenueCat";

type UseProEntitlementResult = {
  entitled: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

/** Whether the user holds the CutEngine Pro entitlement (bulk/maintenance gate). */
export function useProEntitlement(): UseProEntitlementResult {
  const [entitled, setEntitled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Loading covers every in-flight check, not just the first one — focus-driven
  // refreshes (e.g. returning from the paywall) must re-arm the guards that
  // keep callers from acting on a stale `entitled` value mid-check.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setEntitled(await checkEntitlement());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  return { entitled, loading, refresh };
}

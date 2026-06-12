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

  const refresh = useCallback(async () => {
    setEntitled(await checkEntitlement());
  }, []);

  useEffect(() => {
    refresh()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refresh]);

  return { entitled, loading, refresh };
}

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import {
  checkEntitlement,
  fetchOfferings,
  purchasePackage,
  restorePurchases,
} from "../lib/revenueCat";

type UsePaywallResult = {
  loading: boolean;
  packages: PurchasesPackage[];
  purchasing: boolean;
  restoring: boolean;
  handlePurchase: (pkg: PurchasesPackage) => Promise<void>;
  handleRestore: () => Promise<void>;
};

export function usePaywall(): UsePaywallResult {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    checkEntitlement()
      .then((entitled) => {
        if (entitled) {
          router.replace("/(tabs)");
          return;
        }
        return fetchOfferings().then((pkgs) => {
          setPackages(pkgs);
          setLoading(false);
        });
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage) => {
      setPurchasing(true);
      try {
        const result = await purchasePackage(pkg);
        if (result.success) {
          router.replace("/(tabs)");
        } else if (result.error !== "cancelled") {
          Alert.alert("Purchase Failed", result.error ?? "Try again.");
        }
      } catch {
        Alert.alert("Purchase Failed", "Try again.");
      } finally {
        setPurchasing(false);
      }
    },
    [router],
  );

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Nothing to Restore", "No active subscription found.");
      }
    } catch {
      Alert.alert("Restore Failed", "Try again.");
    } finally {
      setRestoring(false);
    }
  }, [router]);

  return {
    loading,
    packages,
    purchasing,
    restoring,
    handlePurchase,
    handleRestore,
  };
}

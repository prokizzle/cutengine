import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import {
  checkEntitlement,
  fetchOfferings,
  getOfferings,
  purchasePackage,
  restorePurchases,
  tierDisplayName,
} from "../../lib/revenueCat";

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [useNativePaywall, setUseNativePaywall] = useState(false);

  useEffect(() => {
    checkEntitlement().then((entitled) => {
      if (entitled) {
        router.replace("/(tabs)");
        return;
      }
      fetchOfferings().then((pkgs) => {
        setPackages(pkgs);
        setLoading(false);
      });
    });
  }, [router]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    const result = await purchasePackage(pkg);
    setPurchasing(false);
    if (result.success) {
      router.replace("/(tabs)");
    } else if (result.error !== "cancelled") {
      Alert.alert("Purchase Failed", result.error ?? "Try again.");
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const ok = await restorePurchases();
    setRestoring(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Nothing to Restore", "No active subscription found.");
    }
  };

  // ---- native paywall wrapper ------------------------------------------------

  if (useNativePaywall) {
    return (
      <View style={{ flex: 1 }}>
        <RevenueCatUI.Paywall
          onRestoreCompleted={({ customerInfo }) => {
            if (
              customerInfo.entitlements.active["CutEngine Pro"] !== undefined
            ) {
              router.replace("/(tabs)");
            }
          }}
          onDismiss={() => setUseNativePaywall(false)}
        />
      </View>
    );
  }

  // ---- loading ----------------------------------------------------------------

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary items-center justify-center">
        <ActivityIndicator color="#34c759" />
      </View>
    );
  }

  // ---- custom paywall ---------------------------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pt-12 pb-8 items-center">
          <Text className="text-text-primary text-3xl font-bold text-center">
            CutEngine Pro
          </Text>
          <Text className="text-text-secondary text-base text-center mt-3 leading-5">
            Advanced protocol tracking, cycle management, and AI-powered
            schedule parsing.
          </Text>
        </View>

        <View className="px-5 gap-3">
          {packages.map((pkg) => {
            const { title, subtitle } = tierDisplayName(pkg);
            const isAnnual = pkg.identifier === "$rc_annual";
            const isLifetime = pkg.identifier === "$rc_lifetime";
            const isHighlighted = isAnnual || isLifetime;

            return (
              <TouchableOpacity
                key={pkg.identifier}
                className={`bg-surface-secondary rounded-2xl px-5 py-4 border-2 ${
                  isHighlighted ? "border-positive" : "border-transparent"
                }`}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-text-primary text-lg font-semibold">
                      {title}
                    </Text>
                    <Text className="text-text-tertiary text-sm mt-0.5">
                      {subtitle}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-text-primary text-xl font-bold">
                      {pkg.product.priceString}
                    </Text>
                    <Text className="text-text-tertiary text-xs">
                      {isAnnual ? "/year" : isLifetime ? " once" : "/month"}
                    </Text>
                  </View>
                </View>
                {isLifetime && (
                  <View className="mt-3 bg-positive/20 rounded-lg px-3 py-1.5 self-start">
                    <Text className="text-positive text-xs font-semibold">
                      BEST VALUE
                    </Text>
                  </View>
                )}
                {isAnnual && !isLifetime && (
                  <View className="mt-3 bg-positive/20 rounded-lg px-3 py-1.5 self-start">
                    <Text className="text-positive text-xs font-semibold">
                      MOST POPULAR
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="px-5 mt-6 items-center gap-3">
          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoring}
          >
            <Text className="text-info text-sm font-medium">
              {restoring ? "Restoring..." : "Restore Purchases"}
            </Text>
          </TouchableOpacity>
          <Text className="text-text-tertiary text-xs text-center px-4">
            Payment charged to your Apple ID. Auto-renews unless cancelled 24h
            before period ends.
            {"\n"}
            <Text className="text-info/70">Terms · Privacy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

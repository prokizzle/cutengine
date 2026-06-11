import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { usePaywall } from "../../hooks/usePaywall";
import { PRO_ENTITLEMENT } from "../../lib/revenueCat";
import { NativePaywallWrapper } from "../../components/paywall/NativePaywallWrapper";
import { PaywallHeader } from "../../components/paywall/PaywallHeader";
import { PackageCard } from "../../components/paywall/PackageCard";
import { PaywallFooter } from "../../components/paywall/PaywallFooter";

export default function PaywallScreen() {
  const router = useRouter();
  const [useNativePaywall, setUseNativePaywall] = useState(false);
  const { loading, packages, purchasing, restoring, handlePurchase, handleRestore } =
    usePaywall();

  if (useNativePaywall) {
    return (
      <NativePaywallWrapper
        onDismiss={() => setUseNativePaywall(false)}
        onRestoreCompleted={({ customerInfo }) => {
          if (customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined) {
            router.replace("/(tabs)");
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary items-center justify-center">
        <ActivityIndicator color="#34c759" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <PaywallHeader />
        <View className="px-5 gap-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.identifier}
              pkg={pkg}
              disabled={purchasing}
              onPress={handlePurchase}
            />
          ))}
        </View>
        <PaywallFooter restoring={restoring} onRestore={handleRestore} />
      </ScrollView>
    </SafeAreaView>
  );
}

import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePaywall } from "../../hooks/usePaywall";
import { PaywallHeader } from "../../components/paywall/PaywallHeader";
import { PackageCard } from "../../components/paywall/PackageCard";
import { PaywallFooter } from "../../components/paywall/PaywallFooter";

export default function PaywallScreen() {
  const { loading, packages, purchasing, restoring, handlePurchase, handleRestore } =
    usePaywall();

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
              disabled={purchasing || restoring}
              onPress={handlePurchase}
            />
          ))}
        </View>
        <PaywallFooter restoring={restoring} onRestore={handleRestore} />
      </ScrollView>
    </SafeAreaView>
  );
}

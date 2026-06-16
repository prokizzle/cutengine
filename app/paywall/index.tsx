import { ActivityIndicator, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#34c759" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <PaywallHeader />
        <View style={styles.packageList}>
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

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
  },
  flex1: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  packageList: {
    paddingHorizontal: 20,
    gap: 12,
  },
}));

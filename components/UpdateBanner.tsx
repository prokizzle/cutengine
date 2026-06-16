import { useUpdates } from "expo-updates";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { applyUpdate } from "../lib/ota";

/**
 * Slim banner that only renders when a downloaded OTA update is staged and
 * waiting for a JS reload. Tapping it calls `Updates.reloadAsync()` to apply
 * the update immediately; otherwise the update takes effect on the next cold
 * start automatically.
 *
 * Mount this at the root, above the navigator, so it surfaces on every
 * screen.
 */
export function UpdateBanner() {
  const { isUpdatePending } = useUpdates();
  if (!isUpdatePending) return null;
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <Pressable onPress={applyUpdate} style={styles.banner}>
        <View style={styles.dot} />
        <Text style={styles.text}>Update ready — tap to restart</Text>
        <Text style={styles.cta}>RESTART</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safe: {
    backgroundColor: theme.colors.info,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  text: {
    flex: 1,
    color: "#ffffff",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  cta: {
    color: "#ffffff",
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
  },
}));

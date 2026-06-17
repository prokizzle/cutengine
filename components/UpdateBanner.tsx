import * as Sentry from "@sentry/react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { applyUpdate } from "../lib/ota";

type Props = {
  /** Driven by `useUpdates().isUpdatePending` upstream so the root layout
   * can also zero out the top safe-area inset for descendant screens — see
   * `app/_layout.tsx`. */
  visible: boolean;
};

/**
 * Slim banner that only renders when a downloaded OTA update is staged and
 * waiting for a JS reload. Tapping it calls `Updates.reloadAsync()` to apply
 * the update immediately; otherwise the update takes effect on the next cold
 * start automatically.
 *
 * The banner paints its own background under the device top inset (no nested
 * SafeAreaView) so that the root layout can also override the inset context
 * for the navigator below it — preventing a duplicate inset under the bar.
 */
export function UpdateBanner({ visible }: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  const handlePress = () => {
    applyUpdate().catch((err) => Sentry.captureException(err));
  };
  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <Pressable onPress={handlePress} style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.text}>Update ready — tap to restart</Text>
        <Text style={styles.cta}>RESTART</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    backgroundColor: theme.colors.info,
  },
  row: {
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

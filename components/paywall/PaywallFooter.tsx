import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  restoring: boolean;
  onRestore: () => void;
};

export function PaywallFooter({ restoring, onRestore }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onRestore} disabled={restoring}>
        <Text style={styles.restore}>
          {restoring ? "Restoring..." : "Restore Purchases"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>
        Payment charged to your Apple ID. Auto-renews unless cancelled 24h
        before period ends.{"\n"}
        <Text style={styles.terms}>Terms · Privacy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    alignItems: "center",
    gap: 12,
  },
  restore: {
    color: theme.colors.info,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  disclaimer: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  terms: {
    color: "rgba(0,122,255,0.7)",
  },
}));

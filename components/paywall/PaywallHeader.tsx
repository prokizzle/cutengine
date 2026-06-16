import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function PaywallHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CutEngine Pro</Text>
      <Text style={styles.subtitle}>
        Advanced protocol tracking, cycle management, and AI-powered schedule
        parsing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.base,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
}));

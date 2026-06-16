import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { PhaseSuggestion } from "../../utils/phaseSuggestion";

type Props = {
  suggestion: PhaseSuggestion;
  onDismiss?: () => void;
};

/** Advisory card for weight-trend phase suggestions. */
export function PhaseSuggestionCard({ suggestion, onDismiss }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>TREND INSIGHT</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss suggestion">
            <Text style={styles.dismiss}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{suggestion.title}</Text>
      <Text style={styles.body}>{suggestion.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,159,10,0.3)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: theme.colors.attention,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  dismiss: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: 4,
  },
  body: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
}));

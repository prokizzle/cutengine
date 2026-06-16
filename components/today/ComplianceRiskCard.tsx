import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { MissPrediction } from "../../utils/compliancePredictor";

type Props = {
  prediction: MissPrediction;
  onDismiss?: () => void;
};

const COPY: Record<"moderate" | "high", { title: string; body: string }> = {
  high: {
    title: "Days like today are when you usually slip",
    body: "Based on your check-in history, today carries a high risk of being missed. Knocking out the check-in now keeps your streak intact.",
  },
  moderate: {
    title: "Today's check-in is at some risk",
    body: "Your history suggests days like today get skipped more often than usual. A quick check-in now gets it out of the way.",
  },
};

/** Advisory nudge from the on-device compliance miss predictor (CUTIOS-12). */
export function ComplianceRiskCard({ prediction, onDismiss }: Props) {
  if (prediction.level === "low") return null;
  const copy = COPY[prediction.level];
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>COMPLIANCE INSIGHT</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss compliance insight">
            <Text style={styles.dismiss}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
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

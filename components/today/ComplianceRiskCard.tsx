import { Text, TouchableOpacity, View } from "react-native";
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

/** Advisory nudge from the on-device compliance miss predictor (CUTIOS-12).
 *  Rendered only for moderate/high risk while today's check-in is pending. */
export function ComplianceRiskCard({ prediction, onDismiss }: Props) {
  if (prediction.level === "low") return null;
  const copy = COPY[prediction.level];
  return (
    <View className="mx-5 mb-4 bg-surface-secondary rounded-2xl p-4 border border-attention/30">
      <View className="flex-row items-start justify-between">
        <Text className="text-attention text-xs font-semibold tracking-widest mb-1">
          COMPLIANCE INSIGHT
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss compliance insight">
            <Text className="text-text-tertiary text-xs">✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-text-primary text-base font-semibold mb-1">{copy.title}</Text>
      <Text className="text-text-tertiary text-sm leading-5">{copy.body}</Text>
    </View>
  );
}

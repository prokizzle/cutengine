import { Text, TouchableOpacity, View } from "react-native";
import type { PhaseSuggestion } from "../../utils/phaseSuggestion";

type Props = {
  suggestion: PhaseSuggestion;
  onDismiss?: () => void;
};

/** Advisory card for weight-trend phase suggestions. Never auto-switches —
 *  it only surfaces the observation and leaves the decision to the user. */
export function PhaseSuggestionCard({ suggestion, onDismiss }: Props) {
  return (
    <View className="mx-5 mb-4 bg-surface-secondary rounded-2xl p-4 border border-attention/30">
      <View className="flex-row items-start justify-between">
        <Text className="text-attention text-xs font-semibold tracking-widest mb-1">
          TREND INSIGHT
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss suggestion">
            <Text className="text-text-tertiary text-xs">✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-text-primary text-base font-semibold mb-1">{suggestion.title}</Text>
      <Text className="text-text-tertiary text-sm leading-5">{suggestion.body}</Text>
    </View>
  );
}

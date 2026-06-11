import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { kgToLbs } from "../../utils/weight";

type Props = {
  ready: boolean;
  weightKg: number | null;
  weightInput: string;
  onWeightInputChange: (v: string) => void;
  onLogWeight: () => void;
};

export function HealthKitWidget({
  ready,
  weightKg,
  weightInput,
  onWeightInputChange,
  onLogWeight,
}: Props) {
  return (
    <View className="mx-5 mb-4 bg-surface-secondary rounded-2xl px-4 py-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text-secondary text-sm font-medium">
          HealthKit
        </Text>
        <View
          className={`w-2 h-2 rounded-full ${ready ? "bg-positive" : "bg-warning"}`}
        />
      </View>
      <View className="flex-row items-center gap-2">
        <TextInput
          className="flex-1 bg-surface-tertiary rounded-lg px-3 py-2 text-text-primary text-base"
          placeholder="Weight (kg)"
          placeholderTextColor="#8e8e93"
          keyboardType="decimal-pad"
          value={weightInput}
          onChangeText={onWeightInputChange}
        />
        <TouchableOpacity
          className="bg-positive rounded-lg px-4 py-2"
          style={{ opacity: !ready || !weightInput.trim() ? 0.4 : 1 }}
          onPress={onLogWeight}
          disabled={!ready || !weightInput.trim()}
        >
          <Text className="text-white font-semibold text-sm">Log</Text>
        </TouchableOpacity>
      </View>
      {weightKg != null && (
        <Text className="text-text-tertiary text-xs mt-2">
          Last HK weight: {weightKg.toFixed(1)} kg (
          {kgToLbs(weightKg).toFixed(1)} lb)
        </Text>
      )}
    </View>
  );
}

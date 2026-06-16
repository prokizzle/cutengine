import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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
  const buttonDisabled = !ready || !weightInput.trim();
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>HealthKit</Text>
        <View style={[styles.statusDot, ready ? styles.statusDotReady : styles.statusDotWarn]} />
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          placeholderTextColor="#8e8e93"
          keyboardType="decimal-pad"
          value={weightInput}
          onChangeText={onWeightInputChange}
        />
        <TouchableOpacity
          style={[styles.logButton, { opacity: buttonDisabled ? 0.4 : 1 }]}
          onPress={onLogWeight}
          disabled={buttonDisabled}
        >
          <Text style={styles.logButtonText}>Log</Text>
        </TouchableOpacity>
      </View>
      {weightKg != null && (
        <Text style={styles.hkLine}>
          Last HK weight: {weightKg.toFixed(1)} kg ({kgToLbs(weightKg).toFixed(1)} lb)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusDotReady: {
    backgroundColor: theme.colors.positive,
  },
  statusDotWarn: {
    backgroundColor: theme.colors.warning,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
  },
  logButton: {
    backgroundColor: theme.colors.positive,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logButtonText: {
    color: "#ffffff",
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
  hkLine: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
    marginTop: 8,
  },
}));

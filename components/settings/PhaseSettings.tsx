import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  DEFAULT_MACROS,
  macroRatioFor,
  type MacroRatio,
  type Phase,
  type UserProfile,
} from "../../modules/expo-cycle-store/src/userProfile";
import { CUT_TIERS, SURPLUS_TIERS, type WeeklyDeltaTier } from "../../utils/calorieTargets";
import { PHASE_LABEL, phaseDurationLabel } from "../../utils/phase";

const PHASES: Phase[] = ["cut", "bulk", "maintenance"];

// Maps each phase to its theme color key for the active label.
const PHASE_COLOR_KEY: Record<Phase, "warning" | "positive" | "info"> = {
  cut: "warning",
  bulk: "positive",
  maintenance: "info",
};

type Props = {
  profile: UserProfile;
  /** Pro entitlement — bulk and maintenance are Pro-only (CUTIOS-24). */
  entitled: boolean;
  onSwitchPhase: (phase: Phase) => void;
  onSelectWeeklyDelta: (weeklyDeltaKg: number) => void;
  onEditMacros: (phase: Phase, ratio: MacroRatio | null) => void;
  onRequirePro: () => void;
};

function ProBadge() {
  return (
    <View style={styles.proBadge}>
      <Text style={styles.proBadgeText}>PRO</Text>
    </View>
  );
}

function confirmSwitch(from: Phase, to: Phase, onConfirm: () => void) {
  Alert.alert(
    `Switch to ${PHASE_LABEL[to]} mode?`,
    `Your ${PHASE_LABEL[from].toLowerCase()} progress will be saved. The phase timer restarts today.`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Switch", onPress: onConfirm },
    ],
  );
}

function TierRow({
  tier,
  selected,
  onPress,
}: {
  tier: WeeklyDeltaTier;
  selected: boolean;
  onPress: () => void;
}) {
  const lbs = Math.abs(tier.weeklyDeltaLbs);
  return (
    <TouchableOpacity
      style={styles.tierRow}
      onPress={onPress}
      accessibilityLabel={`${tier.label}, ${lbs} pounds per week`}
    >
      <Text style={styles.tierLabel}>{tier.label}</Text>
      <Text style={selected ? styles.tierValueSelected : styles.tierValue}>
        {lbs} lb/wk {selected ? "✓" : ""}
      </Text>
    </TouchableOpacity>
  );
}

function MacroSplitEditor({
  phase,
  profile,
  onEditMacros,
}: {
  phase: Phase;
  profile: UserProfile;
  onEditMacros: (phase: Phase, ratio: MacroRatio | null) => void;
}) {
  const current = macroRatioFor(profile, phase);
  const [protein, setProtein] = useState(String(Math.round(current.protein * 100)));
  const [carb, setCarb] = useState(String(Math.round(current.carb * 100)));
  const [fat, setFat] = useState(String(Math.round(current.fat * 100)));
  const hasOverride = profile.macroOverrides[phase] != null;

  const save = () => {
    const p = parseInt(protein, 10);
    const c = parseInt(carb, 10);
    const f = parseInt(fat, 10);
    if ([p, c, f].some((v) => Number.isNaN(v) || v < 0) || Math.abs(p + c + f - 100) > 1) {
      Alert.alert("Invalid split", "Protein, carbs, and fat must add up to 100%.");
      return;
    }
    onEditMacros(phase, { protein: p / 100, carb: c / 100, fat: f / 100 });
  };

  const reset = () => {
    const defaults = DEFAULT_MACROS[phase];
    setProtein(String(Math.round(defaults.protein * 100)));
    setCarb(String(Math.round(defaults.carb * 100)));
    setFat(String(Math.round(defaults.fat * 100)));
    onEditMacros(phase, null);
  };

  const field = (label: string, value: string, onChange: (v: string) => void) => (
    <View style={styles.fieldCol}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChange}
        accessibilityLabel={`${label} percent`}
      />
    </View>
  );

  return (
    <View style={styles.macroEditor}>
      <Text style={styles.macroHeading}>
        {PHASE_LABEL[phase]} macro split (%){hasOverride ? " — custom" : ""}
      </Text>
      <View style={styles.fieldRow}>
        {field("PROTEIN", protein, setProtein)}
        {field("CARBS", carb, setCarb)}
        {field("FAT", fat, setFat)}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSave]}
          onPress={save}
          accessibilityLabel="Save macro split"
        >
          <Text style={styles.actionSaveText}>Save split</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonReset]}
          onPress={reset}
          accessibilityLabel="Reset macro split to default"
        >
          <Text style={styles.actionResetText}>Reset to default</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/** Phase mode controls for Settings. */
export function PhaseSettings({
  profile,
  entitled,
  onSwitchPhase,
  onSelectWeeklyDelta,
  onEditMacros,
  onRequirePro,
}: Props) {
  const phase = profile.currentPhase;
  const tiers = phase === "cut" ? CUT_TIERS : phase === "bulk" ? SURPLUS_TIERS : [];

  return (
    <View>
      {/* Phase selector */}
      <View style={styles.selector}>
        {PHASES.map((option) => {
          const selected = option === phase;
          const locked = option !== "cut" && !entitled;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.selectorButton, selected && styles.selectorButtonSelected]}
              accessibilityLabel={`${PHASE_LABEL[option]} phase${locked ? ", requires Pro" : ""}`}
              onPress={() => {
                if (selected) return;
                if (locked) {
                  onRequirePro();
                  return;
                }
                confirmSwitch(phase, option, () => onSwitchPhase(option));
              }}
            >
              <Text style={selected ? [styles.selectorText, styles[PHASE_COLOR_KEY[option]]] : styles.selectorTextInactive}>
                {PHASE_LABEL[option]}
              </Text>
              {locked && <ProBadge />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.durationLabel}>{phaseDurationLabel(profile)}</Text>
      <Divider />

      {tiers.map((tier) => (
        <View key={tier.id}>
          <TierRow
            tier={tier}
            selected={Math.abs(tier.weeklyDeltaKg - profile.targetWeightDeltaPerWeekKg) < 0.01}
            onPress={() => onSelectWeeklyDelta(tier.weeklyDeltaKg)}
          />
          <Divider />
        </View>
      ))}
      {phase === "maintenance" && (
        <View style={styles.maintenanceBlock}>
          <Text style={styles.maintenanceText}>
            Maintenance targets your TDEE — no surplus or deficit.
          </Text>
        </View>
      )}
      {phase === "maintenance" && <Divider />}

      <MacroSplitEditor
        key={phase}
        phase={phase}
        profile={profile}
        onEditMacros={onEditMacros}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  proBadge: {
    backgroundColor: "rgba(255,159,10,0.2)",
    borderRadius: theme.radius.md,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  proBadgeText: {
    color: theme.colors.attention,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1.5,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tierLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
  },
  tierValue: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
  tierValueSelected: {
    color: theme.colors.positive,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  fieldCol: {
    flex: 1,
    alignItems: "center",
  },
  fieldLabel: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    width: "100%",
    textAlign: "center",
  },
  macroEditor: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  macroHeading: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: theme.radius.xl,
  },
  actionButtonSave: {
    backgroundColor: "rgba(52,199,89,0.15)",
  },
  actionButtonReset: {
    backgroundColor: theme.colors.surfaceTertiary,
  },
  actionSaveText: {
    color: theme.colors.positive,
    fontWeight: theme.fontWeight.semibold,
  },
  actionResetText: {
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 16,
  },
  selector: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.xl,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: theme.radius.lg,
  },
  selectorButtonSelected: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  selectorText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  selectorTextInactive: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
  warning: { color: theme.colors.warning },
  positive: { color: theme.colors.positive },
  info: { color: theme.colors.info },
  durationLabel: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  maintenanceBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  maintenanceText: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
}));

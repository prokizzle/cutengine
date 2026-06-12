import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  DEFAULT_MACROS,
  macroRatioFor,
  type MacroRatio,
  type Phase,
  type UserProfile,
} from "../../modules/expo-cycle-store/src/userProfile";
import { CUT_TIERS, SURPLUS_TIERS, type WeeklyDeltaTier } from "../../utils/calorieTargets";
import { PHASE_COLOR, PHASE_LABEL, phaseDurationLabel } from "../../utils/phase";

const PHASES: Phase[] = ["cut", "bulk", "maintenance"];

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
    <View className="bg-attention/20 rounded-md px-1.5 py-0.5 ml-2">
      <Text className="text-attention text-[10px] font-bold tracking-widest">PRO</Text>
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
      className="flex-row items-center justify-between px-4 py-3.5"
      onPress={onPress}
      accessibilityLabel={`${tier.label}, ${lbs} pounds per week`}
    >
      <Text className="text-text-primary text-base">{tier.label}</Text>
      <Text className={selected ? "text-positive text-sm font-semibold" : "text-text-tertiary text-sm"}>
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
    <View className="flex-1 items-center">
      <Text className="text-text-tertiary text-[10px] mb-1">{label}</Text>
      <TextInput
        className="bg-surface-tertiary rounded-xl px-3 py-2 text-text-primary text-base w-full text-center"
        keyboardType="number-pad"
        value={value}
        onChangeText={onChange}
        accessibilityLabel={`${label} percent`}
      />
    </View>
  );

  return (
    <View className="px-4 py-3.5">
      <Text className="text-text-primary text-base mb-3">
        {PHASE_LABEL[phase]} macro split (%){hasOverride ? " — custom" : ""}
      </Text>
      <View className="flex-row gap-3 mb-3">
        {field("PROTEIN", protein, setProtein)}
        {field("CARBS", carb, setCarb)}
        {field("FAT", fat, setFat)}
      </View>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 items-center py-2.5 rounded-xl bg-positive/15"
          onPress={save}
          accessibilityLabel="Save macro split"
        >
          <Text className="text-positive font-semibold">Save split</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center py-2.5 rounded-xl bg-surface-tertiary"
          onPress={reset}
          accessibilityLabel="Reset macro split to default"
        >
          <Text className="text-text-secondary">Reset to default</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-white/5 mx-4" />;
}

/** Phase mode controls for Settings: selector with Pro gate, duration,
 *  weekly target tiers, and a per-phase macro split editor. */
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
      <View className="flex-row mx-4 my-3 bg-surface-tertiary rounded-xl p-1">
        {PHASES.map((option) => {
          const selected = option === phase;
          const locked = option !== "cut" && !entitled;
          return (
            <TouchableOpacity
              key={option}
              className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
                selected ? "bg-surface-secondary" : ""
              }`}
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
              <Text
                className={selected ? "text-sm font-semibold" : "text-text-tertiary text-sm"}
                style={selected ? { color: PHASE_COLOR[option] } : undefined}
              >
                {PHASE_LABEL[option]}
              </Text>
              {locked && <ProBadge />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Current phase duration */}
      <Text className="text-text-tertiary text-sm px-4 pb-3">{phaseDurationLabel(profile)}</Text>
      <Divider />

      {/* Weekly target tiers (cut/bulk only) */}
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
        <View className="px-4 py-3.5">
          <Text className="text-text-tertiary text-sm">
            Maintenance targets your TDEE — no surplus or deficit.
          </Text>
        </View>
      )}
      {phase === "maintenance" && <Divider />}

      {/* Macro split editor for the active phase */}
      <MacroSplitEditor
        key={phase}
        phase={phase}
        profile={profile}
        onEditMacros={onEditMacros}
      />
    </View>
  );
}

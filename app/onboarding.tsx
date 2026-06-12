import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useProEntitlement } from "../hooks/useProEntitlement";
import { persistUserProfile } from "../lib/cycleStore";
import {
  USER_PROFILE_SINGLETON_ID,
  type Phase,
} from "../modules/expo-cycle-store/src/userProfile";
import { CUT_TIERS, SURPLUS_TIERS, type WeeklyDeltaTier } from "../utils/calorieTargets";
import { PHASE_COLOR, PHASE_LABEL } from "../utils/phase";

// CUTIOS-23 — phase-first onboarding. Welcome copy is phase-agnostic; cut-only
// setup is skipped for bulk users, maintenance needs no target step at all.

type Step = "welcome" | "phase" | "target";

const PHASE_OPTIONS: { phase: Phase; headline: string; detail: string }[] = [
  { phase: "cut", headline: "Cut", detail: "Lose fat while holding on to lean mass" },
  { phase: "bulk", headline: "Bulk", detail: "Build muscle with a controlled surplus" },
  { phase: "maintenance", headline: "Maintain", detail: "Hold steady and track your TDEE" },
];

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      className={`items-center py-4 rounded-2xl ${disabled ? "bg-surface-tertiary" : "bg-positive"}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
    >
      <Text className={disabled ? "text-text-tertiary font-bold" : "text-surface-primary font-bold"}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { entitled } = useProEntitlement();
  const [step, setStep] = useState<Step>("welcome");
  const [phase, setPhase] = useState<Phase | null>(null);
  const [weeklyDeltaKg, setWeeklyDeltaKg] = useState<number | null>(null);

  const finish = async (selectedPhase: Phase, deltaKg: number) => {
    try {
      await persistUserProfile({
        id: USER_PROFILE_SINGLETON_ID,
        currentPhase: selectedPhase,
        phaseStartDate: new Date().toISOString(),
        macroOverrides: {},
        targetWeightDeltaPerWeekKg: deltaKg,
      });
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[Onboarding] failed to save profile:", err);
      Alert.alert("Couldn't save your setup", "Please try again.");
    }
  };

  const selectPhase = (selected: Phase) => {
    // Bulk and maintenance are Pro-only (CUTIOS-24) — upsell before continuing.
    if (selected !== "cut" && !entitled) {
      router.push("/paywall");
      return;
    }
    setPhase(selected);
    setWeeklyDeltaKg(null);
    if (selected === "maintenance") {
      finish(selected, 0);
    } else {
      setStep("target");
    }
  };

  if (step === "welcome") {
    return (
      <SafeAreaView className="flex-1 bg-surface-primary">
        <View className="flex-1 justify-end px-6 pb-10">
          <Text className="text-text-primary text-4xl font-bold tracking-tight mb-3">
            Data-Driven Body Composition
          </Text>
          <Text className="text-text-tertiary text-base leading-6 mb-10">
            Cut, bulk, or maintain — CutEngine turns your weight trend, protocol, and
            calorie targets into one daily plan.
          </Text>
          <PrimaryButton label="Get started" onPress={() => setStep("phase")} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === "phase") {
    return (
      <SafeAreaView className="flex-1 bg-surface-primary">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
          <Text className="text-text-primary text-3xl font-bold mb-2">What phase are you in?</Text>
          <Text className="text-text-tertiary text-base mb-8">You can switch anytime in Settings.</Text>
          {PHASE_OPTIONS.map(({ phase: option, headline, detail }) => {
            const locked = option !== "cut" && !entitled;
            return (
              <TouchableOpacity
                key={option}
                className="bg-surface-secondary rounded-2xl p-5 mb-3"
                onPress={() => selectPhase(option)}
                accessibilityLabel={`${headline}${locked ? ", requires Pro" : ""}`}
              >
                <View className="flex-row items-center mb-1">
                  <Text className="text-xl font-bold" style={{ color: PHASE_COLOR[option] }}>
                    {headline}
                  </Text>
                  {locked && (
                    <View className="bg-attention/20 rounded-md px-1.5 py-0.5 ml-2">
                      <Text className="text-attention text-[10px] font-bold tracking-widest">PRO</Text>
                    </View>
                  )}
                </View>
                <Text className="text-text-tertiary text-sm">{detail}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // step === "target" — weekly pace for cut/bulk
  const tiers: WeeklyDeltaTier[] = phase === "bulk" ? SURPLUS_TIERS : CUT_TIERS;
  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
        <Text className="text-text-primary text-3xl font-bold mb-2">
          {phase === "bulk" ? "How fast do you want to gain?" : "How fast do you want to lose?"}
        </Text>
        <Text className="text-text-tertiary text-base mb-8">
          This sets your daily {phase === "bulk" ? "surplus" : "deficit"}. {PHASE_LABEL[phase ?? "cut"]} pace
          is adjustable later.
        </Text>
        {tiers.map((tier) => {
          const selected = weeklyDeltaKg === tier.weeklyDeltaKg;
          return (
            <TouchableOpacity
              key={tier.id}
              className={`rounded-2xl p-5 mb-3 ${selected ? "bg-positive/15 border border-positive" : "bg-surface-secondary"}`}
              onPress={() => setWeeklyDeltaKg(tier.weeklyDeltaKg)}
              accessibilityLabel={tier.label}
            >
              <Text className={`text-lg font-semibold ${selected ? "text-positive" : "text-text-primary"}`}>
                {tier.label}
              </Text>
              <Text className="text-text-tertiary text-sm">
                {Math.abs(tier.weeklyDeltaLbs)} lb per week
              </Text>
            </TouchableOpacity>
          );
        })}
        <View className="mt-4">
          <PrimaryButton
            label="Start tracking"
            disabled={weeklyDeltaKg == null}
            onPress={() => {
              if (phase && weeklyDeltaKg != null) {
                finish(phase, weeklyDeltaKg);
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

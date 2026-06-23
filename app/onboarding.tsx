import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useProEntitlement } from "../hooks/useProEntitlement";
import { hasUserProfile, persistUserProfile } from "../lib/cycleStore";
import {
  USER_PROFILE_SINGLETON_ID,
  type Phase,
} from "../modules/expo-cycle-store/src/userProfile";
import { CUT_TIERS, SURPLUS_TIERS, type WeeklyDeltaTier } from "../utils/calorieTargets";
import { PHASE_COLOR, PHASE_LABEL } from "../utils/phase";

// CUTIOS-23 — phase-first onboarding.

type Step = "welcome" | "phase" | "target";

const PHASE_OPTIONS: { phase: Phase; headline: string; detail: string }[] = [
  { phase: "cut", headline: "Cut", detail: "Lose fat while holding on to lean mass" },
  { phase: "bulk", headline: "Bulk", detail: "Build muscle with a controlled surplus" },
  { phase: "maintenance", headline: "Maintain", detail: "Hold steady and track your TDEE" },
];

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled ? styles.primaryButtonDisabled : styles.primaryButtonEnabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
    >
      <Text style={disabled ? styles.primaryButtonTextDisabled : styles.primaryButtonTextEnabled}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { entitled, loading: entitlementLoading, refresh: refreshEntitlement } = useProEntitlement();
  const [step, setStep] = useState<Step>("welcome");
  const [phase, setPhase] = useState<Phase | null>(null);
  const [weeklyDeltaKg, setWeeklyDeltaKg] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshEntitlement().catch(console.error);
    }, [refreshEntitlement]),
  );

  // Non-destructive guard: if a profile already exists we must never let
  // onboarding overwrite it — bounce straight back to the dashboard. Errors
  // are reported (not silently swallowed); hasUserProfile fails open, so a
  // store error resolves true here and also bounces, never trapping the user.
  useEffect(() => {
    let active = true;
    hasUserProfile()
      .then((exists) => {
        if (active && exists) router.replace("/(tabs)");
      })
      .catch((err) => Sentry.captureException(err));
    return () => {
      active = false;
    };
  }, [router]);

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
    if (selected !== "cut" && entitlementLoading) return;
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
      <SafeAreaView style={styles.screen}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Data-Driven Body Composition</Text>
          <Text style={styles.welcomeBody}>
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
      <SafeAreaView style={styles.screen}>
        <ScrollView style={styles.flex1Px6} contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
          <Text style={styles.stepTitle}>What phase are you in?</Text>
          <Text style={styles.stepSubtitle}>You can switch anytime in Settings.</Text>
          {PHASE_OPTIONS.map(({ phase: option, headline, detail }) => {
            const locked = option !== "cut" && !entitled;
            return (
              <TouchableOpacity
                key={option}
                style={styles.phaseCard}
                onPress={() => selectPhase(option)}
                accessibilityLabel={`${headline}${locked ? ", requires Pro" : ""}`}
              >
                <View style={styles.phaseCardHeader}>
                  <Text style={[styles.phaseHeadline, { color: PHASE_COLOR[option] }]}>
                    {headline}
                  </Text>
                  {locked && (
                    <View style={styles.proPill}>
                      <Text style={styles.proPillText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.phaseDetail}>{detail}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const tiers: WeeklyDeltaTier[] = phase === "bulk" ? SURPLUS_TIERS : CUT_TIERS;
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.flex1Px6} contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
        <Text style={styles.stepTitle}>
          {phase === "bulk" ? "How fast do you want to gain?" : "How fast do you want to lose?"}
        </Text>
        <Text style={styles.stepSubtitle}>
          This sets your daily {phase === "bulk" ? "surplus" : "deficit"}. {PHASE_LABEL[phase ?? "cut"]} pace
          is adjustable later.
        </Text>
        {tiers.map((tier) => {
          const selected = weeklyDeltaKg === tier.weeklyDeltaKg;
          return (
            <TouchableOpacity
              key={tier.id}
              style={[styles.tierCard, selected ? styles.tierCardSelected : styles.tierCardDefault]}
              onPress={() => setWeeklyDeltaKg(tier.weeklyDeltaKg)}
              accessibilityLabel={tier.label}
            >
              <Text style={[styles.tierLabel, selected ? styles.tierLabelSelected : styles.tierLabelDefault]}>
                {tier.label}
              </Text>
              <Text style={styles.tierDetail}>
                {Math.abs(tier.weeklyDeltaLbs)} lb per week
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.mt4}>
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

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
  },
  flex1Px6: { flex: 1, paddingHorizontal: 24 },
  welcomeContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeTitle: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  welcomeBody: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.base,
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonEnabled: {
    backgroundColor: theme.colors.positive,
  },
  primaryButtonDisabled: {
    backgroundColor: theme.colors.surfaceTertiary,
  },
  primaryButtonTextEnabled: {
    color: theme.colors.surfacePrimary,
    fontWeight: theme.fontWeight.bold,
  },
  primaryButtonTextDisabled: {
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.bold,
  },
  stepTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    marginBottom: 8,
  },
  stepSubtitle: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.base,
    marginBottom: 32,
  },
  phaseCard: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  phaseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  phaseHeadline: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  proPill: {
    backgroundColor: "rgba(255,159,10,0.2)",
    borderRadius: theme.radius.md,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  proPillText: {
    color: theme.colors.attention,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1.5,
  },
  phaseDetail: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  tierCardDefault: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  tierCardSelected: {
    backgroundColor: "rgba(52,199,89,0.15)",
    borderWidth: 1,
    borderColor: theme.colors.positive,
  },
  tierLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  tierLabelDefault: {
    color: theme.colors.textPrimary,
  },
  tierLabelSelected: {
    color: theme.colors.positive,
  },
  tierDetail: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
  mt4: { marginTop: 16 },
}));

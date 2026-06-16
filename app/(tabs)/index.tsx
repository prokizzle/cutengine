import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckInCard } from "../../components/today/CheckInCard";
import { ComplianceRiskCard } from "../../components/today/ComplianceRiskCard";
import { HealthKitWidget } from "../../components/today/HealthKitWidget";
import { PhaseSuggestionCard } from "../../components/today/PhaseSuggestionCard";
import { useHealthKit } from "../../hooks/useHealthKit";
import { useUserProfile } from "../../hooks/useUserProfile";
import { loadBiofeedbackEntries, persistBiofeedbackEntry } from "../../lib/cycleStore";
import { macroRatioFor, type Phase } from "../../modules/expo-cycle-store/src/userProfile";
import type { BiofeedbackAnswer, BiofeedbackEntry } from "../../modules/expo-cycle-store/src/biofeedback";
import { questionsForPhase } from "../../utils/biofeedback";
import { dailyTargetKcal, macroGramsFor } from "../../utils/calorieTargets";
import { localDayKey } from "../../utils/complianceDataset";
import { predictTodayMissRisk } from "../../utils/compliancePredictor";
import { phaseDurationWeeks } from "../../utils/phase";
import { suggestPhaseChange, type WeightSample } from "../../utils/phaseSuggestion";
import { uuidv4 } from "../../utils/uuid";
import { kgToLbs } from "../../utils/weight";

const KCAL_PER_KG_BASELINE = 30;

const PHASE_COPY: Record<Phase, { label: string; accent: "positive" | "attention" | "info" }> = {
  cut: { label: "CUT", accent: "positive" },
  bulk: { label: "BULK", accent: "attention" },
  maintenance: { label: "MAINTAIN", accent: "info" },
};

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function weeklyWeightDeltaLbs(history: WeightSample[]): number | null {
  if (history.length < 2) return null;
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const latest = sorted[sorted.length - 1];
  const cutoff = new Date(latest.date).getTime() - 7 * 24 * 60 * 60 * 1000;
  const earliest = sorted.find((s) => new Date(s.date).getTime() >= cutoff) ?? sorted[0];
  if (earliest === latest) return null;
  return kgToLbs(latest.kg - earliest.kg);
}

type Status = "on-track" | "watch" | "action";

function statusFromRisk(level: "low" | "moderate" | "high" | undefined): Status {
  if (level === "high") return "action";
  if (level === "moderate") return "watch";
  return "on-track";
}

const STATUS_LABEL: Record<Status, string> = {
  "on-track": "ON TRACK",
  watch: "WATCH",
  action: "ACTION NEEDED",
};

export default function TodayScreen() {
  const { ready, weightKg, weightLbs, weightHistory, weightInput, setWeightInput, logWeight } =
    useHealthKit();
  const { profile } = useUserProfile();
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [biofeedbackEntries, setBiofeedbackEntries] = useState<BiofeedbackEntry[]>([]);
  const [dismissedSuggestionKind, setDismissedSuggestionKind] = useState<string | null>(null);
  const [dismissedRiskDay, setDismissedRiskDay] = useState<string | null>(null);

  useEffect(() => {
    loadBiofeedbackEntries()
      .then((entries) => {
        setBiofeedbackEntries(entries);
        const hasTodayEntry = entries.some((entry) =>
          isSameDay(new Date(entry.date), new Date()),
        );
        if (hasTodayEntry) setCheckedInToday(true);
      })
      .catch((err) => Sentry.captureException(err));
  }, []);

  const submitCheckIn = useCallback(
    (answers: BiofeedbackAnswer[]) => {
      if (!profile) return;
      const entry: BiofeedbackEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        phase: profile.currentPhase,
        answers,
      };
      persistBiofeedbackEntry(entry)
        .then(() => {
          setCheckedInToday(true);
          setBiofeedbackEntries((prev) => [...prev, entry]);
        })
        .catch((err) => Sentry.captureException(err));
    },
    [profile],
  );

  const phase = profile?.currentPhase ?? null;
  const phaseCopy = phase ? PHASE_COPY[phase] : null;

  const tdeeEstimate = weightKg ? Math.round(weightKg * KCAL_PER_KG_BASELINE) : null;
  const calorieTarget =
    profile && tdeeEstimate ? dailyTargetKcal(tdeeEstimate, profile) : null;
  const macros =
    profile && calorieTarget
      ? macroGramsFor(calorieTarget, macroRatioFor(profile, profile.currentPhase))
      : null;

  const weekNumber = profile ? phaseDurationWeeks(profile.phaseStartDate) + 1 : null;
  const weeklyDeltaLbs = useMemo(() => weeklyWeightDeltaLbs(weightHistory), [weightHistory]);

  const suggestion = profile ? suggestPhaseChange(weightHistory, profile) : null;
  const missRisk = useMemo(
    () => (profile ? predictTodayMissRisk(biofeedbackEntries, profile) : null),
    [biofeedbackEntries, profile],
  );
  const status = statusFromRisk(missRisk?.level);

  const today = new Date();
  const dateLabel = DATE_FMT.format(today).toUpperCase();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <TopRow date={dateLabel} status={status} />

        {phaseCopy && (
          <HeroCard
            phaseLabel={phaseCopy.label}
            accent={phaseCopy.accent}
            weekNumber={weekNumber}
            calorieTarget={calorieTarget}
            weightLbs={weightLbs}
            weeklyDeltaLbs={weeklyDeltaLbs}
          />
        )}

        {macros && calorieTarget && (
          <MacroSummary
            kcal={calorieTarget}
            protein={macros.protein}
            carbs={macros.carbs}
            fat={macros.fat}
          />
        )}

        {suggestion && suggestion.kind !== dismissedSuggestionKind && (
          <PhaseSuggestionCard
            suggestion={suggestion}
            onDismiss={() => setDismissedSuggestionKind(suggestion.kind)}
          />
        )}

        {missRisk && !checkedInToday && dismissedRiskDay !== localDayKey(today) && (
          <ComplianceRiskCard
            prediction={missRisk}
            onDismiss={() => setDismissedRiskDay(localDayKey(today))}
          />
        )}

        <HealthKitWidget
          ready={ready}
          weightKg={weightKg}
          weightInput={weightInput}
          onWeightInputChange={setWeightInput}
          onLogWeight={logWeight}
        />

        {profile && (
          <CheckInCard
            questions={questionsForPhase(phase!)}
            completedToday={checkedInToday}
            onSubmit={submitCheckIn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TopRow({ date, status }: { date: string; status: Status }) {
  return (
    <View style={styles.topRow}>
      <Text style={styles.topDate}>{date}</Text>
      <View style={styles.topSep} />
      <View style={styles.topStatusGroup}>
        <View style={[styles.statusDot, styles[`statusDot_${status}` as const]]} />
        <Text style={[styles.statusLabel, styles[`statusLabel_${status}` as const]]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>
    </View>
  );
}

type HeroCardProps = {
  phaseLabel: string;
  accent: "positive" | "attention" | "info";
  weekNumber: number | null;
  calorieTarget: number | null;
  weightLbs: number | null;
  weeklyDeltaLbs: number | null;
};

function HeroCard({
  phaseLabel,
  accent,
  weekNumber,
  calorieTarget,
  weightLbs,
  weeklyDeltaLbs,
}: HeroCardProps) {
  const deltaSign = weeklyDeltaLbs == null ? "" : weeklyDeltaLbs > 0 ? "+" : "";
  return (
    <View style={[styles.heroCard, styles[`heroCard_${accent}` as const]]}>
      <View style={styles.heroHeaderRow}>
        <Text style={styles.heroPhaseLabel}>PHASE</Text>
        {weekNumber != null && (
          <Text style={styles.heroWeekLabel}>WK {weekNumber}</Text>
        )}
      </View>
      <Text style={[styles.heroPhaseValue, styles[`heroPhaseValue_${accent}` as const]]}>
        {phaseLabel}
      </Text>

      <View style={styles.heroBottomRow}>
        <View>
          {calorieTarget != null ? (
            <>
              <View style={styles.heroNumberRow}>
                <Text style={styles.heroNumber}>
                  {calorieTarget.toLocaleString()}
                </Text>
                <Text style={styles.heroUnit}>kcal</Text>
              </View>
              <Text style={styles.heroSubLabel}>DAILY TARGET</Text>
            </>
          ) : (
            <Text style={styles.heroEmptyLabel}>Log weight to estimate target</Text>
          )}
        </View>
        {weightLbs != null && (
          <View style={styles.heroWeightCol}>
            <View style={styles.heroNumberRow}>
              <Text style={styles.heroWeightNumber}>{weightLbs.toFixed(1)}</Text>
              <Text style={styles.heroUnit}>lb</Text>
            </View>
            {weeklyDeltaLbs != null && (
              <Text
                style={[
                  styles.heroDeltaLabel,
                  weeklyDeltaLbs <= 0 ? styles.heroDeltaDown : styles.heroDeltaUp,
                ]}
              >
                {deltaSign}
                {weeklyDeltaLbs.toFixed(1)} lb / wk
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function MacroSummary({
  kcal,
  protein,
  carbs,
  fat,
}: {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  const pPct = (protein * 4) / total;
  const cPct = (carbs * 4) / total;
  const fPct = (fat * 9) / total;
  return (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroHeading}>MACROS</Text>
        <Text style={styles.macroKcal}>{kcal.toLocaleString()} kcal</Text>
      </View>
      <View style={styles.macroBar}>
        <View style={[styles.macroBarSeg, { flex: pPct, backgroundColor: "#0a84ff" }]} />
        <View style={[styles.macroBarSeg, { flex: cPct, backgroundColor: "#ff9f0a" }]} />
        <View style={[styles.macroBarSeg, { flex: fPct, backgroundColor: "#bf5af2" }]} />
      </View>
      <View style={styles.macroLegend}>
        <View style={styles.macroLegendItem}>
          <Text style={[styles.macroLegendLetter, styles.macroLegendP]}>P</Text>
          <Text style={styles.macroLegendValue}>{protein}g</Text>
        </View>
        <View style={styles.macroLegendItem}>
          <Text style={[styles.macroLegendLetter, styles.macroLegendC]}>C</Text>
          <Text style={styles.macroLegendValue}>{carbs}g</Text>
        </View>
        <View style={styles.macroLegendItem}>
          <Text style={[styles.macroLegendLetter, styles.macroLegendF]}>F</Text>
          <Text style={styles.macroLegendValue}>{fat}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
  },
  flex1: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 10,
  },
  topDate: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.4,
  },
  topSep: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.textTertiary,
  },
  topStatusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  "statusDot_on-track": { backgroundColor: theme.colors.positive },
  statusDot_watch: { backgroundColor: theme.colors.attention },
  statusDot_action: { backgroundColor: theme.colors.warning },
  statusLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.3,
  },
  "statusLabel_on-track": { color: theme.colors.positive },
  statusLabel_watch: { color: theme.colors.attention },
  statusLabel_action: { color: theme.colors.warning },

  heroCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.elev,
  },
  heroCard_positive: { borderColor: "rgba(52,199,89,0.22)" },
  heroCard_attention: { borderColor: "rgba(255,159,10,0.22)" },
  heroCard_info: { borderColor: "rgba(10,132,255,0.22)" },

  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  heroPhaseLabel: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.8,
  },
  heroWeekLabel: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 0.6,
  },
  heroPhaseValue: {
    fontSize: 34,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  heroPhaseValue_positive: { color: theme.colors.positive },
  heroPhaseValue_attention: { color: theme.colors.attention },
  heroPhaseValue_info: { color: theme.colors.info },

  heroBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  heroNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  heroNumber: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: -0.5,
  },
  heroWeightNumber: {
    color: theme.colors.textSecondary,
    fontSize: 22,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: -0.5,
  },
  heroUnit: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
  },
  heroSubLabel: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  heroEmptyLabel: {
    color: theme.colors.textTertiary,
    fontSize: 13,
    fontWeight: theme.fontWeight.medium,
  },
  heroWeightCol: { alignItems: "flex-end" },
  heroDeltaLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.semibold,
    marginTop: 4,
  },
  heroDeltaDown: { color: theme.colors.positive },
  heroDeltaUp: { color: theme.colors.attention },

  macroCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: theme.colors.elev,
    borderRadius: theme.radius.lg,
    padding: 14,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  macroHeading: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.4,
  },
  macroKcal: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
  },
  macroBar: {
    flexDirection: "row",
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  macroBarSeg: { height: "100%" },
  macroLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroLegendItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  macroLegendLetter: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  macroLegendP: { color: theme.colors.info },
  macroLegendC: { color: theme.colors.attention },
  macroLegendF: { color: theme.colors.anaerobic },
  macroLegendValue: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
  },
}));

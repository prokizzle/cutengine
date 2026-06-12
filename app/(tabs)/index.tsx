import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimelineHero } from "../../components/timeline/TimelineHero";
import { MacroTargets } from "../../components/timeline/MacroTargets";
import { TimelineSpine } from "../../components/timeline/TimelineSpine";
import { CheckInCard } from "../../components/today/CheckInCard";
import { HealthKitWidget } from "../../components/today/HealthKitWidget";
import { PhaseBadge } from "../../components/today/PhaseBadge";
import { PhaseSuggestionCard } from "../../components/today/PhaseSuggestionCard";
import { useHealthKit } from "../../hooks/useHealthKit";
import { useUserProfile } from "../../hooks/useUserProfile";
import { loadBiofeedbackEntries, persistBiofeedbackEntry } from "../../lib/cycleStore";
import { macroRatioFor } from "../../modules/expo-cycle-store/src/userProfile";
import type { BiofeedbackAnswer } from "../../modules/expo-cycle-store/src/biofeedback";
import { questionsForPhase } from "../../utils/biofeedback";
import { dailyTargetKcal, macroGramsFor } from "../../utils/calorieTargets";
import { phaseDurationWeeks } from "../../utils/phase";
import { suggestPhaseChange } from "../../utils/phaseSuggestion";
import { uuidv4 } from "../../utils/uuid";
import type { DoseEvent } from "../../types/timeline";

const MOCK_DOSE_EVENTS: DoseEvent[] = [
  { id: "1", name: "Creatine", dose: 5, unit: "g", timeOfDay: "morning", sortOrder: 0, taken: true },
  { id: "2", name: "Vitamin D", dose: 2000, unit: "IU", timeOfDay: "morning", sortOrder: 1, taken: false },
  { id: "3", name: "Post-workout shake", timeOfDay: "midday", sortOrder: 2, taken: false },
  { id: "4", name: "Omega-3", dose: 2, unit: "caps", timeOfDay: "withMeals", sortOrder: 3, taken: false },
  { id: "5", name: "Magnesium", dose: 400, unit: "mg", timeOfDay: "bedtime", sortOrder: 4, taken: false },
  { id: "6", name: "Test E", dose: 250, unit: "mg", timeOfDay: "morning", sortOrder: 5, taken: false, regimen: "Cycle A", weekLabel: "week 3/12" },
];

// Mock until the adaptive TDEE engine (expo-calorie-engine) ships.
const MOCK_TDEE = 2400;

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export default function TodayScreen() {
  const { ready, weightKg, weightLbs, weightHistory, weightInput, setWeightInput, logWeight } =
    useHealthKit();
  const { profile } = useUserProfile();
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  useEffect(() => {
    loadBiofeedbackEntries()
      .then((entries) => {
        const latest = entries[0];
        if (latest && isSameDay(new Date(latest.date), new Date())) {
          setCheckedInToday(true);
        }
      })
      .catch(console.error);
  }, []);

  const submitCheckIn = useCallback(
    (answers: BiofeedbackAnswer[]) => {
      if (!profile) return;
      persistBiofeedbackEntry({
        id: uuidv4(),
        date: new Date().toISOString(),
        phase: profile.currentPhase,
        answers,
      })
        .then(() => setCheckedInToday(true))
        .catch(console.error);
    },
    [profile],
  );

  const phase = profile?.currentPhase ?? "cut";
  const calorieTarget = profile ? dailyTargetKcal(MOCK_TDEE, profile) : 2150;
  const macros = profile
    ? macroGramsFor(calorieTarget, macroRatioFor(profile, phase))
    : { protein: 185, carbs: 160, fat: 55 };

  const suggestion = profile ? suggestPhaseChange(weightHistory, profile) : null;

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {profile && (
          <View className="px-5 pt-4">
            <PhaseBadge
              phase={phase}
              detail={`Week ${phaseDurationWeeks(profile.phaseStartDate) + 1}`}
            />
          </View>
        )}
        <TimelineHero
          date={new Date()}
          calorieTarget={calorieTarget}
          calorieDelta={-85}
          dosedCount={1}
          dosedTotal={6}
          bodyWeight={weightLbs ?? 188.4}
          weightDelta={-2.3}
          phase={phase}
        />
        {suggestion && !suggestionDismissed && (
          <PhaseSuggestionCard
            suggestion={suggestion}
            onDismiss={() => setSuggestionDismissed(true)}
          />
        )}
        <HealthKitWidget
          ready={ready}
          weightKg={weightKg}
          weightInput={weightInput}
          onWeightInputChange={setWeightInput}
          onLogWeight={logWeight}
        />
        <MacroTargets protein={macros.protein} carbs={macros.carbs} fat={macros.fat} />
        {profile && (
          <CheckInCard
            questions={questionsForPhase(phase)}
            completedToday={checkedInToday}
            onSubmit={submitCheckIn}
          />
        )}
        <TimelineSpine events={MOCK_DOSE_EVENTS} />
      </ScrollView>
    </SafeAreaView>
  );
}

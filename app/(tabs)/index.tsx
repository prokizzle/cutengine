import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimelineHero } from "../../components/timeline/TimelineHero";
import { MacroTargets } from "../../components/timeline/MacroTargets";
import { TimelineSpine } from "../../components/timeline/TimelineSpine";
import { HealthKitWidget } from "../../components/today/HealthKitWidget";
import { useHealthKit } from "../../hooks/useHealthKit";
import type { DoseEvent } from "../../types/timeline";

const MOCK_DOSE_EVENTS: DoseEvent[] = [
  { id: "1", name: "Creatine", dose: 5, unit: "g", timeOfDay: "morning", sortOrder: 0, taken: true },
  { id: "2", name: "Vitamin D", dose: 2000, unit: "IU", timeOfDay: "morning", sortOrder: 1, taken: false },
  { id: "3", name: "Post-workout shake", timeOfDay: "midday", sortOrder: 2, taken: false },
  { id: "4", name: "Omega-3", dose: 2, unit: "caps", timeOfDay: "withMeals", sortOrder: 3, taken: false },
  { id: "5", name: "Magnesium", dose: 400, unit: "mg", timeOfDay: "bedtime", sortOrder: 4, taken: false },
  { id: "6", name: "Test E", dose: 250, unit: "mg", timeOfDay: "morning", sortOrder: 5, taken: false, regimen: "Cycle A", weekLabel: "week 3/12" },
];

export default function TodayScreen() {
  const { ready, weightKg, weightLbs, weightInput, setWeightInput, logWeight } =
    useHealthKit();

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <TimelineHero
          date={new Date()}
          calorieTarget={2150}
          calorieDelta={-85}
          dosedCount={1}
          dosedTotal={6}
          bodyWeight={weightLbs ?? 188.4}
          weightDelta={-2.3}
        />
        <HealthKitWidget
          ready={ready}
          weightKg={weightKg}
          weightInput={weightInput}
          onWeightInputChange={setWeightInput}
          onLogWeight={logWeight}
        />
        <MacroTargets protein={185} carbs={160} fat={55} />
        <TimelineSpine events={MOCK_DOSE_EVENTS} />
      </ScrollView>
    </SafeAreaView>
  );
}

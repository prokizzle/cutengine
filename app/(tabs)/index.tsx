import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimelineHero } from "@/components/timeline/TimelineHero";
import { MacroTargets } from "@/components/timeline/MacroTargets";
import { TimelineSpine } from "@/components/timeline/TimelineSpine";

const MOCK_DOSE_EVENTS = [
  {
    id: "1",
    name: "Creatine",
    dose: 5,
    unit: "g",
    timeOfDay: "morning" as const,
    sortOrder: 0,
    taken: true,
  },
  {
    id: "2",
    name: "Vitamin D",
    dose: 2000,
    unit: "IU",
    timeOfDay: "morning" as const,
    sortOrder: 1,
    taken: false,
  },
  {
    id: "3",
    name: "Post-workout shake",
    dose: undefined,
    unit: undefined,
    timeOfDay: "midday" as const,
    sortOrder: 2,
    taken: false,
  },
  {
    id: "4",
    name: "Omega-3",
    dose: 2,
    unit: "caps",
    timeOfDay: "withMeals" as const,
    sortOrder: 3,
    taken: false,
  },
  {
    id: "5",
    name: "Magnesium",
    dose: 400,
    unit: "mg",
    timeOfDay: "bedtime" as const,
    sortOrder: 4,
    taken: false,
  },
  {
    id: "6",
    name: "Test E",
    dose: 250,
    unit: "mg",
    timeOfDay: "morning" as const,
    sortOrder: 5,
    taken: false,
    regimen: "Cycle A",
    weekLabel: "week 3/12",
  },
];

export default function TodayScreen() {
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
          bodyWeight={188.4}
          weightDelta={-2.3}
        />

        <MacroTargets protein={185} carbs={160} fat={55} />

        <TimelineSpine events={MOCK_DOSE_EVENTS} />
      </ScrollView>
    </SafeAreaView>
  );
}

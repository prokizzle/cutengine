import { Text, View } from "react-native";
import type { Phase } from "../../modules/expo-cycle-store/src/userProfile";

type Props = {
  date: Date;
  calorieTarget: number;
  calorieDelta: number;
  dosedCount: number;
  dosedTotal: number;
  bodyWeight: number;
  weightDelta: number;
  /** Colors deltas phase-appropriately: deficit is good in a cut, surplus in a bulk. */
  phase?: Phase;
};

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

/** Whether a signed delta is "on plan" for the phase. */
function deltaOnPlan(delta: number, phase: Phase): boolean {
  switch (phase) {
    case "cut":
      return delta <= 0;
    case "bulk":
      return delta >= 0;
    case "maintenance":
      return Math.abs(delta) <= 100;
  }
}

function weightOnPlan(delta: number, phase: Phase): boolean {
  switch (phase) {
    case "cut":
      return delta <= 0;
    case "bulk":
      return delta >= 0;
    case "maintenance":
      return Math.abs(delta) <= 0.5;
  }
}

export function TimelineHero({
  date,
  calorieTarget,
  calorieDelta,
  dosedCount,
  dosedTotal,
  bodyWeight,
  weightDelta,
  phase = "cut",
}: Props) {
  const deltaSign = calorieDelta <= 0 ? "" : "+";
  const deltaColor = deltaOnPlan(calorieDelta, phase) ? "text-positive" : "text-warning";
  const weightSign = weightDelta <= 0 ? "" : "+";
  const weightColor = weightOnPlan(weightDelta, phase) ? "text-positive" : "text-warning";

  return (
    <View className="px-5 pt-6 pb-4">
      {/* Date row */}
      <Text className="text-text-tertiary text-sm mb-1">
        {weekdayFormatter.format(date)}, {monthDayFormatter.format(date)}
      </Text>

      {/* Hero metric: calorie target */}
      <View className="flex-row items-baseline gap-2 mt-1">
        <Text className="text-text-primary text-5xl font-bold tracking-tighter">
          {calorieTarget.toLocaleString()}
        </Text>
        <Text className="text-text-secondary text-lg">kcal</Text>
        {calorieDelta !== 0 && (
          <Text className={`${deltaColor} text-base font-medium ml-1`}>
            {deltaSign}
            {calorieDelta}
          </Text>
        )}
      </View>

      {/* Progress pill + weight */}
      <View className="flex-row items-center gap-4 mt-3">
        {/* Dose progress pill */}
        <View className="flex-row items-center bg-surface-secondary rounded-full px-3 py-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-positive mr-2" />
          <Text className="text-text-secondary text-xs font-medium">
            {dosedCount}/{dosedTotal} dosed
          </Text>
        </View>

        {/* Weight */}
        <Text className="text-text-tertiary text-sm">
          {bodyWeight.toFixed(1)} lb{" "}
          <Text className={weightColor}>
            {weightSign}
            {weightDelta.toFixed(1)}
          </Text>
        </Text>
      </View>
    </View>
  );
}

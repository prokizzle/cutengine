import { Text, View } from "react-native";

type Props = {
  date: Date;
  calorieTarget: number;
  calorieDelta: number;
  dosedCount: number;
  dosedTotal: number;
  bodyWeight: number;
  weightDelta: number;
};

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

export function TimelineHero({
  date,
  calorieTarget,
  calorieDelta,
  dosedCount,
  dosedTotal,
  bodyWeight,
  weightDelta,
}: Props) {
  const deltaSign = calorieDelta <= 0 ? "" : "+";
  const deltaColor = calorieDelta <= 0 ? "text-positive" : "text-warning";
  const weightSign = weightDelta <= 0 ? "" : "+";

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
          <Text className={weightDelta <= 0 ? "text-positive" : "text-warning"}>
            {weightSign}
            {weightDelta.toFixed(1)}
          </Text>
        </Text>
      </View>
    </View>
  );
}

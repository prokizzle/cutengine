import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Phase } from "../../modules/expo-cycle-store/src/userProfile";

type Props = {
  date: Date;
  calorieTarget: number;
  calorieDelta: number;
  dosedCount: number;
  dosedTotal: number;
  bodyWeight: number;
  weightDelta: number;
  /** Colors deltas phase-appropriately. */
  phase?: Phase;
};

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

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
  const deltaOk = deltaOnPlan(calorieDelta, phase);
  const weightSign = weightDelta <= 0 ? "" : "+";
  const weightOk = weightOnPlan(weightDelta, phase);

  return (
    <View style={styles.container}>
      <Text style={styles.date}>
        {weekdayFormatter.format(date)}, {monthDayFormatter.format(date)}
      </Text>

      <View style={styles.heroRow}>
        <Text style={styles.heroNumber}>
          {calorieTarget.toLocaleString()}
        </Text>
        <Text style={styles.heroUnit}>kcal</Text>
        {calorieDelta !== 0 && (
          <Text style={[styles.delta, deltaOk ? styles.positive : styles.warning]}>
            {deltaSign}
            {calorieDelta}
          </Text>
        )}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.dosePill}>
          <View style={styles.doseDot} />
          <Text style={styles.doseText}>
            {dosedCount}/{dosedTotal} dosed
          </Text>
        </View>

        <Text style={styles.weight}>
          {bodyWeight.toFixed(1)} lb{" "}
          <Text style={weightOk ? styles.positive : styles.warning}>
            {weightSign}
            {weightDelta.toFixed(1)}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  date: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    marginBottom: 4,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  heroNumber: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: -1,
  },
  heroUnit: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.lg,
  },
  delta: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    marginLeft: 4,
  },
  positive: { color: theme.colors.positive },
  warning: { color: theme.colors.warning },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  dosePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doseDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.positive,
    marginRight: 8,
  },
  doseText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  weight: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
}));

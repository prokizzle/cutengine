import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimelineHero } from "../../components/timeline/TimelineHero";
import { MacroTargets } from "../../components/timeline/MacroTargets";
import { TimelineSpine } from "../../components/timeline/TimelineSpine";
import {
  initHealthKit,
  readLatestWeight,
  writeWeight,
} from "../../lib/healthKit";

const MOCK_DOSE_EVENTS = [
  { id: "1", name: "Creatine", dose: 5, unit: "g", timeOfDay: "morning" as const, sortOrder: 0, taken: true },
  { id: "2", name: "Vitamin D", dose: 2000, unit: "IU", timeOfDay: "morning" as const, sortOrder: 1, taken: false },
  { id: "3", name: "Post-workout shake", dose: undefined, unit: undefined, timeOfDay: "midday" as const, sortOrder: 2, taken: false },
  { id: "4", name: "Omega-3", dose: 2, unit: "caps", timeOfDay: "withMeals" as const, sortOrder: 3, taken: false },
  { id: "5", name: "Magnesium", dose: 400, unit: "mg", timeOfDay: "bedtime" as const, sortOrder: 4, taken: false },
  { id: "6", name: "Test E", dose: 250, unit: "mg", timeOfDay: "morning" as const, sortOrder: 5, taken: false, regimen: "Cycle A", weekLabel: "week 3/12" },
];

export default function TodayScreen() {
  const [hkReady, setHkReady] = useState(false);
  const [hkWeight, setHkWeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    initHealthKit()
      .then((ok) => {
        setHkReady(ok);
        if (ok) readLatestWeight().then(setHkWeight).catch(console.error);
      })
      .catch(console.error);
  }, []);

  const handleLogWeight = async () => {
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg <= 0) {
      Alert.alert("Invalid weight", "Enter a positive number (kg)");
      return;
    }
    try {
      await writeWeight(kg);
      setHkWeight(kg);
      setWeightInput("");
      Alert.alert("Saved", `Logged ${kg} kg to HealthKit`);
    } catch {
      Alert.alert("Error", "Failed to write weight to HealthKit");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <TimelineHero
          date={new Date()}
          calorieTarget={2150}
          calorieDelta={-85}
          dosedCount={1}
          dosedTotal={6}
          bodyWeight={hkWeight != null ? hkWeight * 2.20462 : 188.4}
          weightDelta={-2.3}
        />

        <View className="mx-5 mb-4 bg-surface-secondary rounded-2xl px-4 py-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-text-secondary text-sm font-medium">HealthKit</Text>
            <View className={`w-2 h-2 rounded-full ${hkReady ? "bg-positive" : "bg-warning"}`} />
          </View>
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 bg-surface-tertiary rounded-lg px-3 py-2 text-text-primary text-base"
              placeholder="Weight (kg)"
              placeholderTextColor="#8e8e93"
              keyboardType="decimal-pad"
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <TouchableOpacity className="bg-positive rounded-lg px-4 py-2" onPress={handleLogWeight}>
              <Text className="text-white font-semibold text-sm">Log</Text>
            </TouchableOpacity>
          </View>
          {hkWeight != null && (
            <Text className="text-text-tertiary text-xs mt-2">
              Last HK weight: {hkWeight.toFixed(1)} kg ({(hkWeight * 2.20462).toFixed(1)} lb)
            </Text>
          )}
        </View>

        <MacroTargets protein={185} carbs={160} fat={55} />
        <TimelineSpine events={MOCK_DOSE_EVENTS} />
      </ScrollView>
    </SafeAreaView>
  );
}

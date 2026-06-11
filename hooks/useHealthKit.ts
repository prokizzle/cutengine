import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { initHealthKit, readLatestWeight, writeWeight } from "../lib/healthKit";
import { kgToLbs } from "../utils/weight";

type UseHealthKitResult = {
  ready: boolean;
  weightKg: number | null;
  weightLbs: number | null;
  weightInput: string;
  setWeightInput: (v: string) => void;
  logWeight: () => Promise<void>;
};

export function useHealthKit(): UseHealthKitResult {
  const [ready, setReady] = useState(false);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    initHealthKit()
      .then((ok) => {
        setReady(ok);
        if (ok) readLatestWeight().then(setWeightKg).catch(console.error);
      })
      .catch(console.error);
  }, []);

  const logWeight = useCallback(async () => {
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg <= 0) {
      Alert.alert("Invalid weight", "Enter a positive number (kg)");
      return;
    }
    try {
      await writeWeight(kg);
      setWeightKg(kg);
      setWeightInput("");
      Alert.alert("Saved", `Logged ${kg} kg to HealthKit`);
    } catch {
      Alert.alert("Error", "Failed to write weight to HealthKit");
    }
  }, [weightInput]);

  return {
    ready,
    weightKg,
    weightLbs: weightKg != null ? kgToLbs(weightKg) : null,
    weightInput,
    setWeightInput,
    logWeight,
  };
}

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  initHealthKit,
  readLatestWeight,
  readWeightHistory,
  writeWeight,
} from "../lib/healthKit";
import { kgToLbs } from "../utils/weight";
import type { WeightSample } from "../utils/phaseSuggestion";

type UseHealthKitResult = {
  ready: boolean;
  weightKg: number | null;
  weightLbs: number | null;
  /** Trailing bodyMass samples (ascending) — feeds the phase trend engine. */
  weightHistory: WeightSample[];
  weightInput: string;
  setWeightInput: (v: string) => void;
  logWeight: () => Promise<void>;
};

export function useHealthKit(): UseHealthKitResult {
  const [ready, setReady] = useState(false);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightSample[]>([]);
  const [weightInput, setWeightInput] = useState("");

  const refreshHistory = useCallback(
    () => readWeightHistory().then(setWeightHistory),
    [],
  );

  useEffect(() => {
    initHealthKit()
      .then((ok) => {
        setReady(ok);
        if (ok) {
          readLatestWeight().then(setWeightKg).catch(console.error);
          refreshHistory().catch(console.error);
        }
      })
      .catch(console.error);
  }, [refreshHistory]);

  const logWeight = useCallback(async () => {
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg <= 0) {
      Alert.alert("Invalid weight", "Enter a positive number (kg)");
      return;
    }
    try {
      await writeWeight(kg);
    } catch {
      Alert.alert("Error", "Failed to write weight to HealthKit");
      return;
    }
    setWeightKg(kg);
    setWeightInput("");
    // The write succeeded — a history refresh failure shouldn't read as a
    // failed save, but wait for it so the trend engine sees the new sample.
    await refreshHistory().catch(console.error);
    Alert.alert("Saved", `Logged ${kg} kg to HealthKit`);
  }, [weightInput, refreshHistory]);

  return {
    ready,
    weightKg,
    weightLbs: weightKg != null ? kgToLbs(weightKg) : null,
    weightHistory,
    weightInput,
    setWeightInput,
    logWeight,
  };
}

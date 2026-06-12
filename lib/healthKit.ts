import { Platform } from "react-native";

// Local Expo Module — resolved at build time, not by tsc
const ExpoHealthKit = require("../modules/expo-healthkit/src").default as {
  requestAuthorization: (read: string[], write: string[]) => Promise<boolean>;
  saveWeight: (kg: number, date?: Date) => Promise<void>;
  getLatestWeight: () => Promise<{ valueKg: number } | null>;
  getActiveEnergyToday: () => Promise<number>;
  getWeightSamples: (startDateISO: string) => Promise<{ dateISO: string; valueKg: number }[]>;
};

let initialized = false;

export async function initHealthKit(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  if (initialized) return true;
  try {
    const ok = await ExpoHealthKit.requestAuthorization(
      ["bodyMass", "activeEnergyBurned", "stepCount"],
      ["bodyMass"],
    );
    initialized = ok;
    return ok;
  } catch (err) {
    console.error("[HealthKit] init error:", err);
    return false;
  }
}

export async function writeWeight(weightKg: number): Promise<void> {
  if (Platform.OS !== "ios") return;
  await ExpoHealthKit.saveWeight(weightKg);
}

export async function readLatestWeight(): Promise<number | null> {
  if (Platform.OS !== "ios") return null;
  const sample = await ExpoHealthKit.getLatestWeight();
  return sample?.valueKg ?? null;
}

/** bodyMass history for the trailing window, shaped for the phase
 *  suggestion engine ({ date, kg }), ascending by date. */
export async function readWeightHistory(
  days = 60,
): Promise<{ date: string; kg: number }[]> {
  if (Platform.OS !== "ios") return [];
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const samples = await ExpoHealthKit.getWeightSamples(start);
  return samples.map((s) => ({ date: s.dateISO, kg: s.valueKg }));
}

export async function readActiveEnergy(): Promise<number | null> {
  if (Platform.OS !== "ios") return null;
  const kcal = await ExpoHealthKit.getActiveEnergyToday();
  return Math.round(kcal) || null;
}

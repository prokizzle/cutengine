import { Platform } from "react-native";
import ExpoHealthKit from "../modules/expo-healthkit/src";

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

export async function readActiveEnergy(): Promise<number | null> {
  if (Platform.OS !== "ios") return null;
  const kcal = await ExpoHealthKit.getActiveEnergyToday();
  return Math.round(kcal) || null;
}

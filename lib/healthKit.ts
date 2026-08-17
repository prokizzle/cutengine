import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";

export type BodyFatSample = {
  date: string;
  fraction: number;
};

// Local Expo Module — resolved at build time, not by tsc
const ExpoHealthKit = require("../modules/expo-healthkit/src").default as {
  requestAuthorization: (read: string[], write: string[]) => Promise<boolean>;
  saveWeight: (kg: number, date?: Date) => Promise<void>;
  getLatestWeight: () => Promise<{ valueKg: number } | null>;
  getActiveEnergyToday: () => Promise<number>;
  getWeightSamples: (
    startDateISO: string,
  ) => Promise<{ dateISO: string; valueKg: number }[]>;
  getLatestBodyFat: () => Promise<{
    dateISO: string;
    valueFraction: number;
  } | null>;
  getBodyFatSamples: (
    startDateISO: string,
    endDateISO: string,
  ) => Promise<{ dateISO: string; valueFraction: number }[]>;
};

let initialized = false;

export async function initHealthKit(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  if (initialized) return true;
  try {
    const ok = await ExpoHealthKit.requestAuthorization(
      ["bodyMass", "bodyFatPercentage", "activeEnergyBurned", "stepCount"],
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

export async function readLatestBodyFat(): Promise<BodyFatSample | null> {
  if (Platform.OS !== "ios") return null;
  try {
    const sample = await ExpoHealthKit.getLatestBodyFat();
    return sample
      ? { date: sample.dateISO, fraction: sample.valueFraction }
      : null;
  } catch (err) {
    console.error("[HealthKit] getLatestBodyFat error:", err);
    Sentry.captureException(err);
    return null;
  }
}

export async function readBodyFatHistory(
  days = 60,
  now: Date = new Date(),
): Promise<BodyFatSample[]> {
  if (Platform.OS !== "ios") return [];
  try {
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const samples = await ExpoHealthKit.getBodyFatSamples(
      start.toISOString(),
      now.toISOString(),
    );
    return samples.map((sample) => ({
      date: sample.dateISO,
      fraction: sample.valueFraction,
    }));
  } catch (err) {
    console.error("[HealthKit] getBodyFatSamples error:", err);
    Sentry.captureException(err);
    return [];
  }
}

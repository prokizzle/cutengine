import { Platform } from "react-native";
import AppleHealthKit, {
  type HealthInputOptions,
  type HealthUnit,
  type HealthValue,
} from "react-native-health";

const { Permissions, Units } = AppleHealthKit.Constants;

const READ_PERMISSIONS = [
  Permissions.ActiveEnergyBurned,
  Permissions.StepCount,
];

const WRITE_PERMISSIONS = [Permissions.Weight];

let initialized = false;

export async function initHealthKit(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  if (initialized) return true;

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(
      {
        permissions: {
          read: READ_PERMISSIONS,
          write: WRITE_PERMISSIONS,
        },
      },
      (err: string) => {
        if (err) {
          console.error("[HealthKit] init error:", err);
          resolve(false);
        } else {
          initialized = true;
          resolve(true);
        }
      },
    );
  });
}

export async function writeWeight(weightKg: number): Promise<void> {
  if (Platform.OS !== "ios") return;
  const weightLb = weightKg * 2.20462;
  return new Promise((resolve, reject) => {
    AppleHealthKit.saveWeight(
      { value: weightLb, unit: Units.pound as HealthUnit },
      (err: string) => {
        if (err) {
          console.error("[HealthKit] write weight error:", err);
          reject(new Error(err));
        } else {
          resolve();
        }
      },
    );
  });
}

export async function readLatestWeight(): Promise<number | null> {
  if (Platform.OS !== "ios") return null;
  return new Promise((resolve) => {
    AppleHealthKit.getWeightSamples(
      {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      } as HealthInputOptions,
      (_err: string, results: HealthValue[]) => {
        if (results.length > 0) {
          const latest = results[results.length - 1];
          if (typeof latest?.value === "number") {
            resolve(latest.value / 2.20462);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      },
    );
  });
}

export async function readActiveEnergy(): Promise<number | null> {
  if (Platform.OS !== "ios") return null;
  return new Promise((resolve) => {
    AppleHealthKit.getActiveEnergyBurned(
      {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date().toISOString(),
      } as HealthInputOptions,
      (_err: string, results: HealthValue[]) => {
        if (results.length > 0) {
          const total = results.reduce(
            (sum, r) => sum + (typeof r.value === "number" ? r.value : 0),
            0,
          );
          resolve(Math.round(total));
        } else {
          resolve(null);
        }
      },
    );
  });
}

import { requireOptionalNativeModule } from "expo-modules-core";

// Readable/writable HKQuantityType identifiers supported by the native side.
export type HealthKitTypeIdentifier =
  | "bodyMass"
  | "activeEnergyBurned"
  | "stepCount"
  | "bodyFatPercentage";

export interface WeightSample {
  dateISO: string;
  valueKg: number;
}

// Optional resolution: the module is iOS-only, and eager requireNativeModule
// would throw at import time on Android/web before lib-level Platform guards run.
const NativeModule = requireOptionalNativeModule("ExpoHealthKit") as any;

export default {
  /** Resolves false (without throwing) when Health data is unavailable. */
  requestAuthorization: (read: string[], write: string[]): Promise<boolean> =>
    NativeModule.requestAuthorization(read, write),

  saveWeight: (kg: number, date?: Date): Promise<void> =>
    NativeModule.saveWeight(kg, date ?? null),

  getLatestWeight: (): Promise<{ valueKg: number } | null> => NativeModule.getLatestWeight(),

  getActiveEnergyToday: (): Promise<number> => NativeModule.getActiveEnergyToday(),

  /** bodyMass samples since `startDateISO`, ascending by date. */
  getWeightSamples: (startDateISO: string): Promise<WeightSample[]> =>
    NativeModule.getWeightSamples(startDateISO),
};

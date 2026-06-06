import { requireNativeModule } from "expo-modules-core";

export interface WeightSample {
  valueKg: number;
  valueLb: number;
  date: number; // ms since epoch
}

const NativeModule = requireNativeModule("ExpoHealthKit");

export default {
  requestAuthorization: (
    readTypes: string[],
    writeTypes: string[],
  ): Promise<boolean> =>
    NativeModule.requestAuthorization(readTypes, writeTypes),

  saveWeight: (valueKg: number, date?: Date): Promise<void> =>
    NativeModule.saveWeight(valueKg, date ?? new Date()),

  getLatestWeight: (): Promise<WeightSample | null> =>
    NativeModule.getLatestWeight(),

  getActiveEnergyToday: (): Promise<number> =>
    NativeModule.getActiveEnergyToday(),

  getStepCountToday: (): Promise<number> =>
    NativeModule.getStepCountToday(),
};

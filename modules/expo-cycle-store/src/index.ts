import { requireNativeModule } from "expo-modules-core";

// Types mirror the Swift structs — Expo Modules generates TS types from these
// when typedRoutes + typed modules are enabled, but explicit types ensure
// IDE support before codegen runs.

export interface Compound {
  id: string;
  name: string;
  halfLifeHours?: number;
  defaultUnit: string;
  defaultRoute: "oral" | "injectable" | "topical" | "sublingual" | "nasal" | "other";
  isUserCreated: boolean;
  preSeeded: boolean;
}

export interface DoseRule {
  id: string;
  compoundID: string;
  scheduleID: string;
  amount: number;
  unit: string;
  cadence:
    | { type: "daily" }
    | { type: "everyNDays"; n: number }
    | { type: "specificDays"; days: number[] }
    | { type: "cyclical"; daysOn: number; daysOff: number }
    | { type: "everyNHours"; n: number }
    | { type: "asNeeded" };
  timeOfDay?: string;
  startWeek?: number;
  endWeek?: number;
  sortOrder: number;
  notes?: string;
}

export interface Schedule {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  rules: DoseRule[];
  status: "draft" | "active" | "completed" | "archived";
}

export interface MealRule {
  id: string;
  scheduleID: string;
  label: string;
  time: string;
  items: MealItem[];
  sortOrder: number;
}

export interface MealItem {
  id: string;
  name: string;
  quantity: string;
  sortOrder: number;
}

export interface TodayEvent {
  id: string;
  name: string;
  dose?: number;
  unit?: string;
  timeOfDay?: string;
  isMeal: boolean;
  sortOrder: number;
  taken: boolean;
  scheduleName?: string;
  weekLabel?: string;
}

// Native module — typed at call sites with explicit overloads
const NativeModule = requireNativeModule("ExpoCycleStore");

export default {
  initialize: (): Promise<void> => NativeModule.initialize(),

  // Compounds
  getAllCompounds: (): Promise<Compound[]> => NativeModule.getAllCompounds(),
  saveCompound: (compound: Compound): Promise<void> => NativeModule.saveCompound(compound),
  deleteCompound: (id: string): Promise<void> => NativeModule.deleteCompound(id),

  // Schedules
  getAllSchedules: (): Promise<Schedule[]> => NativeModule.getAllSchedules(),
  saveSchedule: (schedule: Schedule): Promise<void> => NativeModule.saveSchedule(schedule),

  // Dose Rules
  getDoseRules: (scheduleID: string): Promise<DoseRule[]> => NativeModule.getDoseRules(scheduleID),
  saveDoseRules: (rules: DoseRule[], scheduleID: string): Promise<void> =>
    NativeModule.saveDoseRules(rules, scheduleID),

  // Meal Rules
  getMealRules: (scheduleID: string): Promise<MealRule[]> => NativeModule.getMealRules(scheduleID),
  saveMealRule: (rule: MealRule): Promise<void> => NativeModule.saveMealRule(rule),
};

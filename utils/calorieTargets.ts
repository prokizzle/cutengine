import type { MacroRatio, Phase, UserProfile } from "../modules/expo-cycle-store/src/userProfile";
import { lbsToKg } from "./weight";

// CUTIOS-18 — surplus/deficit calorie engine, routed by phase.
// One signed weekly weight-delta target (kg) covers all phases; ~7700 kcal
// per kg of body mass change (≈ 3500 kcal/lb, the v1 "×500/day per lb/wk" rule).

export const KCAL_PER_KG = 7700;

export interface WeeklyDeltaTier {
  id: string;
  label: string;
  /** Signed kg/week (positive = gain). */
  weeklyDeltaKg: number;
  /** Display value, lb/week. */
  weeklyDeltaLbs: number;
}

function tier(id: string, label: string, lbs: number): WeeklyDeltaTier {
  return { id, label, weeklyDeltaKg: lbsToKg(lbs), weeklyDeltaLbs: lbs };
}

/** Bulk surplus tiers (lb/week gain). */
export const SURPLUS_TIERS: WeeklyDeltaTier[] = [
  tier("lean", "Lean bulk", 0.25),
  tier("moderate", "Moderate", 0.5),
  tier("aggressive", "Aggressive", 0.75),
  tier("dreamer", "Dreamer bulk", 1.0),
];

/** Cut deficit tiers (lb/week loss). */
export const CUT_TIERS: WeeklyDeltaTier[] = [
  tier("slow", "Slow cut", -0.5),
  tier("standard", "Standard", -1.0),
  tier("aggressive", "Aggressive", -1.5),
  tier("extreme", "Extreme", -2.0),
];

/** Max sustainable weekly gain before surplus mostly turns to fat. Enhanced
 *  users (power builds) can productively run a larger surplus. */
export const MAX_WEEKLY_GAIN_KG_NATURAL = lbsToKg(0.5);
export const MAX_WEEKLY_GAIN_KG_ENHANCED = lbsToKg(1.0);

export function clampWeeklyDeltaKg(
  weeklyDeltaKg: number,
  phase: Phase,
  opts: { enhanced?: boolean } = {},
): number {
  if (phase !== "bulk") return weeklyDeltaKg;
  const cap = opts.enhanced ? MAX_WEEKLY_GAIN_KG_ENHANCED : MAX_WEEKLY_GAIN_KG_NATURAL;
  return Math.min(weeklyDeltaKg, cap);
}

/**
 * Daily calorie target for the active phase:
 * cut/bulk → TDEE + weeklyDeltaKg × 7700 / 7; maintenance → TDEE exactly.
 */
export function dailyTargetKcal(
  tdeeKcal: number,
  profile: Pick<UserProfile, "currentPhase" | "targetWeightDeltaPerWeekKg">,
): number {
  if (profile.currentPhase === "maintenance") return Math.round(tdeeKcal);
  return Math.round(tdeeKcal + (profile.targetWeightDeltaPerWeekKg * KCAL_PER_KG) / 7);
}

export interface MacroGrams {
  protein: number;
  carbs: number;
  fat: number;
}

/** Convert a macro split into gram targets (protein/carbs 4 kcal/g, fat 9). */
export function macroGramsFor(targetKcal: number, ratio: MacroRatio): MacroGrams {
  return {
    protein: Math.round((targetKcal * ratio.protein) / 4),
    carbs: Math.round((targetKcal * ratio.carb) / 4),
    fat: Math.round((targetKcal * ratio.fat) / 9),
  };
}

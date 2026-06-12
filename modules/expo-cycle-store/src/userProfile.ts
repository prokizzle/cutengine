// UserProfile types + pure helpers (no native imports — safe to unit test).
// Data shape mirrors ios/Sources/Types/UserProfile.swift verbatim (CUTIOS-16).

export type Phase = "cut" | "bulk" | "maintenance";

export interface MacroRatio {
  protein: number; // 0..1
  carb: number; // 0..1
  fat: number; // 0..1
}

export interface UserProfile {
  id: string; // fixed singleton ID "user-profile-singleton"
  currentPhase: Phase;
  phaseStartDate: string; // ISO 8601
  macroOverrides: Partial<Record<Phase, MacroRatio>>; // present = override, absent = use default
  targetWeightDeltaPerWeekKg: number; // signed; negative = cut, positive = bulk, ~0 = maintenance
}

export const USER_PROFILE_SINGLETON_ID = "user-profile-singleton";

/** Built-in per-phase macro defaults (not stored). */
export const DEFAULT_MACROS: Record<Phase, MacroRatio> = {
  cut: { protein: 0.4, carb: 0.3, fat: 0.3 },
  bulk: { protein: 0.3, carb: 0.45, fat: 0.25 },
  maintenance: { protein: 0.3, carb: 0.4, fat: 0.3 },
};

/** Signed kg/week defaults applied when entering a phase. -0.5 ≈ 1 lb/week cut. */
export const DEFAULT_WEEKLY_DELTA_KG: Record<Phase, number> = {
  cut: -0.5,
  bulk: 0.25,
  maintenance: 0,
};

/** Override if present in `macroOverrides[phase]`, else the built-in default. */
export function macroRatioFor(profile: UserProfile, phase: Phase): MacroRatio {
  return profile.macroOverrides[phase] ?? DEFAULT_MACROS[phase];
}

/**
 * Switch phase: resets `phaseStartDate` to `now` and the weekly delta to the
 * phase default unless an explicit `weeklyDeltaKg` is given. Returns a copy.
 */
export function updatePhase(
  profile: UserProfile,
  phase: Phase,
  opts: { now?: Date; weeklyDeltaKg?: number } = {},
): UserProfile {
  const now = opts.now ?? new Date();
  return {
    ...profile,
    currentPhase: phase,
    phaseStartDate: now.toISOString(),
    targetWeightDeltaPerWeekKg: opts.weeklyDeltaKg ?? DEFAULT_WEEKLY_DELTA_KG[phase],
  };
}

/** Set (or clear, with `null`) the macro override for a phase. Returns a copy. */
export function setMacroOverride(
  profile: UserProfile,
  phase: Phase,
  ratio: MacroRatio | null,
): UserProfile {
  const macroOverrides = { ...profile.macroOverrides };
  if (ratio == null) {
    delete macroOverrides[phase];
  } else {
    macroOverrides[phase] = ratio;
  }
  return { ...profile, macroOverrides };
}

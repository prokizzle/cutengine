import {
  DEFAULT_MACROS,
  DEFAULT_WEEKLY_DELTA_KG,
  USER_PROFILE_SINGLETON_ID,
  macroRatioFor,
  setMacroOverride,
  updatePhase,
  type UserProfile,
} from "./userProfile";

const base: UserProfile = {
  id: USER_PROFILE_SINGLETON_ID,
  currentPhase: "cut",
  phaseStartDate: "2026-06-01T00:00:00.000Z",
  macroOverrides: {},
  targetWeightDeltaPerWeekKg: -0.5,
};

describe("macroRatioFor", () => {
  it("returns built-in defaults when no override is present", () => {
    expect(macroRatioFor(base, "cut")).toEqual({ protein: 0.4, carb: 0.3, fat: 0.3 });
    expect(macroRatioFor(base, "bulk")).toEqual({ protein: 0.3, carb: 0.45, fat: 0.25 });
    expect(macroRatioFor(base, "maintenance")).toEqual({ protein: 0.3, carb: 0.4, fat: 0.3 });
  });

  it("returns the override when present, defaults for other phases", () => {
    const override = { protein: 0.45, carb: 0.35, fat: 0.2 };
    const profile = { ...base, macroOverrides: { cut: override } };
    expect(macroRatioFor(profile, "cut")).toEqual(override);
    expect(macroRatioFor(profile, "bulk")).toEqual(DEFAULT_MACROS.bulk);
  });
});

describe("updatePhase", () => {
  it("sets phase, resets start date, and applies the phase-default delta", () => {
    const now = new Date("2026-06-12T08:00:00.000Z");
    const next = updatePhase(base, "bulk", { now });
    expect(next.currentPhase).toBe("bulk");
    expect(next.phaseStartDate).toBe(now.toISOString());
    expect(next.targetWeightDeltaPerWeekKg).toBe(DEFAULT_WEEKLY_DELTA_KG.bulk);
  });

  it("respects an explicit weekly delta", () => {
    const next = updatePhase(base, "bulk", { weeklyDeltaKg: 0.45 });
    expect(next.targetWeightDeltaPerWeekKg).toBe(0.45);
  });

  it("does not mutate the original profile", () => {
    updatePhase(base, "maintenance");
    expect(base.currentPhase).toBe("cut");
  });
});

describe("setMacroOverride", () => {
  it("sets an override for a phase", () => {
    const ratio = { protein: 0.35, carb: 0.4, fat: 0.25 };
    const next = setMacroOverride(base, "bulk", ratio);
    expect(next.macroOverrides.bulk).toEqual(ratio);
    expect(base.macroOverrides.bulk).toBeUndefined();
  });

  it("clears an override with null", () => {
    const withOverride = setMacroOverride(base, "cut", { protein: 0.5, carb: 0.25, fat: 0.25 });
    const cleared = setMacroOverride(withOverride, "cut", null);
    expect(cleared.macroOverrides.cut).toBeUndefined();
  });
});

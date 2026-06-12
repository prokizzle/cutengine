import {
  CUT_TIERS,
  MAX_WEEKLY_GAIN_KG_ENHANCED,
  MAX_WEEKLY_GAIN_KG_NATURAL,
  SURPLUS_TIERS,
  clampWeeklyDeltaKg,
  dailyTargetKcal,
  macroGramsFor,
} from "./calorieTargets";
import { lbsToKg } from "./weight";

describe("dailyTargetKcal", () => {
  it("returns TDEE plus surplus during bulk", () => {
    const target = dailyTargetKcal(2400, {
      currentPhase: "bulk",
      targetWeightDeltaPerWeekKg: lbsToKg(0.5),
    });
    // 0.5 lb/wk ≈ 250 kcal/day surplus
    expect(target).toBeGreaterThan(2640);
    expect(target).toBeLessThan(2660);
  });

  it("returns TDEE minus deficit during cut", () => {
    const target = dailyTargetKcal(2400, {
      currentPhase: "cut",
      targetWeightDeltaPerWeekKg: -0.5,
    });
    // -0.5 kg/wk = -550 kcal/day
    expect(target).toBe(1850);
  });

  it("returns TDEE exactly during maintenance, ignoring any stale delta", () => {
    const target = dailyTargetKcal(2400, {
      currentPhase: "maintenance",
      targetWeightDeltaPerWeekKg: -0.5,
    });
    expect(target).toBe(2400);
  });
});

describe("surplus tiers", () => {
  it("covers lean through dreamer bulk in lb/week", () => {
    expect(SURPLUS_TIERS.map((t) => t.weeklyDeltaLbs)).toEqual([0.25, 0.5, 0.75, 1.0]);
  });

  it("cut tiers are all negative", () => {
    expect(CUT_TIERS.every((t) => t.weeklyDeltaKg < 0)).toBe(true);
  });
});

describe("clampWeeklyDeltaKg", () => {
  it("caps natural bulk gain at 0.5 lb/week", () => {
    expect(clampWeeklyDeltaKg(lbsToKg(1.0), "bulk")).toBeCloseTo(MAX_WEEKLY_GAIN_KG_NATURAL);
  });

  it("allows enhanced users a larger surplus", () => {
    expect(clampWeeklyDeltaKg(lbsToKg(1.0), "bulk", { enhanced: true })).toBeCloseTo(
      MAX_WEEKLY_GAIN_KG_ENHANCED,
    );
  });

  it("does not clamp cut or maintenance deltas", () => {
    expect(clampWeeklyDeltaKg(-1.0, "cut")).toBe(-1.0);
    expect(clampWeeklyDeltaKg(1.0, "maintenance")).toBe(1.0);
  });
});

describe("macroGramsFor", () => {
  it("converts a split into gram targets at 4/4/9 kcal per gram", () => {
    const grams = macroGramsFor(2000, { protein: 0.4, carb: 0.3, fat: 0.3 });
    expect(grams).toEqual({ protein: 200, carbs: 150, fat: 67 });
  });
});

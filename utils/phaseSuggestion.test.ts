import { suggestPhaseChange, weightTrendKgPerWeek, type WeightSample } from "./phaseSuggestion";

const NOW = new Date("2026-06-12T12:00:00.000Z");

/** Daily samples for the past `days` days, weight moving linearly by
 *  `totalDeltaKg` from start to end. */
function samples(days: number, startKg: number, totalDeltaKg: number): WeightSample[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(NOW.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return { date: date.toISOString(), kg: startKg + (totalDeltaKg * i) / (days - 1) };
  });
}

describe("weightTrendKgPerWeek", () => {
  it("returns null with too little data", () => {
    expect(weightTrendKgPerWeek(samples(5, 85, 0), NOW)).toBeNull();
    expect(weightTrendKgPerWeek([], NOW)).toBeNull();
  });

  it("detects an upward trend from 4 weeks of daily data", () => {
    // +2 kg over 28 days ≈ +0.5 kg/week
    const trend = weightTrendKgPerWeek(samples(28, 85, 2), NOW);
    expect(trend).not.toBeNull();
    expect(trend!).toBeGreaterThan(0.3);
  });

  it("reads a flat series as ~zero", () => {
    const trend = weightTrendKgPerWeek(samples(28, 85, 0), NOW);
    expect(Math.abs(trend!)).toBeLessThan(0.01);
  });
});

describe("suggestPhaseChange", () => {
  it("suggests maintenance when gaining during a cut", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, 2),
      { currentPhase: "cut", targetWeightDeltaPerWeekKg: -0.5 },
      { now: NOW },
    );
    expect(suggestion?.kind).toBe("cut-gaining");
  });

  it("flags under-eating when losing during a bulk", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, -2),
      { currentPhase: "bulk", targetWeightDeltaPerWeekKg: 0.25 },
      { now: NOW },
    );
    expect(suggestion?.kind).toBe("bulk-losing");
  });

  it("detects a plateau during a cut", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, 0),
      { currentPhase: "cut", targetWeightDeltaPerWeekKg: -0.5 },
      { now: NOW },
    );
    expect(suggestion?.kind).toBe("plateau");
  });

  it("stays quiet for a bulk gaining on plan with stable body fat", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, 1),
      { currentPhase: "bulk", targetWeightDeltaPerWeekKg: 0.25 },
      { now: NOW },
    );
    expect(suggestion).toBeNull();
  });

  it("cautions when bulking with body fat rising", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, 1),
      { currentPhase: "bulk", targetWeightDeltaPerWeekKg: 0.25 },
      { now: NOW, bodyFatRising: true },
    );
    expect(suggestion?.kind).toBe("bulk-bf-rising");
  });

  it("never suggests during maintenance", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, 0),
      { currentPhase: "maintenance", targetWeightDeltaPerWeekKg: 0 },
      { now: NOW },
    );
    expect(suggestion).toBeNull();
  });

  it("a cut losing on target produces no suggestion", () => {
    const suggestion = suggestPhaseChange(
      samples(28, 85, -2),
      { currentPhase: "cut", targetWeightDeltaPerWeekKg: -0.5 },
      { now: NOW },
    );
    expect(suggestion).toBeNull();
  });
});

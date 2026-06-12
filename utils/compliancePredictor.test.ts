import { buildDayRecords } from "./complianceDataset";
import {
  evaluateModel,
  HIGH_RISK_THRESHOLD,
  MIN_HEURISTIC_DAYS,
  MIN_TRAINING_DAYS,
  MODERATE_RISK_THRESHOLD,
  predictTodayMissRisk,
  riskLevelFor,
} from "./compliancePredictor";
import { generateHistory } from "./syntheticCompliance";

// Weekend-skipper: reliable on weekdays, usually misses Sat/Sun.
const WEEKEND_MISS = [0.85, 0.08, 0.08, 0.08, 0.08, 0.08, 0.85];
// Friday-skipper: same habit expressed in both phases.
const FRIDAY_MISS = [0.05, 0.05, 0.05, 0.05, 0.05, 0.8, 0.05];

describe("riskLevelFor", () => {
  it("maps thresholds to levels", () => {
    expect(riskLevelFor(MODERATE_RISK_THRESHOLD - 0.01)).toBe("low");
    expect(riskLevelFor(MODERATE_RISK_THRESHOLD)).toBe("moderate");
    expect(riskLevelFor(HIGH_RISK_THRESHOLD)).toBe("high");
  });
});

describe("predictTodayMissRisk", () => {
  it("returns null with under a week of history", () => {
    const { entries, profile, now } = generateHistory([
      { phase: "cut", days: MIN_HEURISTIC_DAYS - 2, missByDow: WEEKEND_MISS },
    ]);
    expect(predictTodayMissRisk(entries, profile, now)).toBeNull();
  });

  it("falls back to the day-of-week heuristic under 30 days", () => {
    const { entries, profile, now } = generateHistory([
      { phase: "cut", days: 14, missByDow: WEEKEND_MISS },
    ]);
    const prediction = predictTodayMissRisk(entries, profile, now);
    expect(prediction?.source).toBe("heuristic");
    expect(prediction!.probability).toBeGreaterThan(0);
    expect(prediction!.probability).toBeLessThan(1);
  });

  it("uses the trained model from 30 days of history", () => {
    const { entries, profile, now } = generateHistory([
      { phase: "cut", days: MIN_TRAINING_DAYS + 30, missByDow: WEEKEND_MISS },
    ]);
    expect(predictTodayMissRisk(entries, profile, now)?.source).toBe("model");
  });

  it("rates a habitual miss day far riskier than a reliable day", () => {
    const spec = [{ phase: "cut" as const, days: 90, missByDow: WEEKEND_MISS }];
    const saturday = generateHistory(spec, { now: new Date(2026, 5, 13, 9) }); // Sat
    const tuesday = generateHistory(spec, { now: new Date(2026, 5, 9, 9) }); // Tue
    const satRisk = predictTodayMissRisk(saturday.entries, saturday.profile, saturday.now)!;
    const tueRisk = predictTodayMissRisk(tuesday.entries, tuesday.profile, tuesday.now)!;
    expect(satRisk.level).toBe("high");
    expect(satRisk.probability).toBeGreaterThan(tueRisk.probability + 0.2);
    expect(tueRisk.level).not.toBe("high");
  });

  it("predicts without a gap on the first day after a phase switch", () => {
    // 60 days of bulk history; the cut started today — zero cut check-ins yet.
    const { entries, now } = generateHistory([
      { phase: "bulk", days: 60, missByDow: FRIDAY_MISS },
    ]);
    const profile = { currentPhase: "cut" as const, phaseStartDate: now.toISOString() };
    const prediction = predictTodayMissRisk(entries, profile, now);
    expect(prediction).not.toBeNull();
    expect(prediction?.source).toBe("model");
  });
});

describe("evaluateModel", () => {
  it("returns null when a split would be too small", () => {
    const { entries, profile, now } = generateHistory([
      { phase: "cut", days: 12, missByDow: WEEKEND_MISS },
    ]);
    expect(evaluateModel(buildDayRecords(entries, profile, now))).toBeNull();
  });

  it("beats 70% accuracy on a held-out chronological split (CUTIOS-12)", () => {
    const { entries, profile, now } = generateHistory(
      [{ phase: "cut", days: 90, missByDow: WEEKEND_MISS }],
      { seed: 7 },
    );
    const evaluation = evaluateModel(buildDayRecords(entries, profile, now))!;
    expect(evaluation.accuracy).toBeGreaterThan(0.7);
    expect(evaluation.recall).not.toBeNull();
    expect(evaluation.recall!).toBeGreaterThan(0.5);
  });

  it("cross-phase training matches or beats single-phase on a phase cycler (CUTIOS-20)", () => {
    // The habit (skip Fridays) persists across bulk → cut. Cross-phase
    // training sees 120 days; single-phase sees only the 35 cut days.
    const { entries, profile, now } = generateHistory(
      [
        { phase: "bulk", days: 85, missByDow: FRIDAY_MISS },
        { phase: "cut", days: 35, missByDow: FRIDAY_MISS },
      ],
      { seed: 11 },
    );
    const records = buildDayRecords(entries, profile, now);
    const crossPhase = evaluateModel(records)!;
    const singlePhase = evaluateModel(records, { phaseFilter: "cut" })!;
    expect(crossPhase.accuracy).toBeGreaterThanOrEqual(singlePhase.accuracy);
    expect(crossPhase.accuracy).toBeGreaterThan(0.7);
  });
});

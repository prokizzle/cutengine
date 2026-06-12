import {
  buildDayRecords,
  buildTrainingSet,
  featuresFor,
  FEATURE_COUNT,
  FEATURE_NAMES,
  localDayKey,
  MIN_FEATURE_HISTORY_DAYS,
  type ComplianceDayRecord,
} from "./complianceDataset";
import type { BiofeedbackEntry } from "../modules/expo-cycle-store/src/biofeedback";
import type { Phase } from "../modules/expo-cycle-store/src/userProfile";

const NOW = new Date(2026, 5, 10, 9, 0, 0); // Wed Jun 10 2026, local

function entryOn(daysAgo: number, phase: Phase = "cut", scores: number[] = [3, 4]): BiofeedbackEntry {
  const date = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - daysAgo, 8, 0, 0);
  return {
    id: `e-${daysAgo}`,
    date: date.toISOString(),
    phase,
    answers: scores.map((score, i) => ({ questionID: `q-${i}`, prompt: `Q${i}`, score })),
  };
}

const cutProfile = { currentPhase: "cut" as Phase, phaseStartDate: entryOn(60).date };

function record(overrides: Partial<ComplianceDayRecord>): ComplianceDayRecord {
  return {
    day: "2026-06-01",
    dayOfWeek: 1,
    phase: "cut",
    checkedIn: true,
    meanScore: 3,
    ...overrides,
  };
}

describe("buildDayRecords", () => {
  it("returns empty for no entries", () => {
    expect(buildDayRecords([], cutProfile, NOW)).toEqual([]);
  });

  it("fills missed days between entries and excludes today", () => {
    const records = buildDayRecords([entryOn(3), entryOn(1)], cutProfile, NOW);
    expect(records.map((r) => r.checkedIn)).toEqual([true, false, true]);
    expect(records[records.length - 1].day).toBe(
      localDayKey(new Date(2026, 5, 9)),
    );
  });

  it("computes mean score and leaves missed days null", () => {
    const records = buildDayRecords([entryOn(2, "cut", [2, 4])], cutProfile, NOW);
    expect(records[0].meanScore).toBe(3);
  });

  it("carries phase forward across missed days", () => {
    const entries = [entryOn(5, "bulk"), entryOn(1, "cut")];
    const profile = { currentPhase: "cut" as Phase, phaseStartDate: entryOn(1).date };
    const phases = buildDayRecords(entries, profile, NOW).map((r) => r.phase);
    // days ago: 5(bulk entry) 4 3 2 (carried bulk) 1(cut entry)
    expect(phases).toEqual(["bulk", "bulk", "bulk", "bulk", "cut"]);
  });

  it("uses the profile phase for missed days after phaseStartDate (transition gap)", () => {
    // Last entry 4 days ago during bulk; user switched to cut 2 days ago and
    // hasn't checked in since.
    const entries = [entryOn(6, "bulk"), entryOn(4, "bulk")];
    const profile = { currentPhase: "cut" as Phase, phaseStartDate: entryOn(2).date };
    const phases = buildDayRecords(entries, profile, NOW).map((r) => r.phase);
    expect(phases).toEqual(["bulk", "bulk", "bulk", "bulk", "cut", "cut"]);
  });

  it("keeps the latest entry when a day has multiple", () => {
    const early = entryOn(1, "cut", [1, 1]);
    const late = { ...entryOn(1, "cut", [5, 5]), id: "later", date: new Date(2026, 5, 9, 21, 0, 0).toISOString() };
    const records = buildDayRecords([early, late], cutProfile, NOW);
    expect(records).toHaveLength(1);
    expect(records[0].meanScore).toBe(5);
  });
});

describe("featuresFor", () => {
  const history: ComplianceDayRecord[] = [
    record({ day: "2026-06-05", dayOfWeek: 5, checkedIn: true, meanScore: 4 }),
    record({ day: "2026-06-06", dayOfWeek: 6, checkedIn: false, meanScore: null }),
    record({ day: "2026-06-07", dayOfWeek: 0, checkedIn: true, meanScore: 2 }),
    record({ day: "2026-06-08", dayOfWeek: 1, checkedIn: true, meanScore: 3 }),
  ];

  it("has the documented dimensionality", () => {
    const x = featuresFor(history, { dayOfWeek: 2, phase: "cut" });
    expect(x).toHaveLength(FEATURE_COUNT);
    expect(FEATURE_NAMES).toHaveLength(FEATURE_COUNT);
  });

  it("one-hot encodes day of week and phase", () => {
    const x = featuresFor(history, { dayOfWeek: 2, phase: "bulk" });
    expect(x.slice(0, 7)).toEqual([0, 0, 1, 0, 0, 0, 0]);
    expect(x.slice(12, 15)).toEqual([0, 1, 0]);
  });

  it("computes streak and days-since-last-check-in", () => {
    const x = featuresFor(history, { dayOfWeek: 2, phase: "cut" });
    expect(x[7]).toBeCloseTo(1 / 14); // checked in yesterday
    expect(x[8]).toBeCloseTo(2 / 14); // 2-day streak
  });

  it("computes rolling check-in rate", () => {
    const x = featuresFor(history, { dayOfWeek: 2, phase: "cut" });
    expect(x[9]).toBeCloseTo(3 / 4); // only 4 days of history
  });

  it("normalizes mean recent score from last 3 scored days", () => {
    const x = featuresFor(history, { dayOfWeek: 2, phase: "cut" });
    // last 3 scored days: 3, 2, 4 → mean 3 → (3 - 1) / 4
    expect(x[11]).toBeCloseTo(0.5);
  });

  it("counts trailing days in the target phase", () => {
    const mixed = [
      record({ phase: "bulk" }),
      record({ phase: "cut" }),
      record({ phase: "cut" }),
    ];
    const x = featuresFor(mixed, { dayOfWeek: 2, phase: "cut" });
    expect(x[15]).toBeCloseTo(2 / 56);
    const switched = featuresFor(mixed, { dayOfWeek: 2, phase: "maintenance" });
    expect(switched[15]).toBe(0); // phase switched today
  });

  it("defaults gracefully with empty history", () => {
    const x = featuresFor([], { dayOfWeek: 3, phase: "cut" });
    expect(x[7]).toBe(1); // days since last check-in at cap
    expect(x[9]).toBe(0.5);
    expect(x[11]).toBe(0.5);
  });
});

describe("buildTrainingSet", () => {
  const days = Array.from({ length: 20 }, (_, i) =>
    record({
      day: `2026-05-${String(i + 1).padStart(2, "0")}`,
      dayOfWeek: i % 7,
      phase: i < 10 ? "bulk" : "cut",
      checkedIn: i % 3 !== 0,
      meanScore: i % 3 !== 0 ? 3 : null,
    }),
  );

  it("labels misses as 1 and skips the warm-up window", () => {
    const { xs, ys } = buildTrainingSet(days);
    expect(xs).toHaveLength(20 - MIN_FEATURE_HISTORY_DAYS);
    expect(ys[2]).toBe(1); // index 9 overall: 9 % 3 === 0 → missed
  });

  it("filters target days by phase when requested", () => {
    const { xs, ys } = buildTrainingSet(days, { phaseFilter: "cut" });
    expect(xs).toHaveLength(10);
    expect(ys).toHaveLength(10);
  });
});

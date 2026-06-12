import { PHASE_LABEL, phaseDurationLabel, phaseDurationWeeks, phaseWeekLabel } from "./phase";

const NOW = new Date("2026-06-12T12:00:00.000Z");

describe("phaseDurationWeeks", () => {
  it("counts full weeks since the phase start", () => {
    expect(phaseDurationWeeks("2026-03-20T00:00:00.000Z", NOW)).toBe(12);
  });

  it("returns 0 for a fresh phase or invalid date", () => {
    expect(phaseDurationWeeks(NOW.toISOString(), NOW)).toBe(0);
    expect(phaseDurationWeeks("not-a-date", NOW)).toBe(0);
  });
});

describe("phaseDurationLabel", () => {
  it("reads like 'Bulking for 12 weeks'", () => {
    expect(
      phaseDurationLabel({ currentPhase: "bulk", phaseStartDate: "2026-03-20T00:00:00.000Z" }, NOW),
    ).toBe("Bulking for 12 weeks");
  });

  it("uses singular 'week'", () => {
    expect(
      phaseDurationLabel({ currentPhase: "cut", phaseStartDate: "2026-06-04T00:00:00.000Z" }, NOW),
    ).toBe("Cutting for 1 week");
  });

  it("handles a phase started this week", () => {
    expect(
      phaseDurationLabel({ currentPhase: "maintenance", phaseStartDate: NOW.toISOString() }, NOW),
    ).toBe("Maintaining since this week");
  });
});

describe("phaseWeekLabel", () => {
  it("is 1-indexed like 'Bulk Week 8'", () => {
    expect(
      phaseWeekLabel({ currentPhase: "bulk", phaseStartDate: "2026-04-24T00:00:00.000Z" }, NOW),
    ).toBe("Bulk Week 8");
    expect(PHASE_LABEL.cut).toBe("Cut");
  });
});

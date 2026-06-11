import type { DoseEvent } from "../types/timeline";
import {
  groupByTimeOfDay,
  getBucketLabel,
  getUnknownBucketKeys,
  DISPLAY_ORDER,
} from "./timeline";

const makeEvent = (overrides: Partial<DoseEvent> = {}): DoseEvent => ({
  id: "1",
  name: "Test",
  timeOfDay: "morning",
  sortOrder: 0,
  taken: false,
  ...overrides,
});

describe("groupByTimeOfDay", () => {
  it("returns empty object for empty input", () => {
    expect(groupByTimeOfDay([])).toEqual({});
  });

  it("groups events by timeOfDay", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "morning" }),
      makeEvent({ id: "2", timeOfDay: "bedtime" }),
      makeEvent({ id: "3", timeOfDay: "morning" }),
    ];
    const result = groupByTimeOfDay(events);
    expect(result["morning"]).toHaveLength(2);
    expect(result["bedtime"]).toHaveLength(1);
  });

  it("sorts within each bucket by sortOrder", () => {
    const events = [
      makeEvent({ id: "b", sortOrder: 2, name: "B" }),
      makeEvent({ id: "a", sortOrder: 1, name: "A" }),
      makeEvent({ id: "c", sortOrder: 3, name: "C" }),
    ];
    const result = groupByTimeOfDay(events);
    expect(result["morning"]!.map((e) => e.name)).toEqual(["A", "B", "C"]);
  });

  it("falls back to 'anytime' when timeOfDay is missing", () => {
    const events = [makeEvent({ timeOfDay: undefined as unknown as string })];
    const result = groupByTimeOfDay(events);
    expect(result["anytime"]).toHaveLength(1);
  });
});

describe("getBucketLabel", () => {
  it("returns known labels", () => {
    expect(getBucketLabel("morning")).toBe("MORNING");
    expect(getBucketLabel("withMeals")).toBe("WITH MEALS");
  });

  it("uppercases unknown keys as fallback", () => {
    expect(getBucketLabel("custom")).toBe("CUSTOM");
  });
});

describe("getUnknownBucketKeys", () => {
  it("returns keys not in DISPLAY_ORDER", () => {
    const grouped = { morning: [], custom: [], bedtime: [] } as Record<
      string,
      DoseEvent[]
    >;
    const unknown = getUnknownBucketKeys(grouped);
    expect(unknown).toEqual(["custom"]);
    expect(unknown).not.toContain("morning");
    expect(unknown).not.toContain("bedtime");
  });

  it("returns empty array when all keys are known", () => {
    const grouped = Object.fromEntries(
      DISPLAY_ORDER.map((k) => [k, []]),
    ) as Record<string, DoseEvent[]>;
    expect(getUnknownBucketKeys(grouped)).toEqual([]);
  });
});

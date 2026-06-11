import type { DoseEvent } from "../types/timeline";
import {
  selectTimelineRenderOrder,
  selectDosedCount,
  selectGroupedEvents,
  selectUnknownBucketKeys,
  selectOrderedBuckets,
} from "./timeline";

const makeEvent = (overrides: Partial<DoseEvent> = {}): DoseEvent => ({
  id: "1",
  name: "Test",
  timeOfDay: "morning",
  sortOrder: 0,
  taken: false,
  ...overrides,
});

describe("selectGroupedEvents", () => {
  it("groups events by timeOfDay", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "morning" }),
      makeEvent({ id: "2", timeOfDay: "bedtime" }),
    ];
    const result = selectGroupedEvents(events);
    expect(result["morning"]).toHaveLength(1);
    expect(result["bedtime"]).toHaveLength(1);
  });

  it("is memoized — same reference returned for same input", () => {
    const events = [makeEvent()];
    const a = selectGroupedEvents(events);
    const b = selectGroupedEvents(events);
    expect(a).toBe(b);
  });
});

describe("selectUnknownBucketKeys", () => {
  it("returns keys not in DISPLAY_ORDER", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "morning" }),
      makeEvent({ id: "2", timeOfDay: "custom" as string }),
    ];
    expect(selectUnknownBucketKeys(events)).toEqual(["custom"]);
  });
});

describe("selectOrderedBuckets", () => {
  it("orders known buckets before unknown", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "bedtime" }),
      makeEvent({ id: "2", timeOfDay: "morning" }),
      makeEvent({ id: "3", timeOfDay: "zzz" as string }),
    ];
    const buckets = selectOrderedBuckets(events);
    expect(buckets.indexOf("morning")).toBeLessThan(buckets.indexOf("bedtime"));
    expect(buckets[buckets.length - 1]).toBe("zzz");
  });

  it("sorts unknown keys alphabetically", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "morning" }),
      makeEvent({ id: "2", timeOfDay: "zzz" as string }),
      makeEvent({ id: "3", timeOfDay: "aaa" as string }),
    ];
    const buckets = selectOrderedBuckets(events);
    const unknownPart = buckets.filter((b) => !["morning"].includes(b));
    expect(unknownPart).toEqual(["aaa", "zzz"]);
  });
});

describe("selectTimelineRenderOrder", () => {
  it("returns empty orderedBuckets for empty input", () => {
    const { orderedBuckets, grouped } = selectTimelineRenderOrder([]);
    expect(orderedBuckets).toEqual([]);
    expect(grouped).toEqual({});
  });

  it("omits empty known buckets", () => {
    const events = [makeEvent({ timeOfDay: "morning" })];
    const { orderedBuckets } = selectTimelineRenderOrder(events);
    expect(orderedBuckets).not.toContain("midday");
  });

  it("is memoized — same reference returned for same input", () => {
    const events = [makeEvent()];
    const a = selectTimelineRenderOrder(events);
    const b = selectTimelineRenderOrder(events);
    expect(a).toBe(b);
  });

  it("recomputes when input reference changes", () => {
    const events1 = [makeEvent({ id: "1" })];
    const events2 = [makeEvent({ id: "2" })];
    const a = selectTimelineRenderOrder(events1);
    const b = selectTimelineRenderOrder(events2);
    expect(a).not.toBe(b);
  });
});

describe("selectDosedCount", () => {
  it("returns 0 for empty events", () => {
    expect(selectDosedCount([])).toBe(0);
  });

  it("counts taken events", () => {
    const events = [
      makeEvent({ id: "1", taken: true }),
      makeEvent({ id: "2", taken: false }),
      makeEvent({ id: "3", taken: true }),
    ];
    expect(selectDosedCount(events)).toBe(2);
  });

  it("is memoized", () => {
    const events = [makeEvent({ taken: true })];
    selectDosedCount.resetRecomputations();
    selectDosedCount(events);
    selectDosedCount(events);
    expect(selectDosedCount.recomputations()).toBe(1);
  });
});

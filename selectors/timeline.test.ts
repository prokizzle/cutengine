import type { DoseEvent } from "../types/timeline";
import { selectTimelineRenderOrder, selectDosedCount } from "./timeline";

const makeEvent = (overrides: Partial<DoseEvent> = {}): DoseEvent => ({
  id: "1",
  name: "Test",
  timeOfDay: "morning",
  sortOrder: 0,
  taken: false,
  ...overrides,
});

describe("selectTimelineRenderOrder", () => {
  it("returns empty orderedBuckets for empty input", () => {
    const { orderedBuckets, grouped } = selectTimelineRenderOrder([]);
    expect(orderedBuckets).toEqual([]);
    expect(grouped).toEqual({});
  });

  it("orders known buckets per DISPLAY_ORDER, omitting empty ones", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "bedtime" }),
      makeEvent({ id: "2", timeOfDay: "morning" }),
    ];
    const { orderedBuckets } = selectTimelineRenderOrder(events);
    expect(orderedBuckets.indexOf("morning")).toBeLessThan(
      orderedBuckets.indexOf("bedtime"),
    );
    expect(orderedBuckets).not.toContain("midday");
  });

  it("appends unknown bucket keys after known ones", () => {
    const events = [
      makeEvent({ id: "1", timeOfDay: "morning" }),
      makeEvent({ id: "2", timeOfDay: "customBucket" as string }),
    ];
    const { orderedBuckets } = selectTimelineRenderOrder(events);
    expect(orderedBuckets[orderedBuckets.length - 1]).toBe("customBucket");
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
});

import type { DoseEvent } from "../types/timeline";
import {
  groupByTimeOfDay,
  getUnknownBucketKeys,
  DISPLAY_ORDER,
} from "../utils/timeline";

export type GroupedEvents = Record<string, DoseEvent[]>;

export type TimelineRenderOrder = {
  orderedBuckets: string[];
  grouped: GroupedEvents;
};

export function selectTimelineRenderOrder(
  events: DoseEvent[],
): TimelineRenderOrder {
  const grouped = groupByTimeOfDay(events);
  const unknownKeys = getUnknownBucketKeys(grouped);
  const orderedBuckets = [
    ...DISPLAY_ORDER.filter((tod) => (grouped[tod]?.length ?? 0) > 0),
    ...unknownKeys.sort(),
  ];
  return { orderedBuckets, grouped };
}

export function selectDosedCount(events: DoseEvent[]): number {
  return events.filter((e) => e.taken).length;
}

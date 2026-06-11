import { createSelector } from "reselect";
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

const selectEvents = (events: DoseEvent[]) => events;

export const selectGroupedEvents = createSelector(
  selectEvents,
  groupByTimeOfDay,
);

export const selectUnknownBucketKeys = createSelector(
  selectGroupedEvents,
  getUnknownBucketKeys,
);

export const selectOrderedBuckets = createSelector(
  selectGroupedEvents,
  selectUnknownBucketKeys,
  (grouped, unknownKeys): string[] => [
    ...DISPLAY_ORDER.filter((tod) => (grouped[tod]?.length ?? 0) > 0),
    ...[...unknownKeys].sort(),
  ],
);

export const selectTimelineRenderOrder = createSelector(
  selectOrderedBuckets,
  selectGroupedEvents,
  (orderedBuckets, grouped): TimelineRenderOrder => ({ orderedBuckets, grouped }),
);

export const selectDosedCount = createSelector(
  selectEvents,
  (events): number => events.filter((e) => e.taken).length,
);

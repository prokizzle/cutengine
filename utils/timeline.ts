import type { DoseEvent } from "../types/timeline";

export const BUCKET_LABELS: Record<string, string> = {
  morning: "MORNING",
  midday: "MIDDAY",
  afternoon: "AFTERNOON",
  withMeals: "WITH MEALS",
  evening: "EVENING",
  bedtime: "BEDTIME",
  anytime: "ANYTIME",
};

export const DISPLAY_ORDER = [
  "morning",
  "midday",
  "afternoon",
  "withMeals",
  "evening",
  "bedtime",
  "anytime",
];

export function groupByTimeOfDay(
  events: DoseEvent[],
): Record<string, DoseEvent[]> {
  const grouped: Record<string, DoseEvent[]> = {};
  for (const e of events) {
    const key = e.timeOfDay ?? "anytime";
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(e);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key]!.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return grouped;
}

export function getBucketLabel(key: string): string {
  return BUCKET_LABELS[key] ?? key.toUpperCase();
}

export function getUnknownBucketKeys(
  grouped: Record<string, DoseEvent[]>,
): string[] {
  return Object.keys(grouped).filter((k) => !DISPLAY_ORDER.includes(k));
}

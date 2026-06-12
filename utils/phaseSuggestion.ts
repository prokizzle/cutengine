import type { Phase, UserProfile } from "../modules/expo-cycle-store/src/userProfile";

// CUTIOS-22 — advisory phase-change suggestions from weight trends.
// Compares two adjacent 14-day rolling averages to smooth daily fluctuation.
// Never auto-switches; callers render the suggestion as a dismissible card.

export interface WeightSample {
  date: string; // ISO 8601
  kg: number;
}

export type PhaseSuggestionKind =
  | "cut-gaining" // sustained gain during a cut
  | "bulk-losing" // sustained loss during a bulk → likely under-eating
  | "plateau" // no movement while targeting a change
  | "bulk-bf-rising"; // gaining as planned but body fat trending up

export interface PhaseSuggestion {
  kind: PhaseSuggestionKind;
  title: string;
  body: string;
  /** Observed trend over the comparison window, kg/week. */
  trendKgPerWeek: number;
}

const WINDOW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Trend magnitudes below this read as a plateau, above as sustained movement. */
const PLATEAU_KG_PER_WEEK = 0.05;
const SUSTAINED_KG_PER_WEEK = 0.15;
const MIN_SAMPLES_PER_WINDOW = 3;

/** One representative weight per calendar day (the latest weigh-in wins), so
 *  days with multiple entries don't outweigh single-entry days. */
function collapseByDay(samples: WeightSample[]): { time: number; kg: number }[] {
  const byDay = new Map<string, { time: number; kg: number }>();
  for (const sample of samples) {
    const time = new Date(sample.date).getTime();
    if (Number.isNaN(time)) continue;
    const dayKey = new Date(time).toISOString().slice(0, 10);
    const existing = byDay.get(dayKey);
    if (!existing || time > existing.time) {
      byDay.set(dayKey, { time, kg: sample.kg });
    }
  }
  return [...byDay.values()];
}

function windowAverage(
  daily: { time: number; kg: number }[],
  from: number,
  to: number,
): number | null {
  const values = daily.filter((s) => s.time >= from && s.time < to).map((s) => s.kg);
  if (values.length < MIN_SAMPLES_PER_WINDOW) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Rolling trend in kg/week from two adjacent 14-day windows, or null if
 *  either window has too few sampled days to be trustworthy. */
export function weightTrendKgPerWeek(
  samples: WeightSample[],
  now: Date = new Date(),
): number | null {
  const daily = collapseByDay(samples);
  const end = now.getTime();
  const mid = end - WINDOW_DAYS * DAY_MS;
  const start = mid - WINDOW_DAYS * DAY_MS;
  const recent = windowAverage(daily, mid, end);
  const prior = windowAverage(daily, start, mid);
  if (recent == null || prior == null) return null;
  return (recent - prior) / (WINDOW_DAYS / 7);
}

export function suggestPhaseChange(
  samples: WeightSample[],
  profile: Pick<UserProfile, "currentPhase" | "targetWeightDeltaPerWeekKg">,
  opts: { now?: Date; bodyFatRising?: boolean } = {},
): PhaseSuggestion | null {
  const trend = weightTrendKgPerWeek(samples, opts.now);
  if (trend == null) return null;

  const phase: Phase = profile.currentPhase;

  if (phase === "cut" && trend >= SUSTAINED_KG_PER_WEEK) {
    return {
      kind: "cut-gaining",
      title: "Weight trending up during your cut",
      body: "Your 2-week average is rising. Consider switching to maintenance, or revisit your deficit target.",
      trendKgPerWeek: trend,
    };
  }

  if (phase === "bulk" && trend <= -SUSTAINED_KG_PER_WEEK) {
    return {
      kind: "bulk-losing",
      title: "Weight trending down during your bulk",
      body: "Your 2-week average is falling — you may be under-eating for your surplus target.",
      trendKgPerWeek: trend,
    };
  }

  if (phase === "bulk" && trend >= SUSTAINED_KG_PER_WEEK && opts.bodyFatRising) {
    return {
      kind: "bulk-bf-rising",
      title: "Body fat climbing with your bulk",
      body: "Weight is up but body fat is trending with it. Consider a leaner surplus tier.",
      trendKgPerWeek: trend,
    };
  }

  const targetingChange =
    (phase === "cut" || phase === "bulk") && profile.targetWeightDeltaPerWeekKg !== 0;
  if (targetingChange && Math.abs(trend) < PLATEAU_KG_PER_WEEK) {
    return {
      kind: "plateau",
      title: "Plateau detected",
      body:
        phase === "cut"
          ? "Weight has been flat for 2+ weeks. Consider a refeed week or switching phase."
          : "Weight has been flat for 2+ weeks. Consider increasing your surplus or switching phase.",
      trendKgPerWeek: trend,
    };
  }

  return null;
}

import type { Phase, UserProfile } from "../modules/expo-cycle-store/src/userProfile";
import type { BiofeedbackEntry } from "../modules/expo-cycle-store/src/biofeedback";

// CUTIOS-12 / CUTIOS-20 — deterministic synthetic check-in histories for
// evaluating the compliance predictor (unit tests +
// scripts/eval-compliance-model.ts). Not imported by app code.

/** Mulberry32 — tiny seedable PRNG so evaluations are reproducible. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SyntheticPhaseSpec {
  phase: Phase;
  days: number;
  /** P(miss) by day of week, index 0 = Sunday .. 6 = Saturday. */
  missByDow: number[];
}

export interface SyntheticHistory {
  entries: BiofeedbackEntry[];
  profile: Pick<UserProfile, "currentPhase" | "phaseStartDate">;
  /** Pass as `now` wherever the predictor takes one — the day after the
   *  last generated day, so the whole history lands in the training grid. */
  now: Date;
}

/**
 * Consecutive phases of check-in history ending yesterday (relative to the
 * returned `now`). Each day is missed with its phase's day-of-week
 * probability; completed days get a plausible 5-answer entry.
 */
export function generateHistory(
  specs: SyntheticPhaseSpec[],
  opts: { seed?: number; now?: Date } = {},
): SyntheticHistory {
  const rand = mulberry32(opts.seed ?? 1);
  const now = opts.now ?? new Date(2026, 5, 10, 9, 0, 0);
  const totalDays = specs.reduce((sum, s) => sum + s.days, 0);

  const dayAt = (offsetFromStart: number) =>
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - totalDays + offsetFromStart,
      8,
      30,
    );

  const entries: BiofeedbackEntry[] = [];
  let offset = 0;
  let lastPhaseStart = dayAt(0);
  for (const spec of specs) {
    lastPhaseStart = dayAt(offset);
    for (let i = 0; i < spec.days; i++, offset++) {
      const date = dayAt(offset);
      if (rand() < spec.missByDow[date.getDay()]) continue;
      entries.push({
        id: `synthetic-${offset}`,
        date: date.toISOString(),
        phase: spec.phase,
        answers: Array.from({ length: 5 }, (_, q) => ({
          questionID: `q-${q}`,
          prompt: `Question ${q}`,
          score: 1 + Math.floor(rand() * 5),
        })),
      });
    }
  }

  const lastSpec = specs[specs.length - 1];
  return {
    entries,
    profile: {
      currentPhase: lastSpec.phase,
      phaseStartDate: lastPhaseStart.toISOString(),
    },
    now,
  };
}

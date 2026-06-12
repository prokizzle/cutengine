import type { Phase, UserProfile } from "../modules/expo-cycle-store/src/userProfile";
import type { BiofeedbackEntry } from "../modules/expo-cycle-store/src/biofeedback";

// CUTIOS-12 / CUTIOS-20 — training data for the compliance miss predictor.
// Builds a contiguous local-calendar day grid from the user's check-in history:
// days without an entry are the "missed" labels the model learns from. Phase
// is carried forward across missed days (and overridden by the profile's
// current phase from phaseStartDate onward) so cross-phase training never has
// gaps at phase transitions.

export const PHASES: Phase[] = ["cut", "bulk", "maintenance"];

export interface ComplianceDayRecord {
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  dayOfWeek: number; // 0 = Sunday .. 6 = Saturday
  phase: Phase;
  checkedIn: boolean;
  /** Mean answer score (1..5) for the day's entry, null when missed. */
  meanScore: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

export function localDayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function meanAnswerScore(entry: BiofeedbackEntry): number | null {
  if (entry.answers.length === 0) return null;
  const sum = entry.answers.reduce((acc, a) => acc + a.score, 0);
  return sum / entry.answers.length;
}

/**
 * Day grid from the first check-in through yesterday (today is excluded —
 * it's the day being predicted, and "no entry yet" isn't a miss until the
 * day ends). Returns [] when there is no usable history.
 */
export function buildDayRecords(
  entries: BiofeedbackEntry[],
  profile: Pick<UserProfile, "currentPhase" | "phaseStartDate">,
  now: Date = new Date(),
): ComplianceDayRecord[] {
  const byDay = new Map<string, { time: number; phase: Phase; meanScore: number | null }>();
  for (const entry of entries) {
    const time = new Date(entry.date).getTime();
    if (Number.isNaN(time)) continue;
    const key = localDayKey(new Date(time));
    const existing = byDay.get(key);
    if (!existing || time > existing.time) {
      byDay.set(key, { time, phase: entry.phase, meanScore: meanAnswerScore(entry) });
    }
  }
  if (byDay.size === 0) return [];

  const firstTime = Math.min(...[...byDay.values()].map((v) => v.time));
  const first = startOfDay(new Date(firstTime));
  const end = addDays(startOfDay(now), -1); // yesterday, inclusive

  const phaseStart = new Date(profile.phaseStartDate).getTime();
  const phaseStartDay = Number.isNaN(phaseStart) ? null : startOfDay(new Date(phaseStart));

  const records: ComplianceDayRecord[] = [];
  let carriedPhase: Phase = byDay.get(localDayKey(first))?.phase ?? profile.currentPhase;
  for (let cursor = first; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
    const dayEntry = byDay.get(localDayKey(cursor));
    if (dayEntry) {
      carriedPhase = dayEntry.phase;
    } else if (phaseStartDay && cursor.getTime() >= phaseStartDay.getTime()) {
      // Missed days inside the current phase window take the profile's phase,
      // so a transition with no check-ins yet still labels days correctly.
      carriedPhase = profile.currentPhase;
    }
    records.push({
      day: localDayKey(cursor),
      dayOfWeek: cursor.getDay(),
      phase: carriedPhase,
      checkedIn: dayEntry != null,
      meanScore: dayEntry?.meanScore ?? null,
    });
  }
  return records;
}

// --- Feature extraction -----------------------------------------------------

/** What the model knows about the day it's predicting, independent of history. */
export interface PredictionTarget {
  dayOfWeek: number;
  phase: Phase;
}

const DAYS_SINCE_CAP = 14;
const STREAK_CAP = 14;
const RECENT_SCORE_WINDOW = 3;
const DAYS_INTO_PHASE_CAP = 56;

export const FEATURE_NAMES = [
  "dow-sun",
  "dow-mon",
  "dow-tue",
  "dow-wed",
  "dow-thu",
  "dow-fri",
  "dow-sat",
  "days-since-last-check-in",
  "check-in-streak",
  "rate-7d",
  "rate-28d",
  "mean-recent-score",
  "phase-cut",
  "phase-bulk",
  "phase-maintenance",
  "days-into-phase",
] as const;

export const FEATURE_COUNT = FEATURE_NAMES.length;

/**
 * Feature vector for predicting `target`, using only days strictly before it.
 * All features are scaled to roughly [0, 1] so a single learning rate works.
 */
export function featuresFor(history: ComplianceDayRecord[], target: PredictionTarget): number[] {
  const dowOneHot = Array.from({ length: 7 }, (_, i) => (i === target.dayOfWeek ? 1 : 0));

  let daysSinceLast = DAYS_SINCE_CAP;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].checkedIn) {
      daysSinceLast = Math.min(history.length - i, DAYS_SINCE_CAP);
      break;
    }
  }

  let streak = 0;
  for (let i = history.length - 1; i >= 0 && history[i].checkedIn; i--) streak++;
  streak = Math.min(streak, STREAK_CAP);

  const rate = (window: number): number => {
    const slice = history.slice(-window);
    if (slice.length === 0) return 0.5;
    return slice.filter((r) => r.checkedIn).length / slice.length;
  };

  const recentScores: number[] = [];
  for (let i = history.length - 1; i >= 0 && recentScores.length < RECENT_SCORE_WINDOW; i--) {
    if (history[i].meanScore != null) recentScores.push(history[i].meanScore as number);
  }
  const meanRecentScore =
    recentScores.length === 0
      ? 0.5
      : (recentScores.reduce((a, b) => a + b, 0) / recentScores.length - 1) / 4;

  let daysIntoPhase = 0;
  for (let i = history.length - 1; i >= 0 && history[i].phase === target.phase; i--) {
    daysIntoPhase++;
  }
  daysIntoPhase = Math.min(daysIntoPhase, DAYS_INTO_PHASE_CAP);

  return [
    ...dowOneHot,
    daysSinceLast / DAYS_SINCE_CAP,
    streak / STREAK_CAP,
    rate(7),
    rate(28),
    meanRecentScore,
    ...PHASES.map((p) => (p === target.phase ? 1 : 0)),
    daysIntoPhase / DAYS_INTO_PHASE_CAP,
  ];
}

// --- Training set -----------------------------------------------------------

export interface TrainingSet {
  xs: number[][];
  /** 1 = missed the check-in that day, 0 = completed it. */
  ys: number[];
}

/** Rows need this many prior days so rolling features have real context. */
export const MIN_FEATURE_HISTORY_DAYS = 7;

/**
 * One labeled row per day with enough history. `phaseFilter` restricts target
 * days to a single phase — used to compare single-phase vs cross-phase models
 * (CUTIOS-20); history windows still see all prior days either way.
 */
export function buildTrainingSet(
  records: ComplianceDayRecord[],
  opts: { phaseFilter?: Phase } = {},
): TrainingSet {
  const xs: number[][] = [];
  const ys: number[] = [];
  for (let i = MIN_FEATURE_HISTORY_DAYS; i < records.length; i++) {
    const target = records[i];
    if (opts.phaseFilter && target.phase !== opts.phaseFilter) continue;
    xs.push(featuresFor(records.slice(0, i), target));
    ys.push(target.checkedIn ? 0 : 1);
  }
  return { xs, ys };
}

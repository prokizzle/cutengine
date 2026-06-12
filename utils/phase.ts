import type { Phase, UserProfile } from "../modules/expo-cycle-store/src/userProfile";

export const PHASE_LABEL: Record<Phase, string> = {
  cut: "Cut",
  bulk: "Bulk",
  maintenance: "Maintenance",
};

const PHASE_GERUND: Record<Phase, string> = {
  cut: "Cutting",
  bulk: "Bulking",
  maintenance: "Maintaining",
};

/** Badge/accent hex per phase: cut red, bulk green, maintenance blue (design tokens). */
export const PHASE_COLOR: Record<Phase, string> = {
  cut: "#ff3b30",
  bulk: "#34c759",
  maintenance: "#007aff",
};

export function phaseDurationWeeks(phaseStartDate: string, now: Date = new Date()): number {
  const start = new Date(phaseStartDate).getTime();
  if (Number.isNaN(start)) return 0;
  const weeks = Math.floor((now.getTime() - start) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, weeks);
}

/** "Bulking for 12 weeks" — week 0 reads as "this week". */
export function phaseDurationLabel(
  profile: Pick<UserProfile, "currentPhase" | "phaseStartDate">,
  now: Date = new Date(),
): string {
  const gerund = PHASE_GERUND[profile.currentPhase];
  const weeks = phaseDurationWeeks(profile.phaseStartDate, now);
  if (weeks === 0) return `${gerund} since this week`;
  return `${gerund} for ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

/** "Bulk Week 8" style label for the dashboard status line. */
export function phaseWeekLabel(
  profile: Pick<UserProfile, "currentPhase" | "phaseStartDate">,
  now: Date = new Date(),
): string {
  const week = phaseDurationWeeks(profile.phaseStartDate, now) + 1;
  return `${PHASE_LABEL[profile.currentPhase]} Week ${week}`;
}

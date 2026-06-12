import type { Phase } from "../modules/expo-cycle-store/src/userProfile";
import type { BiofeedbackAnswer } from "../modules/expo-cycle-store/src/biofeedback";

// CUTIOS-21 — phase-specific check-in question sets. Entries persist the
// prompt text alongside the questionID, so editing these sets never
// retroactively changes historical entries.

export interface BiofeedbackQuestion {
  id: string;
  prompt: string;
  /** 1 = minLabel, 5 = maxLabel. */
  minLabel: string;
  maxLabel: string;
}

const CUT_QUESTIONS: BiofeedbackQuestion[] = [
  { id: "cut-hunger", prompt: "How manageable was your hunger today?", minLabel: "Ravenous", maxLabel: "No hunger" },
  { id: "cut-energy", prompt: "How were your energy levels?", minLabel: "Drained", maxLabel: "Energized" },
  { id: "cut-mood", prompt: "How was your mood?", minLabel: "Irritable", maxLabel: "Great" },
  { id: "cut-sleep", prompt: "How well did you sleep?", minLabel: "Poorly", maxLabel: "Deeply" },
  { id: "cut-cravings", prompt: "How strong were cravings today?", minLabel: "Overwhelming", maxLabel: "None" },
];

const BULK_QUESTIONS: BiofeedbackQuestion[] = [
  { id: "bulk-training-intensity", prompt: "How intense was your training today?", minLabel: "Flat", maxLabel: "Peak output" },
  { id: "bulk-appetite", prompt: "How was your appetite for your calorie target?", minLabel: "Forcing food", maxLabel: "Easily hit it" },
  { id: "bulk-recovery", prompt: "How recovered do you feel from training?", minLabel: "Beat up", maxLabel: "Fully fresh" },
  { id: "bulk-sleep-quality", prompt: "How was your sleep quality?", minLabel: "Poor", maxLabel: "Excellent" },
  { id: "bulk-body-comp", prompt: "How lean do you feel you're staying?", minLabel: "Getting soft", maxLabel: "Staying tight" },
];

const MAINTENANCE_QUESTIONS: BiofeedbackQuestion[] = [
  { id: "maint-energy", prompt: "How were your energy levels?", minLabel: "Drained", maxLabel: "Energized" },
  { id: "maint-adherence", prompt: "How easy was it to eat at maintenance?", minLabel: "A struggle", maxLabel: "Effortless" },
  { id: "maint-sleep", prompt: "How well did you sleep?", minLabel: "Poorly", maxLabel: "Deeply" },
  { id: "maint-stress", prompt: "How manageable was stress today?", minLabel: "Overwhelming", maxLabel: "Calm" },
];

const QUESTIONS_BY_PHASE: Record<Phase, BiofeedbackQuestion[]> = {
  cut: CUT_QUESTIONS,
  bulk: BULK_QUESTIONS,
  maintenance: MAINTENANCE_QUESTIONS,
};

export function questionsForPhase(phase: Phase): BiofeedbackQuestion[] {
  return QUESTIONS_BY_PHASE[phase];
}

/** Build persistable answers from a question→score map, skipping unanswered. */
export function buildAnswers(
  questions: BiofeedbackQuestion[],
  scores: Record<string, number | undefined>,
): BiofeedbackAnswer[] {
  return questions.flatMap((q) => {
    const score = scores[q.id];
    return score == null ? [] : [{ questionID: q.id, prompt: q.prompt, score }];
  });
}

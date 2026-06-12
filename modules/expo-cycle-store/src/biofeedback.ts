// Biofeedback entry types — mirrors ios/Sources/Types/BiofeedbackEntry.swift.
// Question sets live app-side (utils/biofeedback.ts); the store only persists
// answered entries with their original prompt text (CUTIOS-21).

import type { Phase } from "./userProfile";

export interface BiofeedbackAnswer {
  questionID: string;
  prompt: string; // captured at entry time so history keeps its context
  score: number; // 1 (worst) .. 5 (best)
}

export interface BiofeedbackEntry {
  id: string;
  date: string; // ISO 8601
  phase: Phase;
  answers: BiofeedbackAnswer[];
}

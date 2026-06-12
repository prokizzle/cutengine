import type { Phase, UserProfile } from "../modules/expo-cycle-store/src/userProfile";
import type { BiofeedbackEntry } from "../modules/expo-cycle-store/src/biofeedback";
import {
  buildDayRecords,
  buildTrainingSet,
  featuresFor,
  type ComplianceDayRecord,
} from "./complianceDataset";
import { predictProbability, trainLogistic, type LogisticModel } from "./logisticRegression";

// CUTIOS-12 / CUTIOS-20 — predicts whether the user is likely to miss today's
// check-in, trained on their own cross-phase history (see
// docs/compliance-prediction.md). Advisory only: callers surface the risk as
// a dismissible card, never as an automatic action.

/** Below this many history days the model isn't trained; a day-of-week
 *  heuristic answers instead. */
export const MIN_TRAINING_DAYS = 30;
/** Below this many history days no prediction is made at all. */
export const MIN_HEURISTIC_DAYS = 7;

export const HIGH_RISK_THRESHOLD = 0.6;
export const MODERATE_RISK_THRESHOLD = 0.35;

export type RiskLevel = "low" | "moderate" | "high";

export interface MissPrediction {
  /** Probability of missing today's check-in, 0..1. */
  probability: number;
  level: RiskLevel;
  source: "model" | "heuristic";
}

export function riskLevelFor(probability: number): RiskLevel {
  if (probability >= HIGH_RISK_THRESHOLD) return "high";
  if (probability >= MODERATE_RISK_THRESHOLD) return "moderate";
  return "low";
}

/** Positive-class weight bounded so a near-perfect streak can't blow up loss. */
function positiveWeightFor(ys: number[]): number {
  const positives = ys.filter((y) => y === 1).length;
  if (positives === 0) return 1;
  return Math.min(4, Math.max(1, (ys.length - positives) / positives));
}

export function trainComplianceModel(records: ComplianceDayRecord[]): LogisticModel | null {
  if (records.length < MIN_TRAINING_DAYS) return null;
  const { xs, ys } = buildTrainingSet(records);
  if (xs.length === 0) return null;
  return trainLogistic(xs, ys, { positiveWeight: positiveWeightFor(ys) });
}

/** Laplace-smoothed miss rate so tiny samples don't read as certainty. */
function smoothedMissRate(records: ComplianceDayRecord[]): number {
  const misses = records.filter((r) => !r.checkedIn).length;
  return (misses + 1) / (records.length + 2);
}

function heuristicPrediction(
  records: ComplianceDayRecord[],
  dayOfWeek: number,
): MissPrediction {
  const sameDow = records.filter((r) => r.dayOfWeek === dayOfWeek);
  const probability = (smoothedMissRate(sameDow) + smoothedMissRate(records)) / 2;
  return { probability, level: riskLevelFor(probability), source: "heuristic" };
}

/**
 * Risk of missing today's check-in. Trains on the full day grid (all phases —
 * cross-phase learning), with today's phase taken from the profile, so the
 * first day after a phase switch still gets a prediction.
 */
export function predictTodayMissRisk(
  entries: BiofeedbackEntry[],
  profile: Pick<UserProfile, "currentPhase" | "phaseStartDate">,
  now: Date = new Date(),
): MissPrediction | null {
  const records = buildDayRecords(entries, profile, now);
  if (records.length < MIN_HEURISTIC_DAYS) return null;

  const target = { dayOfWeek: now.getDay(), phase: profile.currentPhase };
  const model = trainComplianceModel(records);
  if (!model) return heuristicPrediction(records, target.dayOfWeek);

  const probability = predictProbability(model, featuresFor(records, target));
  return { probability, level: riskLevelFor(probability), source: "model" };
}

// --- Evaluation (CUTIOS-20 acceptance: single-phase vs cross-phase) ---------

export interface ModelEvaluation {
  accuracy: number;
  /** Mean of miss-recall and check-in-recall — fair under class imbalance,
   *  where raw accuracy rewards predicting "never miss". Null when the test
   *  split has only one class. */
  balancedAccuracy: number | null;
  /** Null when the model predicted no positives / there were no positives. */
  precision: number | null;
  recall: number | null;
  trainRows: number;
  testRows: number;
  /** Share of missed days in the test split — the baseline to beat. */
  testMissRate: number;
}

const TRAIN_SPLIT = 0.75;
const MIN_TRAIN_ROWS = 10;
const MIN_TEST_ROWS = 4;

/**
 * Chronological split (no shuffling — the model must predict the future, not
 * interpolate it). `phaseFilter` evaluates a single-phase variant for
 * comparison against the cross-phase default.
 */
export function evaluateModel(
  records: ComplianceDayRecord[],
  opts: { phaseFilter?: Phase } = {},
): ModelEvaluation | null {
  const { xs, ys } = buildTrainingSet(records, opts);
  const trainRows = Math.floor(xs.length * TRAIN_SPLIT);
  const testRows = xs.length - trainRows;
  if (trainRows < MIN_TRAIN_ROWS || testRows < MIN_TEST_ROWS) return null;

  const trainYs = ys.slice(0, trainRows);
  const model = trainLogistic(xs.slice(0, trainRows), trainYs, {
    positiveWeight: positiveWeightFor(trainYs),
  });

  let correct = 0;
  let truePositives = 0;
  let trueNegatives = 0;
  let predictedPositives = 0;
  let actualPositives = 0;
  for (let i = trainRows; i < xs.length; i++) {
    const predicted = predictProbability(model, xs[i]) >= 0.5 ? 1 : 0;
    if (predicted === ys[i]) correct++;
    if (predicted === 1) predictedPositives++;
    if (ys[i] === 1) actualPositives++;
    if (predicted === 1 && ys[i] === 1) truePositives++;
    if (predicted === 0 && ys[i] === 0) trueNegatives++;
  }

  const actualNegatives = testRows - actualPositives;
  return {
    accuracy: correct / testRows,
    balancedAccuracy:
      actualPositives === 0 || actualNegatives === 0
        ? null
        : (truePositives / actualPositives + trueNegatives / actualNegatives) / 2,
    precision: predictedPositives === 0 ? null : truePositives / predictedPositives,
    recall: actualPositives === 0 ? null : truePositives / actualPositives,
    trainRows,
    testRows,
    testMissRate: actualPositives / testRows,
  };
}

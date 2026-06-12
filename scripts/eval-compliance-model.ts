// CUTIOS-12 / CUTIOS-20 — reproduces the evaluation table in
// docs/compliance-prediction.md. Run with: bun scripts/eval-compliance-model.ts

import { buildDayRecords } from "../utils/complianceDataset";
import { evaluateModel, type ModelEvaluation } from "../utils/compliancePredictor";
import { generateHistory, type SyntheticPhaseSpec } from "../utils/syntheticCompliance";

const WEEKEND_MISS = [0.85, 0.08, 0.08, 0.08, 0.08, 0.08, 0.85];
const FRIDAY_MISS = [0.05, 0.05, 0.05, 0.05, 0.05, 0.8, 0.05];
const ERRATIC_MISS = [0.4, 0.25, 0.3, 0.25, 0.3, 0.35, 0.4];

interface Scenario {
  name: string;
  specs: SyntheticPhaseSpec[];
  seeds: number[];
}

const SCENARIOS: Scenario[] = [
  {
    name: "Weekend skipper, single 90-day cut",
    specs: [{ phase: "cut", days: 90, missByDow: WEEKEND_MISS }],
    seeds: [1, 7, 13, 29, 43],
  },
  {
    name: "Friday skipper, 85-day bulk → 35-day cut",
    specs: [
      { phase: "bulk", days: 85, missByDow: FRIDAY_MISS },
      { phase: "cut", days: 35, missByDow: FRIDAY_MISS },
    ],
    seeds: [1, 7, 11, 29, 43],
  },
  {
    name: "Erratic logger, 60-day maintenance → 45-day cut",
    specs: [
      { phase: "maintenance", days: 60, missByDow: ERRATIC_MISS },
      { phase: "cut", days: 45, missByDow: ERRATIC_MISS },
    ],
    seeds: [1, 7, 11, 29, 43],
  },
];

function fmt(value: number | null): string {
  return value == null ? "n/a" : value.toFixed(3);
}

function describe(label: string, evals: (ModelEvaluation | null)[]): void {
  const usable = evals.filter((e): e is ModelEvaluation => e != null);
  if (usable.length === 0) {
    console.log(`  ${label}: insufficient rows to evaluate`);
    return;
  }
  const mean = (pick: (e: ModelEvaluation) => number | null): number | null => {
    const values = usable.map(pick).filter((v): v is number => v != null);
    return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
  };
  console.log(
    `  ${label}: accuracy ${fmt(mean((e) => e.accuracy))}  balanced ${fmt(
      mean((e) => e.balancedAccuracy),
    )}  precision ${fmt(mean((e) => e.precision))}  recall ${fmt(mean((e) => e.recall))}  ` +
      `(test miss rate ${fmt(mean((e) => e.testMissRate))}, ` +
      `${usable[0].trainRows}/${usable[0].testRows} train/test rows, n=${usable.length} seeds)`,
  );
}

for (const scenario of SCENARIOS) {
  console.log(`\n${scenario.name}`);
  const lastPhase = scenario.specs[scenario.specs.length - 1].phase;
  const cross: (ModelEvaluation | null)[] = [];
  const single: (ModelEvaluation | null)[] = [];
  for (const seed of scenario.seeds) {
    const { entries, profile, now } = generateHistory(scenario.specs, { seed });
    const records = buildDayRecords(entries, profile, now);
    cross.push(evaluateModel(records));
    single.push(evaluateModel(records, { phaseFilter: lastPhase }));
  }
  describe("cross-phase ", cross);
  describe("single-phase", single);
}

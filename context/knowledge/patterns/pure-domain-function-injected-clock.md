# Pattern: Pure Domain Function With an Injected Clock

## Description

Domain logic lives in exported pure functions that take everything they need as arguments — including the current time, passed as a trailing parameter with a default. No domain function reads the clock, the store, or any module-level mutable state.

## When to Use

Every calculation in `utils/`, and the pure helpers inside a native module's `src/`. If a function's answer depends on what day it is, it takes `now` as a parameter.

Do not use for functions that must perform I/O — those belong in `lib/` or a hook.

## Pattern

- Inputs are plain data. Outputs are plain data.
- The current time arrives last, as `now: Date = new Date()`.
- Invalid or insufficient input returns an absent value rather than a guess. See [Pattern: Null Means Insufficient Evidence](null-means-insufficient-evidence.md).
- The test passes a frozen date literal. There are no fake timers anywhere in this repository.

## Example

```ts
export function phaseDurationWeeks(phaseStartDate: string, now: Date = new Date()): number {
  const start = new Date(phaseStartDate).getTime();
  if (Number.isNaN(start)) return 0;
  const weeks = Math.floor((now.getTime() - start) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, weeks);
}
```
`utils/phase.ts:22`

The corresponding test never touches global time:

```ts
const NOW = new Date("2026-06-12T12:00:00.000Z");
```
`utils/phaseSuggestion.test.ts`

The same trailing-parameter convention carries through the deeper logic, where several days of history are reconstructed relative to the injected moment:

```ts
const records = buildDayRecords(entries, profile, now);
```
`utils/compliancePredictor.ts:79`

## Files Using This Pattern

- `utils/phase.ts` — phase week counting and labels
- `utils/phaseSuggestion.ts` — rolling-average trend comparison
- `utils/complianceDataset.ts` — day-grid construction and feature engineering
- `utils/compliancePredictor.ts` — prediction and evaluation entry points
- `utils/calorieTargets.ts` — target and macro arithmetic (no clock needed; pure on its inputs)
- `utils/biofeedback.ts` — question lookup and answer assembly
- `utils/timeline.ts` — dose-event bucketing
- `modules/expo-cycle-store/src/userProfile.ts` — profile transforms, with `now` injectable via an options argument

## Related

- [Decision: Colocated Tests and Type-Check CI](../../decisions/016-colocated-tests-and-ci.md)
- [Decision: Rolling-Average Trend Detection](../../decisions/017-rolling-average-trend-detection.md)
- [Decision: Thermodynamic Calorie Targets](../../decisions/008-thermodynamic-calorie-targets.md)
- [Decision: Compliance Prediction Model](../../decisions/009-compliance-prediction-model.md)
- [Feature: Calorie and Macro Targets](../../intent/feature-calorie-macro-targets.md)
- [Feature: Phase Change Suggestions](../../intent/feature-phase-change-suggestions.md)
- [Pattern: Null Means Insufficient Evidence](null-means-insufficient-evidence.md)
- [Pattern: Named Thresholds With Recorded Rationale](named-thresholds-with-rationale.md)
- [Pattern: Colocated Test Conventions](colocated-test-conventions.md)
- [Pattern: Seeded PRNG Test Fixture](seeded-prng-test-fixture.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active

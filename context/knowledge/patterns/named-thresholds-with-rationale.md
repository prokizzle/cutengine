# Pattern: Named Thresholds With Recorded Rationale

## Description

Every magic number in the domain layer is a named module-level constant, and every constant that encodes a judgment carries a comment saying what it distinguishes. The comment explains the *decision*, not the arithmetic.

## When to Use

Any numeric threshold, window length, cap, or sufficiency minimum in domain logic. If changing the number would change what the app tells a user, it needs a name and a reason.

Not needed for arithmetic constants whose meaning is universal — grams-to-calories conversion factors are self-describing.

## Pattern

- Declare at module scope, above the functions that use it, in upper snake case.
- Name states the unit: `PLATEAU_KG_PER_WEEK`, `MIN_SAMPLES_PER_WINDOW`, `DAYS_SINCE_CAP`.
- A comment explains the boundary it draws, in terms of user-visible behaviour.
- Where a value is a guess rather than a derived figure, say so.

## Pattern in practice

Thresholds that classify are declared together, so the relationship between them is visible:

```ts
const WINDOW_DAYS = 14;
/** Trend magnitudes below this read as a plateau, above as sustained movement. */
const PLATEAU_KG_PER_WEEK = 0.05;
const SUSTAINED_KG_PER_WEEK = 0.15;
const MIN_SAMPLES_PER_WINDOW = 3;
```
`utils/phaseSuggestion.ts:26`

Note the dead band this creates: a magnitude between the two constants is neither a plateau nor sustained movement, which is deliberate and only legible because both constants sit together.

Caps in the feature engineering are named for the scaling they impose, so a reader knows the feature is bounded rather than raw:

```ts
// DAYS_SINCE_CAP = 14, STREAK_CAP = 14, DAYS_INTO_PHASE_CAP = 56
// Each feature divides by its cap so one extreme value cannot dominate the model.
```
`utils/complianceDataset.ts`

## Files Using This Pattern

- `utils/phaseSuggestion.ts` — window length, plateau and sustained thresholds, minimum samples
- `utils/complianceDataset.ts` — feature caps and the minimum history required before a row can be emitted
- `utils/compliancePredictor.ts` — minimum days for heuristic and model tiers, risk-level thresholds, train/test split ratio and minimum row counts, positive-class weight bounds
- `utils/calorieTargets.ts` — energy per kilogram, the rate tier tables, and the bulk rate caps
- `utils/logisticRegression.ts` — default epochs, learning rate, and regularization strength
- `app/(tabs)/index.tsx` — the placeholder expenditure constant

## Related

- [Decision: Rolling-Average Trend Detection](../../decisions/017-rolling-average-trend-detection.md)
- [Decision: Compliance Prediction Model](../../decisions/009-compliance-prediction-model.md)
- [Decision: Thermodynamic Calorie Targets](../../decisions/008-thermodynamic-calorie-targets.md)
- [Feature: Phase Change Suggestions](../../intent/feature-phase-change-suggestions.md)
- [Feature: Compliance Risk Prediction](../../intent/feature-compliance-risk-prediction.md)
- [Pattern: Pure Domain Function With an Injected Clock](pure-domain-function-injected-clock.md)
- [Pattern: Null Means Insufficient Evidence](null-means-insufficient-evidence.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active

# Pattern: Null Means Insufficient Evidence

## Description

When there is not enough data to answer a question, return an absent value — never a plausible-looking default. `null` in this codebase means "we do not know," and it is distinct from a real zero.

The UI counterpart: a component receiving an absent value renders nothing rather than a placeholder number.

## When to Use

Any function whose answer requires a minimum amount of input to be meaningful: trends, rates, predictions, model evaluations, and computed targets.

Do not use where zero is a genuine answer. A user maintaining weight has a real rate of zero; a user who has not weighed in has no rate.

## Pattern

- Define the minimum evidence as a named constant.
- Guard at the top of the function and return `null`.
- Type the return as `T | null` so every caller must handle it.
- Callers either render nothing or fall back to a lower-confidence source — never substitute a number.

## Example

The sufficiency gate stated as a named constant and checked immediately:

```ts
const records = buildDayRecords(entries, profile, now);
if (records.length < MIN_HEURISTIC_DAYS) return null;
```
`utils/compliancePredictor.ts:79`

A non-positive computed calorie target is treated as no target, rather than shown:

```ts
// app/(tabs)/index.tsx — a target at or below zero means the inputs were wrong,
// so nothing is displayed and the user is prompted to log a weight instead.
```
`app/(tabs)/index.tsx:144-149`

Where a lower-confidence answer exists, the absent value cascades into it rather than into a fabricated number — the prediction ladder returns `null` under a week of history, a smoothed frequency estimate between one and four weeks, and a trained model beyond that.

## Files Using This Pattern

- `utils/compliancePredictor.ts` — `predictTodayMissRisk` and `evaluateModel` both return `null` below their thresholds
- `utils/phaseSuggestion.ts` — `weightTrendKgPerWeek` and `suggestPhaseChange` return `null` without enough sampled days per window
- `app/(tabs)/index.tsx` — `weeklyWeightDeltaLbs` returns `null` below two in-window samples; a non-positive target is coerced to absent
- `lib/healthKit.ts` — `readActiveEnergy` returns `null` rather than zero
- `lib/cycleStore.ts` — reads degrade to `null` or an empty collection on failure
- `utils/compliancePredictor.ts` — `ModelEvaluation` has nullable fields where a single-class test split makes a metric undefined
- `components/today/ComplianceRiskCard.tsx` — renders nothing at low risk

## Related

- [Decision: Compliance Prediction Model](../../decisions/009-compliance-prediction-model.md)
- [Decision: Rolling-Average Trend Detection](../../decisions/017-rolling-average-trend-detection.md)
- [Decision: Thermodynamic Calorie Targets](../../decisions/008-thermodynamic-calorie-targets.md)
- [Feature: Compliance Risk Prediction](../../intent/feature-compliance-risk-prediction.md)
- [Feature: Weight Tracking](../../intent/feature-weight-tracking.md)
- [Feature: Calorie and Macro Targets](../../intent/feature-calorie-macro-targets.md)
- [Pattern: Pure Domain Function With an Injected Clock](pure-domain-function-injected-clock.md)
- [Pattern: Self-Suppressing Card Component](self-suppressing-card-component.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](discriminated-outcome-instead-of-boolean.md)
- [Feature: Phase Change Suggestions](../../intent/feature-phase-change-suggestions.md)
- [Pattern: Named Thresholds With Recorded Rationale](named-thresholds-with-rationale.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active

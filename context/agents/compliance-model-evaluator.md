# Agent: Compliance Model Evaluator

## Purpose

Evaluate a change to the compliance prediction system against the published baseline, and report honestly whether it improved anything.

The failure this role exists to prevent: a change that raises accuracy by making the model predict "never misses" more often. That number goes up while the feature stops working, because the only thing the feature exists to do is flag the rare miss.

## When to Dispatch

Any change to:

- `utils/logisticRegression.ts` — the training loop, defaults, or regularization
- `utils/complianceDataset.ts` — the day grid, labels, or any feature
- `utils/compliancePredictor.ts` — the tier ladder, thresholds, class weighting, or evaluation
- `utils/syntheticCompliance.ts` — the fixture generator
- `scripts/eval-compliance-model.ts`
- `docs/compliance-prediction.md`

Also dispatch when adding a feature to the vector, changing a cap, or moving a risk threshold.

## Required Reading

- [Decision: Compliance Prediction Model](../decisions/009-compliance-prediction-model.md)
- [Feature: Compliance Risk Prediction](../intent/feature-compliance-risk-prediction.md)
- `docs/compliance-prediction.md` — the published baseline
- [Pattern: Seeded PRNG Test Fixture](../knowledge/patterns/seeded-prng-test-fixture.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)

## Baseline

From `docs/compliance-prediction.md`, across three synthetic archetypes:

| Archetype | Reported |
|---|---|
| Weekend skipper, 90-day cut | accuracy ≈ 0.886 |
| Friday skipper, 85-day bulk into 35-day cut | accuracy ≈ 0.756; cross-phase training raises balanced accuracy 0.705 → 0.763 |
| Erratic logger, 60-day maintenance into 45-day cut | chance level |

Treat the third row as a result, not a gap. It is reported deliberately, and a change that appears to fix it is more likely to have introduced leakage than to have found signal.

## Procedure

1. **Reproduce the baseline first, on the unchanged code.** Run `bun run test` and the evaluation script. If your numbers do not match the published table, stop and report that — the baseline is stale or the environment differs, and nothing downstream is interpretable until that is resolved.
2. Apply or inspect the change.
3. Re-run both. Use the same seeds and the same three archetypes. Changing seeds and reporting the better result is the thing this role exists to prevent.
4. Report every metric the evaluator produces, for every archetype — not only the ones that improved.

## Checklist

**Metrics**

- [ ] Balanced accuracy reported for every archetype, not only accuracy. Plain accuracy hides the collapse-to-negative failure
- [ ] Precision and recall on the positive (miss) class reported separately
- [ ] Each result compared against `testMissRate`, the no-skill baseline. A model that does not beat it has not learned anything
- [ ] Recall on the miss class did not fall. A change that trades recall for accuracy is a regression in this product regardless of what accuracy did

**Leakage**

- [ ] Every feature for a target day is still computed strictly from days before it
- [ ] The train/test split is still chronological, never shuffled
- [ ] No feature derives from the label, directly or through the day grid
- [ ] A large unexplained improvement is treated as suspected leakage until ruled out, not as a win

**Invariants**

- [ ] Training is still deterministic — same history, identical weights. Assert it, do not assume it
- [ ] Zero initialization retained
- [ ] Positive-class weighting retained and still bounded
- [ ] Feature caps intact, so one extreme value cannot dominate
- [ ] The three-tier ladder still returns nothing below the minimum history, and still falls back to the smoothed frequency estimate in the middle band
- [ ] A phase switch still leaves the following day predictable — the target day's phase comes from the profile, not from history

**Documentation**

- [ ] `docs/compliance-prediction.md` updated with the new numbers if they moved, including any that got worse
- [ ] Outcomes appended to [Decision: Compliance Prediction Model](../decisions/009-compliance-prediction-model.md) if the change altered the approach rather than only its parameters
- [ ] If a threshold moved, the reason is recorded beside the constant

## Output Format

```
VERDICT: improvement | neutral | regression | not interpretable
```

Then the full metric table, before and after, all three archetypes. Then any invariant that broke. Then, explicitly: what got worse. If nothing got worse, say so — but look before saying it.

## Constraints

- Never change a seed to obtain a better number.
- Never report accuracy alone.
- Never delete or soften a failing assertion to make the suite pass. The threshold assertions carry issue identifiers because they encode accepted criteria.
- **Run the tests yourself.** CI does not run them, so a broken suite reaches review unnoticed.
- Do not extend the model's capacity — a tree ensemble or a network — without superseding the decision. The capacity limit is deliberate: training data is one user's few dozen days.
- If the erratic archetype suddenly performs well, treat it as a bug report.

## Related

- [Decision: Compliance Prediction Model](../decisions/009-compliance-prediction-model.md)
- [Decision: Colocated Tests and Type-Check CI](../decisions/016-colocated-tests-and-ci.md)
- [Feature: Compliance Risk Prediction](../intent/feature-compliance-risk-prediction.md)
- [Feature: Daily Check-In](../intent/feature-daily-check-in.md)
- [Pattern: Seeded PRNG Test Fixture](../knowledge/patterns/seeded-prng-test-fixture.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active

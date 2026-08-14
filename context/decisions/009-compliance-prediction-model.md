# Decision: Compliance Prediction Model

## Context

The product wants to warn a user on the morning they are likely to skip their check-in. That requires predicting a binary outcome per day from a single user's short history — typically weeks, not years — entirely on the device, with no server and no cross-user training data.

Analysis and measured results are recorded in `docs/compliance-prediction.md`.

## Decision

Logistic regression trained on-device on the individual user's history, behind a three-tier fallback ladder keyed on how much history exists.

**The ladder:**

- Below roughly one week of history: predict nothing
- Between one and four weeks: a smoothed frequency estimate, averaging the miss rate for the same day of the week with the overall miss rate
- Past roughly one month: the trained model

**The model:**

- Sixteen features, all scaled to roughly zero-to-one: day-of-week one-hot, days since the last check-in, current streak, seven-day and twenty-eight-day check-in rates, a recent mean subjective score, phase one-hot, and days into the current phase — each capped so an extreme value cannot dominate
- Trained by full-batch gradient descent with L2 regularization, zero-initialized so training is deterministic
- Class imbalance handled by weighting the positive class by the ratio of negatives to positives, bounded
- Features for a given day are computed strictly from days before it
- A day with no entry is the positive label. Missing is inferred from absence, not recorded
- Risk reported at three levels against two fixed thresholds
- The target day's phase comes from the current profile, not from history, so the first day after a phase switch is still predictable

**Evaluation:** a chronological train-test split with minimum row counts, reporting accuracy, balanced accuracy, precision, recall, and the test-set miss rate as the no-skill baseline. A script reproduces the published numbers across three synthetic user archetypes and several seeds.

## Rationale

Logistic regression was chosen for reasons specific to this problem rather than as a default. Training data is one user's few dozen days, which is far too little for anything with more capacity — a tree ensemble or a small network would memorize the history and predict nothing useful. The model is small enough to train in milliseconds on the device, which is what makes the no-server constraint satisfiable. And the fitted weights are inspectable, so a wrong prediction can be explained rather than shrugged at.

Zero initialization rather than random makes training deterministic: the same history produces the same model, which is testable and means a user never sees the prediction change without their data changing.

Positive-class weighting is necessary because a compliant user misses rarely, and an unweighted model on ten percent positives converges to predicting "never misses" — accurate, and useless for the one thing the feature exists to do. The published evaluation reports balanced accuracy precisely because plain accuracy hides this.

The three-tier ladder exists because the honest answer changes with sample size. Under a week there is nothing to say. The smoothed frequency estimate covers the middle by capturing the single strongest signal — day of week — with Laplace smoothing so a user's one missed Tuesday does not become a hundred percent Tuesday miss rate. Only past a month does the full model have enough rows to beat that.

Computing features strictly from prior days prevents the model from learning to predict a day using information from that day, which would produce excellent evaluation numbers and useless predictions.

Taking the target day's phase from the profile rather than from history is what keeps the feature working across a phase switch. The alternative goes silent for the first days of every new phase, which is exactly when adherence is most fragile.

## Alternatives Considered

- **A server-side model trained across all users.** Would have far more data and better cold-start behaviour. Rejected: this app's data is sensitive, and the product's position is that it stays on the device.
- **A tree ensemble or gradient boosting.** Rejected: too much capacity for a few dozen rows, and not inspectable.
- **A day-of-week heuristic only, with no model.** This is what the middle tier is. Kept as the fallback rather than the endpoint, because the evaluation shows the model beating it once enough history exists.
- **Recording misses explicitly.** Rejected: a miss is precisely the day the user did not open the app, so nothing can record it. Absence in a contiguous day grid is the only available signal.
- **Unweighted training.** Rejected per the imbalance argument above.

## Outcomes

The published evaluation is deliberately honest about where this works and where it does not:

- On a user with a clean weekly pattern, accuracy near 0.89
- On a user who switches phase mid-history, around 0.76, with training across phases rather than within one phase improving balanced accuracy meaningfully — evidence that cross-phase history transfers
- On a genuinely erratic logger, chance-level performance, reported as such rather than omitted

The three-tier ladder means the feature is live in week two rather than month two.

The dataset construction is documented as the extension seam for predicting supplement compliance, not only check-in compliance.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Compliance Risk Prediction](../intent/feature-compliance-risk-prediction.md)
- [Feature: Daily Check-In](../intent/feature-daily-check-in.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Decision: Colocated Tests and Type-Check CI](016-colocated-tests-and-ci.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)
- [Pattern: Seeded PRNG Test Fixture](../knowledge/patterns/seeded-prng-test-fixture.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation. Measured results and feature analysis: `docs/compliance-prediction.md`.
